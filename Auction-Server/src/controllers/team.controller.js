import mongoose from 'mongoose';
import Team from '../models/Team.js';

export const getTeams = async (req, res, next) => {
  try {
    const tournamentId = req.query.tournamentId ? new mongoose.Types.ObjectId(req.query.tournamentId) : undefined;
    let filter = {};
    if (tournamentId) {
      filter.tournamentId = tournamentId;
    }
    
    const teams = await Team.find(filter).populate('tournamentId', 'name');
    res.json(teams);
  } catch (error) {
    next(error);
  }
};

export const getTeam = async (req, res, next) => {
  try {
    const teamId = new mongoose.Types.ObjectId(req.params.id);
    const team = await Team.findById(teamId)
      .populate('tournamentId', 'name')
      .populate({
        path: 'players',
        populate: {
          path: 'playerId',
          select: 'name role'
        }
      });
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    res.json(team);
  } catch (error) {
    next(error);
  }
};

export const createTeam = async (req, res, next) => {
  try {
    const name = String(req.body.name || "");
    const short = String(req.body.short || "");
    const budget = Number(req.body.budget) || 0;
    const maxPlayers = Number(req.body.maxPlayers) || 0;
    const totalBudget = Number(req.body.totalBudget) || 0;
    const tournamentId = String(req.body.tournamentId || "");
    const team = new Team({ name, short, budget, maxPlayers, totalBudget, tournamentId });
    await team.save();
    res.status(201).json(team);
  } catch (error) {
    next(error);
  }
};

export const updateTeam = async (req, res, next) => {
  try {
    const teamId = new mongoose.Types.ObjectId(req.params.id);
    const name = String(req.body.name || "");
    const short = String(req.body.short || "");
    const budget = Number(req.body.budget) || 0;
    const maxPlayers = Number(req.body.maxPlayers) || 0;
    const totalBudget = Number(req.body.totalBudget) || 0;
    const team = await Team.findByIdAndUpdate(
      teamId,
      { name, short, budget, maxPlayers, totalBudget },
      { new: true, runValidators: true }
    );
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    res.json(team);
  } catch (error) {
    next(error);
  }
};

export const deleteTeam = async (req, res, next) => {
  try {
    const teamId = new mongoose.Types.ObjectId(req.params.id);
    const team = await Team.findByIdAndDelete(teamId);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    next(error);
  }
};