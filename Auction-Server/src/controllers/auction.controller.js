import mongoose from 'mongoose';
import Bid from '../models/Bid.js';
import Player from '../models/Player.js';
import Team from '../models/Team.js';
import Tournament from '../models/Tournament.js';
import { validateBid, getWinningBid, processWinningBid, cancelActiveBids } from '../utils/bidValidator.js';

export const getAuctionState = async (req, res, next) => {
  try {
    const tournamentId = new mongoose.Types.ObjectId(req.params.tournamentId);

    // Get tournament info for playerBasePrice
    const tournament = await Tournament.findById(tournamentId).select('playerBasePrice');

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
      tournament: { playerBasePrice: tournament?.playerBasePrice || 0 },
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
    const amount = Number(req.body.amount) || 0;
    const teamId = String(req.body.teamId || "");
    const playerId = String(req.body.playerId || "");

    // Check auction status
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }
    if (
      tournament.auctionStatus !== "bidding" ||
      !tournament.currentPlayerId ||
      tournament.currentPlayerId.toString() !== playerId
    ) {
      return res.status(400).json({ message: "No active auction for this player" });
    }
    
    // Get current winning bid
    const currentBid = await getWinningBid(tournamentId, playerId);
    const currentBidAmount = currentBid ? currentBid.amount : 0;
    
    // Validate bid
    await validateBid({ amount, teamId, playerId }, tournamentId, currentBidAmount);
    
    // Mark previous active bids for this player as Outbid FIRST
    await Bid.updateMany(
      { tournamentId, playerId, status: 'Active' },
      { $set: { status: 'Outbid' } },
      { session }
    );
    
    // Create new bid
    const bid = new Bid({
      tournamentId,
      playerId,
      teamId,
      amount,
      status: 'Active'
    });
    
    await bid.save({ session });
    
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

    // Pagination params
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = { tournamentId };
    if (playerId) filter.playerId = playerId;

    const [bids, total] = await Promise.all([
      Bid.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .populate('playerId', 'name')
        .populate('teamId', 'name'),
      Bid.countDocuments(filter),
    ]);

    res.json({
      bids,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const markSold = async (req, res, next) => {
  try {
    const tournamentId = new mongoose.Types.ObjectId(req.params.tournamentId);
    const { playerId } = req.body;

    if (!playerId || !mongoose.Types.ObjectId.isValid(playerId)) {
      return res.status(400).json({ message: "Valid player ID is required" });
    }

    // Verify tournament exists
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    // Find active bid for this player
    const activeBid = await getWinningBid(tournamentId, playerId);
    if (!activeBid) {
      return res.status(400).json({ message: "No active bid found for this player" });
    }

    // Process winning bid
    await processWinningBid(activeBid);

    // Update tournament state
    tournament.currentPlayerId = null;
    tournament.auctionStatus = "sold";
    await tournament.save();

    // Populate response
    const populatedBid = await Bid.findById(activeBid._id)
      .populate('playerId', 'name')
      .populate('teamId', 'name short logo primaryColor secondaryColor');

    res.json({
      message: "Player marked as sold",
      bid: populatedBid,
      soldPrice: populatedBid.amount,
      teamName: populatedBid.teamId.name,
      teamShort: populatedBid.teamId.short,
      teamLogo: populatedBid.teamId.logo,
      primaryColor: populatedBid.teamId.primaryColor,
      secondaryColor: populatedBid.teamId.secondaryColor,
    });
  } catch (error) {
    next(error);
  }
};

export const markUnsold = async (req, res, next) => {
  try {
    const tournamentId = new mongoose.Types.ObjectId(req.params.tournamentId);
    const { playerId } = req.body;

    if (!playerId || !mongoose.Types.ObjectId.isValid(playerId)) {
      return res.status(400).json({ message: "Valid player ID is required" });
    }

    // Verify tournament exists
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    // Cancel active bids for this player
    const session = await mongoose.startSession();
    let cancelledCount = 0;
    try {
      await session.withTransaction(async () => {
        cancelledCount = await cancelActiveBids(tournamentId, playerId, session);
      });
    } finally {
      await session.endSession();
    }

    // Update tournament state
    tournament.currentPlayerId = null;
    tournament.auctionStatus = "unsold";
    if (!tournament.unsoldPlayerIds.includes(playerId)) {
      tournament.unsoldPlayerIds.push(playerId);
    }
    await tournament.save();

    // Get player name
    const player = await Player.findById(playerId);

    res.json({
      message: "Player marked as unsold",
      playerName: player ? player.name : "Unknown",
      cancelledBids: cancelledCount,
    });
  } catch (error) {
    next(error);
  }
};