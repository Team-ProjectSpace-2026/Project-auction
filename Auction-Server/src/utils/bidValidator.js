import mongoose from "mongoose";
import Bid from "../models/Bid.js";
import Team from "../models/Team.js";
import Player from "../models/Player.js";
import Tournament from "../models/Tournament.js";
import {
  getMaxBid,
  getTeamBidStatus,
  canTeamBid,
  isPlayerOverseas,
  getTeamRemainingBudget,
  getTeamPlayersCount,
  calculateAllTeamsEligibility,
} from "./auctionBidValidator.js";

export {
  getMaxBid,
  getTeamBidStatus,
  canTeamBid,
  isPlayerOverseas,
  getTeamRemainingBudget,
  getTeamPlayersCount,
  calculateAllTeamsEligibility,
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const validateBid = async (bidData, tournamentId, currentBid = 0) => {
  const { amount, teamId, playerId } = bidData;

  // Validate inputs are proper ObjectIds
  if (!isValidObjectId(teamId) || !isValidObjectId(playerId) || !isValidObjectId(tournamentId)) {
    throw new Error("Invalid ID format provided");
  }

  const sanitizedTournamentId = new mongoose.Types.ObjectId(tournamentId);
  const sanitizedTeamId = new mongoose.Types.ObjectId(teamId);
  const sanitizedPlayerId = new mongoose.Types.ObjectId(playerId);

  // Check if bid is higher than current bid
  if (amount <= currentBid) {
    throw new Error(
      `Bid must be higher than current bid of ₹${currentBid.toLocaleString()}`,
    );
  }

  // Verify tournament exists
  const tournament = await Tournament.findById(sanitizedTournamentId);
  if (!tournament) {
    throw new Error("Tournament not found");
  }

  // Verify player belongs to tournament
  const player = await Player.findById(sanitizedPlayerId);
  if (!player || player.tournamentId.toString() !== tournamentId.toString()) {
    throw new Error('Invalid player for this tournament');
  }

  if (player.isSold) {
    throw new Error('Player has already been sold');
  }

  if (player.deleted) {
    throw new Error('Player has been deleted');
  }

  // Check team's remaining budget and tournament ownership
  const team = await Team.findById(sanitizedTeamId);
  if (!team || team.tournamentId.toString() !== tournamentId.toString()) {
    throw new Error("Invalid team for this tournament");
  }

  const remainingBudget = team.remainingBudget;
  if (amount > remainingBudget) {
    throw new Error(
      `Bid amount exceeds team's remaining budget of ₹${remainingBudget.toLocaleString()}`,
    );
  }

  // Construct effective tournament rules
  const tournamentRules = {
    minSquadSize: tournament.tournamentRules?.minSquadSize ?? 15,
    maxSquadSize: tournament.tournamentRules?.maxSquadSize ?? tournament.maxPlayersPerTeam ?? 18,
    minReservePerSlot: tournament.tournamentRules?.minReservePerSlot ?? tournament.playerBasePrice ?? 100,
    maxOverseas: tournament.tournamentRules?.maxOverseas ?? 8,
    roleRequirements: tournament.tournamentRules?.roleRequirements || {},
  };

  const basePrice = player.basePrice > 0 ? player.basePrice : (tournament.playerBasePrice || 0);
  if (basePrice > 0 && amount < basePrice) {
    throw new Error(`Bid amount ₹${amount.toLocaleString()} cannot be less than base price of ₹${basePrice.toLocaleString()}`);
  }

  // Check max squad size
  const currentSquadCount = team.players || 0;
  if (currentSquadCount >= tournamentRules.maxSquadSize) {
    throw new Error(`Team already reached maximum squad size of ${tournamentRules.maxSquadSize} players`);
  }

  // Check overseas quota
  if (isPlayerOverseas(player)) {
    const overseasCount = await Player.countDocuments({
      tournamentId: sanitizedTournamentId,
      soldTo: sanitizedTeamId,
      isSold: true,
      $or: [
        { isOverseas: true },
        { countryCode: { $exists: true, $ne: "+91" } },
      ],
    });
    if (overseasCount >= tournamentRules.maxOverseas) {
      throw new Error(`Overseas player quota full (${tournamentRules.maxOverseas}/${tournamentRules.maxOverseas})`);
    }
  }

  // Max-bid cap validation
  const maxBid = getMaxBid(team, tournamentRules, { player });
  if (amount > maxBid) {
    const slotsNeeded = Math.max(0, tournamentRules.minSquadSize - currentSquadCount - 1);
    throw new Error(
      `Bid of ₹${amount.toLocaleString()} exceeds team's maximum allowed bid of ₹${maxBid.toLocaleString()} to guarantee squad completion (need ${slotsNeeded} more slots at reserve price)`
    );
  }

  return true;
};

export const getWinningBid = async (tournamentId, playerId) => {
  // Validate inputs
  if (!isValidObjectId(tournamentId) || !isValidObjectId(playerId)) {
    throw new Error("Invalid ID format provided");
  }

  const sanitizedTournamentId = new mongoose.Types.ObjectId(tournamentId);
  const sanitizedPlayerId = new mongoose.Types.ObjectId(playerId);

  const bid = await Bid.findOne({
    tournamentId: sanitizedTournamentId,
    playerId: sanitizedPlayerId,
    status: "Active",
  }).sort({ amount: -1, timestamp: 1 });

  return bid;
};

export const processWinningBid = async (bid) => {
  // Idempotent: check if already settled
  if (bid.status !== "Active") {
    return bid;
  }

  // Use transaction for atomic updates with fallback for standalone Mongo
  try {
    const session = await Bid.startSession();
    try {
      await session.withTransaction(async () => {
        const updatedBid = await Bid.findOneAndUpdate(
          { _id: bid._id, status: "Active" },
          { $set: { status: "Won", isWinningBid: true } },
          { new: true, session },
        );
        if (!updatedBid) return;

        const player = await Player.findById(bid.playerId).session(session);
        if (player && !player.isSold) {
          player.isSold = true;
          player.soldTo = bid.teamId;
          player.soldPrice = bid.amount;
          await player.save({ session });
        }

        const team = await Team.findById(bid.teamId).session(session);
        if (team) {
          team.remainingBudget = team.remainingBudget - bid.amount;
          team.players += 1;
          await team.save({ session });
        }
      });
    } finally {
      await session.endSession();
    }
  } catch (txErr) {
    // Fallback for standalone Mongo deployments
    const updatedBid = await Bid.findOneAndUpdate(
      { _id: bid._id, status: "Active" },
      { $set: { status: "Won", isWinningBid: true } },
      { new: true }
    );
    if (updatedBid) {
      const player = await Player.findById(bid.playerId);
      if (player && !player.isSold) {
        player.isSold = true;
        player.soldTo = bid.teamId;
        player.soldPrice = bid.amount;
        await player.save();
      }

      const team = await Team.findById(bid.teamId);
      if (team) {
        team.remainingBudget = team.remainingBudget - bid.amount;
        team.players += 1;
        await team.save();
      }
    }
  }

  // Return the updated bid, not the stale input
  const refreshedBid = await Bid.findById(bid._id);
  return refreshedBid || bid;
};

export const cancelActiveBids = async (tournamentId, playerId, session) => {
  if (!isValidObjectId(tournamentId) || !isValidObjectId(playerId)) {
    throw new Error("Invalid ID format provided");
  }

  const result = await Bid.updateMany(
    {
      tournamentId: new mongoose.Types.ObjectId(tournamentId),
      playerId: new mongoose.Types.ObjectId(playerId),
      status: "Active",
    },
    { $set: { status: "Cancelled" } },
    { session },
  );

  return result.modifiedCount;
};
