import mongoose from 'mongoose';
import Bid from '../models/Bid.js';
import Player from '../models/Player.js';
import Team from '../models/Team.js';
import { validateBid, getWinningBid, processWinningBid } from '../utils/bidValidator.js';

export const getAuctionState = async (req, res, next) => {
  try {
    const tournamentId = new mongoose.Types.ObjectId(req.params.tournamentId);

    // Get all players for this tournament
    const players = await Player.find({ tournamentId });
    
    // Get all teams for this tournament
    const teams = await Team.find({ tournamentId });
    
    // Get recent bids
    const recentBids = await Bid.find({ tournamentId })
      .sort({ timestamp: -1 })
      .limit(10)
      .populate('playerId', 'name')
      .populate('teamId', 'name');
    
    // Calculate auction statistics
    const totalBids = await Bid.countDocuments({ tournamentId });
    const totalPlayersSold = players.filter(p => p.isSold).length;
    const totalBudgetUsed = teams.reduce((sum, team) => {
      const used = team.totalBudget - team.remainingBudget;
      return sum + used;
    }, 0);
    
    res.json({
      players,
      teams,
      recentBids,
      stats: {
        totalBids,
        totalPlayersSold,
        totalBudgetUsed,
        activePlayers: players.filter(p => !p.isSold).length
      }
    });
  } catch (error) {
    next(error);
  }
};

export const placeBid = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const tournamentId = new mongoose.Types.ObjectId(req.params.tournamentId);
    const { amount, teamId, playerId } = req.body;
    
    // Get current winning bid
    const currentBid = await getWinningBid(tournamentId, playerId);
    const currentBidAmount = currentBid ? currentBid.amount : 0;
    
    // Validate bid
    await validateBid({ amount, teamId, playerId }, tournamentId, currentBidAmount);
    
    // Create new bid
    const bid = new Bid({
      tournamentId,
      playerId,
      teamId,
      amount,
      status: 'Active'
    });
    
    await bid.save({ session });
    
    // Mark previous bid as outbid
    if (currentBid) {
      currentBid.status = 'Outbid';
      await currentBid.save({ session });
    }
    
    await session.commitTransaction();
    
    // Populate response data
    const populatedBid = await Bid.findById(bid._id)
      .populate('playerId', 'name')
      .populate('teamId', 'name');
    
    res.status(201).json({
      message: 'Bid placed successfully',
      bid: populatedBid,
      isWinningBid: amount > currentBidAmount
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

export const getBidHistory = async (req, res, next) => {
  try {
    const tournamentId = new mongoose.Types.ObjectId(req.params.tournamentId);
    const playerId = req.params.playerId ? new mongoose.Types.ObjectId(req.params.playerId) : undefined;
    
    const bids = await Bid.find({
      tournamentId,
      ...(playerId && { playerId })
    })
    .sort({ timestamp: -1 })
    .populate('playerId', 'name')
    .populate('teamId', 'name');
    
    res.json(bids);
  } catch (error) {
    next(error);
  }
};