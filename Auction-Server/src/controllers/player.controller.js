import Player from "../models/Player.js";
import Bid from "../models/Bid.js";

export const getPlayers = async (req, res, next) => {
  try {
    const { tournamentId } = req.query;
    const filter = tournamentId
      ? { tournamentId, deleted: false }
      : { deleted: false };

    const players = await Player.find(filter).populate("tournamentId", "name");
    res.json(players);
  } catch (error) {
    next(error);
  }
};

export const createPlayer = async (req, res, next) => {
  try {
    const { name, role, style, keeper, basePrice, tournamentId } = req.body;
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
    const player = await Player.findById(req.params.id).populate('tournamentId', 'name');
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
    const { name, role, style, keeper, basePrice } = req.body;
    const player = await Player.findByIdAndUpdate(
      req.params.id,
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

export const updatePlayer = async (req, res, next) => {
  try {
    const { name, role, style, keeper, basePrice } = req.body;
    const player = await Player.findByIdAndUpdate(
      req.params.id,
      { name, role, style, keeper, basePrice },
      { new: true, runValidators: true },
    );

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    res.json(player);
  } catch (error) {
    next(error);
  }
};

export const deletePlayer = async (req, res, next) => {
  try {
    const player = await Player.findById(req.params.id);

    if (!player || player.deleted) {
      return res.status(404).json({ message: 'Player not found' });
    }

    // Soft delete player
    player.deleted = true;
    await player.save();

    // Remove associated bids (optional, depending on desired behavior)
    // await Bid.deleteMany({ playerId: player._id });

    res.json({ message: 'Player deleted successfully' });
  } catch (error) {
    next(error);
  }
};
