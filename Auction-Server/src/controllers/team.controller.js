import mongoose from 'mongoose';
import Team from '../models/Team.js';
import Player from '../models/Player.js';
import Bid from '../models/Bid.js';
import Tournament from '../models/Tournament.js';

export const getTeams = async (req, res, next) => {
  try {
    const tournamentId = req.query.tournamentId ? new mongoose.Types.ObjectId(req.query.tournamentId) : undefined;
    let filter = { createdBy: req.user._id };
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
      .populate('tournamentId', 'name');
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const players = await Player.find({ soldTo: teamId, deleted: false })
      .select('name role style basePrice soldPrice jerseyNumber jerseySize jerseyName');

    res.json({ ...team.toObject(), players });
  } catch (error) {
    next(error);
  }
};

export const createTeam = async (req, res, next) => {
  try {
    const name = String(req.body.name || "");
    const short = String(req.body.short || "");
    const budget = Number(req.body.budget) || 0;
    const maxPlayers = Number(req.body.maxPlayers) || 18;
    const totalBudget = Number(req.body.totalBudget) || 0;
    const tournamentId = String(req.body.tournamentId || "");
    const ownerName = String(req.body.ownerName || "");
    const logo = req.body.logo ? String(req.body.logo) : undefined;
    const primaryColor = req.body.primaryColor ? String(req.body.primaryColor) : undefined;
    const secondaryColor = req.body.secondaryColor ? String(req.body.secondaryColor) : undefined;

    if (!mongoose.Types.ObjectId.isValid(tournamentId)) {
      return res.status(400).json({ message: 'Invalid tournament ID' });
    }

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    const finalBudget = Number(req.body.totalBudget) > 0 ? Number(req.body.totalBudget) : (tournament.budgetPerTeam || 0);

    const existingTeam = await Team.findOne({ tournamentId, name });
    if (existingTeam) {
      return res.status(400).json({ message: 'Team name already exists in this tournament' });
    }

    const remainingBudget = finalBudget;
    const team = new Team({ name, short, budget: finalBudget, maxPlayers, totalBudget: finalBudget, remainingBudget, tournamentId, ownerName, logo, primaryColor, secondaryColor, createdBy: req.user._id });
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
    const maxPlayers = Number(req.body.maxPlayers) || 18;
    const totalBudget = Number(req.body.totalBudget) || 0;
    const ownerName = String(req.body.ownerName || "");
    const logo = req.body.logo ? String(req.body.logo) : undefined;
    const primaryColor = req.body.primaryColor ? String(req.body.primaryColor) : undefined;
    const secondaryColor = req.body.secondaryColor ? String(req.body.secondaryColor) : undefined;

    const existingTeam = await Team.findById(teamId);
    if (!existingTeam) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (existingTeam.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check for duplicate team name within the same tournament (excluding self)
    const duplicateTeam = await Team.findOne({
      tournamentId: existingTeam.tournamentId,
      name,
      _id: { $ne: teamId }
    });
    if (duplicateTeam) {
      return res.status(409).json({ message: `A team with name "${name}" already exists in this tournament` });
    }

    const totalSpent = existingTeam.totalBudget - existingTeam.remainingBudget;
    const newRemainingBudget = Math.max(0, totalBudget - totalSpent);

    const team = await Team.findByIdAndUpdate(
      teamId,
      { name, short, budget, maxPlayers, totalBudget, remainingBudget: newRemainingBudget, ownerName, logo, primaryColor, secondaryColor },
      { new: true, runValidators: true }
    );
    
    res.json(team);
  } catch (error) {
    next(error);
  }
};

export const deleteTeam = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    const teamId = new mongoose.Types.ObjectId(req.params.id);
    const team = await Team.findById(teamId);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await session.withTransaction(async () => {
      await Player.updateMany(
        { soldTo: teamId },
        { $set: { isSold: false, soldTo: null, soldPrice: null } },
        { session }
      );

      await Bid.updateMany(
        { teamId, tournamentId: team.tournamentId, status: 'Active' },
        { $set: { status: 'Cancelled' } },
        { session }
      );

      await Team.findByIdAndDelete(teamId).session(session);
    });

    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
};