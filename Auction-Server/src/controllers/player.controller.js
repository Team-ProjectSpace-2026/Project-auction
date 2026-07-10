import mongoose from "mongoose";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import Player from "../models/Player.js";
import Tournament from "../models/Tournament.js";
import Bid from "../models/Bid.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getPlayers = async (req, res, next) => {
  try {
    // Sanitize tournamentId — ObjectId validates format, throws on invalid
    const tournamentId = req.query.tournamentId
      ? new mongoose.Types.ObjectId(req.query.tournamentId)
      : undefined;

    // Sanitize role — whitelist lookup returns value from constant array, not user input
    const allowedRoles = ["Batsman", "Bowler", "All Rounder", "Wicket Keeper"];
    const roleIdx = allowedRoles.indexOf(String(req.query.role));
    const validRole = roleIdx >= 0 ? allowedRoles[roleIdx] : undefined;

    // Sanitize search — escape regex metacharacters to prevent injection
    const safeSearch = req.query.search
      ? String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      : "";

    // Build filter from sanitized values only
    const filter = { deleted: false };

    if (tournamentId) {
      filter.tournamentId = tournamentId;
    }

    if (safeSearch) {
      filter.$or = [
        { name: { $regex: safeSearch, $options: "i" } },
        { mobile: { $regex: safeSearch, $options: "i" } },
      ];
    }

    if (validRole) {
      filter.role = validRole;
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
    const player = await Player.findById(playerId);

    if (!player || player.deleted) {
      return res.status(404).json({ message: 'Player not found' });
    }

    const updateData = {};

    if (req.body.name !== undefined) updateData.name = String(req.body.name);
    if (req.body.role !== undefined) updateData.role = String(req.body.role);
    if (req.body.style !== undefined) updateData.style = String(req.body.style);
    if (req.body.keeper !== undefined) updateData.keeper = req.body.keeper === "true" || req.body.keeper === true;
    if (req.body.basePrice !== undefined) updateData.basePrice = Number(req.body.basePrice) || 0;
    if (req.body.age !== undefined) updateData.age = Number(req.body.age) || undefined;
    if (req.body.mobile !== undefined) updateData.mobile = String(req.body.mobile);
    if (req.body.countryCode !== undefined) updateData.countryCode = String(req.body.countryCode);
    if (req.body.battingStyle !== undefined) updateData.battingStyle = String(req.body.battingStyle);
    if (req.body.bowlingStyle !== undefined) updateData.bowlingStyle = String(req.body.bowlingStyle);

    if (req.file) {
      if (player.photo) {
        const oldPhotoPath = path.join(__dirname, "../../uploads/photos", player.photo);
        await fs.unlink(oldPhotoPath).catch(() => {});
      }
      updateData.photo = req.file.filename;
    }

    const updatedPlayer = await Player.findByIdAndUpdate(
      playerId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json(updatedPlayer);
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

    player.deleted = true;
    await player.save();

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

export const getRegisteredPlayers = async (req, res, next) => {
  try {
    const { tournamentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tournamentId)) {
      return res.status(400).json({ message: 'Invalid tournament ID format' });
    }

    const players = await Player.find({
      tournamentId,
      isRegistered: true,
      deleted: false,
    })
      .select("name role style battingStyle bowlingStyle keeper isRegistered")
      .populate("tournamentId", "name");

    res.json(players);
  } catch (error) {
    next(error);
  }
};
