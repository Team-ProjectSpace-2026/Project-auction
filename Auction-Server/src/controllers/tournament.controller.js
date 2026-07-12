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
    const name = String(req.body.name || "");
    const status = String(req.body.status || "");
    const date = String(req.body.date || "");
    const teams = Number(req.body.teams) || 0;
    const venue = String(req.body.venue || "");
    const budgetPerTeam = Number(req.body.budgetPerTeam) || 0;
    const maxPlayersPerTeam = Number(req.body.maxPlayersPerTeam) || 0;
    const playerBasePrice = Number(req.body.playerBasePrice) || 0;
    const description = String(req.body.description || "");
    const logo = req.file ? req.file.path : "";
    const tournament = new Tournament({
      name,
      status,
      date,
      teams,
      venue,
      budgetPerTeam,
      maxPlayersPerTeam,
      playerBasePrice,
      description,
      logo,
      owner: req.user._id,
      createdBy: req.user._id,
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
    const name = String(req.body.name || "");
    const status = String(req.body.status || "");
    const date = String(req.body.date || "");
    const teams = Number(req.body.teams) || 0;
    const venue = String(req.body.venue || "");
    const budgetPerTeam = Number(req.body.budgetPerTeam) || 0;
    const maxPlayersPerTeam = Number(req.body.maxPlayersPerTeam) || 0;
    const playerBasePrice = Number(req.body.playerBasePrice) || 0;
    const description = String(req.body.description || "");
    const updateData = { name, status, date, teams, venue, budgetPerTeam, maxPlayersPerTeam, playerBasePrice, description };
    if (req.body.registrationEndDate !== undefined) {
      updateData.registrationEndDate = req.body.registrationEndDate ? new Date(req.body.registrationEndDate) : null;
    }
    if (req.file) {
      updateData.logo = req.file.path;
    }
    const tournament = await Tournament.findByIdAndUpdate(
      tournamentId,
      updateData,
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
    const tournament = await Tournament.findByIdAndDelete(tournamentId);

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    res.json({ message: "Tournament deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const updateRegistrationDeadline = async (req, res, next) => {
  try {
    const tournamentId = new mongoose.Types.ObjectId(req.params.id);
    const registrationEndDate = req.body.registrationEndDate
      ? new Date(req.body.registrationEndDate)
      : null;

    const tournament = await Tournament.findByIdAndUpdate(
      tournamentId,
      { registrationEndDate },
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
