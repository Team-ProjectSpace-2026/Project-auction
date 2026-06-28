import Bid from '../models/Bid.js';
import Player from '../models/Player.js';
import Team from '../models/Team.js';
import { validateBid, getWinningBid, processWinningBid } from '../utils/bidValidator.js';

export const getAuctionState = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    
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
      const used = parseInt(team.totalBudget.replace(/[₹,]/g, '')) - parseInt(team.remainingBudget.replace(/[₹,]/g, ''));
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
    res.status(500).json({ message: error.message });
  }
};

export const placeBid = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { amount, teamId, playerId } = req.body;
    
    // Get current winning bid
    const currentBid = await getWinningBid(tournamentId, playerId);
    const currentBidAmount = currentBid ? currentBid.amount : 0;
    
    // Validate bid
    await validateBid({ amount, teamId, playerId }, currentBidAmount);
    
    // Create new bid
    const bid = new Bid({
      tournamentId,
      playerId,
      teamId,
      amount,
      status: 'Active'
    });
    
    await bid.save();
    
    // Check if this is the new winning bid
    if (currentBid) {
      // Mark previous bid as outbid
      currentBid.status = 'Outbid';
      await currentBid.save();
    }
    
    // Process winning bid if this is the highest
    if (amount > currentBidAmount) {
      await processWinningBid(bid);
    }
    
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
    res.status(400).json({ message: error.message });
  }
};

export const getBidHistory = async (req, res) => {
  try {
    const { tournamentId, playerId } = req.params;
    
    const bids = await Bid.find({
      tournamentId,
      ...(playerId && { playerId })
    })
    .sort({ timestamp: -1 })
    .populate('playerId', 'name')
    .populate('teamId', 'name');
    
    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};