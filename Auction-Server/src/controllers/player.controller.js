import mongoose from "mongoose";
import Player from "../models/Player.js";
<<<<<<< HEAD
import Tournament from "../models/Tournament.js";
=======
import Bid from "../models/Bid.js";
>>>>>>> 0cb2f4c3873fa197e732ed7a4e0ba6ba0d16aae1

export const getPlayers = async (req, res, next) => {
  try {
    const tournamentId = req.query.tournamentId ? new mongoose.Types.ObjectId(req.query.tournamentId) : undefined;
    let filter = { deleted: false };
    if (tournamentId) {
      filter.tournamentId = tournamentId;
    }

    const players = await Player.find(filter).populate("tournamentId", "name");
    res.json(players);
  } catch (error) {
    next(error);
  }
};

export const createPlayer = async (req, res, next) => {
  try {
    const name = String(req.body.name || "");
    const role = String(req.body.role || "");
    const style = String(req.body.style || "");
    const keeper = Boolean(req.body.keeper);
    const basePrice = Number(req.body.basePrice) || 0;
    const tournamentId = String(req.body.tournamentId || "");
    const player = new Player({
      name,
      role,
      style,
      keeper,
      basePrice,
      tournamentId,
    });
    await player.save();
    res.status(201).json(player);
  } catch (error) {
    next(error);
  }
};

export const getPlayer = async (req, res, next) => {
  try {
    const playerId = new mongoose.Types.ObjectId(req.params.id);
    const player = await Player.findById(playerId).populate('tournamentId', 'name');
    if (!player || player.deleted) {
      return res.status(404).json({ message: 'Player not found' });
    }
    res.json(player);
  } catch (error) {
    next(error);
  }
};

export const updatePlayer = async (req, res, next) => {
  try {
    const playerId = new mongoose.Types.ObjectId(req.params.id);
    const name = String(req.body.name || "");
    const role = String(req.body.role || "");
    const style = String(req.body.style || "");
    const keeper = Boolean(req.body.keeper);
    const basePrice = Number(req.body.basePrice) || 0;
    const player = await Player.findByIdAndUpdate(
      playerId,
      { name, role, style, keeper, basePrice },
      { new: true, runValidators: true }
    );
    
    if (!player || player.deleted) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    res.json(player);
  } catch (error) {
    next(error);
  }
};

export const deletePlayer = async (req, res, next) => {
  try {
    const playerId = new mongoose.Types.ObjectId(req.params.id);
    const player = await Player.findById(playerId);

    if (!player || player.deleted) {
      return res.status(404).json({ message: 'Player not found' });
    }

    // Soft delete player
    player.deleted = true;
    await player.save();

    // Cancel any active bids for this player to prevent orphaned references
    await Bid.updateMany(
      { playerId: player._id, status: "Active" },
      { $set: { status: "Cancelled" } }
    );

    res.json({ message: 'Player deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getPublicTournament = async (req, res, next) => {
  try {
    const tournamentId = req.params.tournamentId;

    if (!mongoose.Types.ObjectId.isValid(tournamentId)) {
      return res.status(400).json({ message: 'Invalid tournament ID format' });
    }

    const tournament = await Tournament.findById(tournamentId).select('name registrationEndDate');
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    res.json(tournament);
  } catch (error) {
    next(error);
  }
};

export const registerPlayer = async (req, res, next) => {
  try {
    const tournamentId = req.params.tournamentId;

    if (!mongoose.Types.ObjectId.isValid(tournamentId)) {
      return res.status(400).json({ message: 'Invalid tournament ID format' });
    }

    // Verify tournament exists
    const Tournament = mongoose.model('Tournament');
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    // Check registration deadline
    if (tournament.registrationEndDate && new Date() > new Date(tournament.registrationEndDate)) {
      return res.status(403).json({ message: 'Registration deadline has passed' });
    }

    const playerName = String(req.body.playerName || "").trim();
    const age = Number(req.body.age) || 0;
    const mobile = String(req.body.mobile || "").trim();
    const countryCode = String(req.body.countryCode || "+91").trim();
    const primaryRole = String(req.body.primaryRole || "").trim();
    const battingStyle = String(req.body.battingStyle || "").trim();
    const bowlingStyle = String(req.body.bowlingStyle || "").trim();
    const isKeeper = String(req.body.isKeeper || "").trim();

    // Check for duplicate registration
    const existing = await Player.findOne({ mobile, tournamentId, deleted: false });
    if (existing) {
      return res.status(409).json({ message: 'This mobile number is already registered for this tournament' });
    }

    const player = new Player({
      name: playerName,
      role: primaryRole,
      style: battingStyle,
      keeper: isKeeper === 'Yes',
      age: Number(age),
      mobile,
      countryCode: countryCode || '+91',
      battingStyle,
      bowlingStyle,
      photo: req.file ? req.file.filename : null,
      tournamentId,
      isRegistered: true,
      basePrice: 0,
    });

    await player.save();
    res.status(201).json({ message: 'Registration successful', player });
  } catch (error) {
    next(error);
  }
};
