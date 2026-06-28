import Bid from '../models/Bid.js';
import Team from '../models/Team.js';

export const validateBid = async (bidData, currentBid = 0) => {
  const { amount, teamId, playerId } = bidData;
  
  // Check if bid is higher than current bid
  if (amount <= currentBid) {
    throw new Error(`Bid must be higher than current bid of ₹${currentBid.toLocaleString()}`);
  }
  
  // Check team's remaining budget
  const team = await Team.findById(teamId);
  if (!team) {
    throw new Error('Team not found');
  }
  
  const remainingBudget = parseInt(team.remainingBudget.replace(/[₹,]/g, ''));
  if (amount > remainingBudget) {
    throw new Error(`Bid amount exceeds team's remaining budget of ₹${remainingBudget.toLocaleString()}`);
  }
  
  return true;
};

export const getWinningBid = async (tournamentId, playerId) => {
  const bid = await Bid.findOne({
    tournamentId,
    playerId,
    status: 'Active'
  }).sort({ amount: -1, timestamp: 1 });
  
  return bid;
};

export const processWinningBid = async (bid) => {
  // Update bid status to won
  bid.status = 'Won';
  bid.isWinningBid = true;
  await bid.save();
  
  // Update player as sold
  const Player = require('../models/Player.js');
  const player = await Player.findById(bid.playerId);
  if (player) {
    player.isSold = true;
    player.soldTo = bid.teamId;
    player.soldPrice = bid.amount;
    await player.save();
  }
  
  // Update team's remaining budget
  const team = await Team.findById(bid.teamId);
  if (team) {
    const remaining = parseInt(team.remainingBudget.replace(/[₹,]/g, '')) - bid.amount;
    team.remainingBudget = `₹${remaining.toLocaleString()}`;
    team.players += 1;
    await team.save();
  }
  
  return bid;
};