import Tournament from '../models/Tournament.js';

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
    const tournament = new Tournament({ name, status, date, teams, format, description });
    await tournament.save();
    res.status(201).json(tournament);
  } catch (error) {
    next(error);
  }
};

export const getTournament = async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    res.json(tournament);
  } catch (error) {
    next(error);
  }
};

export const updateTournament = async (req, res, next) => {
  try {
    const { name, status, date, teams, format, description } = req.body;
    const tournament = await Tournament.findByIdAndUpdate(
      req.params.id,
      { name, status, date, teams, format, description },
      { new: true, runValidators: true }
    );
    
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    res.json(tournament);
  } catch (error) {
    next(error);
  }
};

export const deleteTournament = async (req, res, next) => {
  try {
    const tournament = await Tournament.findByIdAndDelete(req.params.id);
    
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    res.json({ message: 'Tournament deleted successfully' });
  } catch (error) {
    next(error);
  }
};