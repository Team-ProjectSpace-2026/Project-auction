import mongoose from "mongoose";
import Tournament from "../models/Tournament.js";
import Player from "../models/Player.js";
import Team from "../models/Team.js";
import Bid from "../models/Bid.js";

export const getTournaments = async (req, res, next) => {
  try {
    const tournaments = await Tournament.find().sort({ createdAt: -1 });
    res.json(tournaments);
  } catch (error) {
    next(error);
  }
};

export const createTournament = async (req, res, next) => {
  try {
    const { name, status, date, teams, format, description } = req.body;
    const tournament = new Tournament({
      name,
      status,
      date,
      teams,
      format,
      description,
    });
    await tournament.save();
    res.status(201).json(tournament);
  } catch (error) {
    next(error);
  }
};

export const getTournament = async (req, res, next) => {
  try {
    const tournamentId = new mongoose.Types.ObjectId(req.params.id);
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }
    res.json(tournament);
  } catch (error) {
    next(error);
  }
};

export const updateTournament = async (req, res, next) => {
  try {
    const tournamentId = new mongoose.Types.ObjectId(req.params.id);
    const { name, status, date, teams, format, description } = req.body;
    const tournament = await Tournament.findByIdAndUpdate(
      tournamentId,
      { name, status, date, teams, format, description },
      { new: true, runValidators: true },
    );

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    res.json(tournament);
  } catch (error) {
    next(error);
  }
};

export const deleteTournament = async (req, res, next) => {
  try {
    const tournamentId = new mongoose.Types.ObjectId(req.params.id);

    // Check for dependent records
    const [playerCount, teamCount, bidCount] = await Promise.all([
      Player.countDocuments({ tournamentId }),
      Team.countDocuments({ tournamentId }),
      Bid.countDocuments({ tournamentId }),
    ]);

    if (playerCount > 0 || teamCount > 0 || bidCount > 0) {
      return res.status(400).json({
        message: `Cannot delete tournament. Dependent records exist: ${playerCount} players, ${teamCount} teams, ${bidCount} bids`,
      });
    }

    const tournament = await Tournament.findByIdAndDelete(tournamentId);

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    res.json({ message: "Tournament deleted successfully" });
  } catch (error) {
    next(error);
  }
};
