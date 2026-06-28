import Bid from "../models/Bid.js";
import Team from "../models/Team.js";
import Player from "../models/Player.js";

export const validateBid = async (bidData, tournamentId, currentBid = 0) => {
  const { amount, teamId, playerId } = bidData;

  // Check if bid is higher than current bid
  if (amount <= currentBid) {
    throw new Error(
      `Bid must be higher than current bid of ₹${currentBid.toLocaleString()}`,
    );
  }

  // Verify player belongs to tournament
  const player = await Player.findById(playerId);
  if (!player || player.tournamentId.toString() !== tournamentId) {
    throw new Error('Invalid player for this tournament');
  }

  if (player.isSold) {
    throw new Error('Player has already been sold');
  }

  if (player.deleted) {
    throw new Error('Player has been deleted');
  }

  if (player.isSold) {
    throw new Error("Player has already been sold");
  }

  // Check team's remaining budget and tournament ownership
  const team = await Team.findById(teamId);
  if (!team || team.tournamentId.toString() !== tournamentId) {
    throw new Error("Invalid team for this tournament");
  }

  const remainingBudget = team.remainingBudget;
  if (amount > remainingBudget) {
    throw new Error(
      `Bid amount exceeds team's remaining budget of ₹${remainingBudget.toLocaleString()}`,
    );
  }

  return true;
};

export const getWinningBid = async (tournamentId, playerId) => {
  const bid = await Bid.findOne({
    tournamentId,
    playerId,
    status: "Active",
  }).sort({ amount: -1, timestamp: 1 });

  return bid;
};

export const processWinningBid = async (bid) => {
  // Idempotent: check if already settled
  if (bid.status !== "Active") {
    return bid;
  }

  // Use transaction for atomic updates
  const session = await Bid.startSession();
  try {
    await session.withTransaction(async () => {
      // Atomically transition bid status - only if still Active
      const updatedBid = await Bid.findOneAndUpdate(
        { _id: bid._id, status: "Active" },
        { $set: { status: "Won", isWinningBid: true } },
        { new: true, session },
      );

      // If no document was updated, bid was already settled by another process
      if (!updatedBid) {
        return;
      }

      // Update player as sold
      const player = await Player.findById(bid.playerId).session(session);
      if (player && !player.isSold) {
        player.isSold = true;
        player.soldTo = bid.teamId;
        player.soldPrice = bid.amount;
        await player.save({ session });
      }

    // Update team's remaining budget
    const team = await Team.findById(bid.teamId);
    if (team) {
      const remaining = team.remainingBudget - bid.amount;
      team.remainingBudget = remaining;
      team.players += 1;
      await team.save({ session });
    }
    });
  } finally {
    await session.endSession();
  }

  return bid;
};
