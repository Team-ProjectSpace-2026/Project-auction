import Team from '../models/Team.js';

export const getTeams = async (req, res, next) => {
  try {
    const tournamentId = req.query.tournamentId;
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
    const teamId = req.params.id;
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
    const { name, short, budget, maxPlayers, totalBudget, tournamentId } = req.body;
    const team = new Team({ name, short, budget, maxPlayers, totalBudget, tournamentId });
    await team.save();
    res.status(201).json(team);
  } catch (error) {
    next(error);
  }
};

export const updateTeam = async (req, res, next) => {
  try {
    const teamId = req.params.id;
    const { name, short, budget, maxPlayers, totalBudget } = req.body;
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
    const teamId = req.params.id;
    const team = await Team.findByIdAndDelete(teamId);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    next(error);
  }
};