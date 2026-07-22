import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import Tournament from "../models/Tournament.js";
import Player from "../models/Player.js";
import Team from "../models/Team.js";
import Bid from "../models/Bid.js";

export const getTournaments = async (req, res, next) => {
  try {
    const tournaments = await Tournament.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(tournaments);
  } catch (error) {
    next(error);
  }
};

/**
 * Public endpoint — no auth required.
 * Returns the 8 most recent tournaments with aggregated stats for the landing page.
 */
export const getPublicRecentTournaments = async (req, res, next) => {
  try {
    const tournaments = await Tournament.find()
      .sort({ date: -1 })
      .limit(8)
      .select('name date teams logo status');

    const results = await Promise.all(
      tournaments.map(async (t) => {
        const tournamentId = t._id;

        // Compute dynamic status based on date
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const auctionDate = new Date(t.date);
        auctionDate.setHours(0, 0, 0, 0);
        let dynamicStatus = 'Upcoming';
        let statusLabel = 'Upcoming';
        if (auctionDate < today) {
          dynamicStatus = 'Completed';
          statusLabel = 'Completed';
        } else if (auctionDate.getTime() === today.getTime()) {
          dynamicStatus = 'Active';
          statusLabel = 'Live Now';
        }

        // Aggregate stats from Teams and Bids
        const [teamCount, totalSpentAgg, topBidAgg, playerCount] = await Promise.all([
          Team.countDocuments({ tournamentId }),
          Bid.aggregate([
            { $match: { tournamentId, isWinningBid: true } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
          ]),
          Bid.aggregate([
            { $match: { tournamentId } },
            { $group: { _id: null, max: { $max: '$amount' } } },
          ]),
          Player.countDocuments({ tournamentId, deleted: { $ne: true } }),
        ]);

        const totalSpent = totalSpentAgg.length > 0 ? totalSpentAgg[0].total : 0;
        const topBid = topBidAgg.length > 0 ? topBidAgg[0].max : 0;

        // Format currency in Cr / Lakh
        const formatCurrency = (amount) => {
          if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
          if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} Lakh`;
          if (amount > 0) return `₹${amount.toLocaleString('en-IN')}`;
          return '₹0';
        };

        return {
          id: tournamentId,
          name: t.name,
          status: dynamicStatus.toLowerCase(),
          statusLabel,
          date: t.date,
          teams: teamCount || t.teams || 0,
          players: playerCount,
          totalSpent: formatCurrency(totalSpent),
          topBid: formatCurrency(topBid),
          logo: t.logo || '',
        };
      })
    );

    res.json(results);
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
    const existing = await Tournament.findById(tournamentId);
    if (!existing) {
      return res.status(404).json({ message: "Tournament not found" });
    }
    if (existing.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this tournament" });
    }
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
      if (existing?.logo) {
        try {
          const logoUrl = new URL(existing.logo);
          if (logoUrl.hostname.endsWith(".cloudinary.com")) {
            const parts = logoUrl.pathname.split("/");
            const publicId = parts.slice(parts.indexOf("upload") + 1, -1).join("/");
            await cloudinary.uploader.destroy(publicId).catch(() => {});
          }
        } catch {
          // Not a valid URL, skip deletion
        }
      }
      updateData.logo = req.file.path;
    }
    const tournament = await Tournament.findByIdAndUpdate(
      tournamentId,
      { $set: updateData },
      { new: true, runValidators: true },
    );

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    // Sync budgetPerTeam and maxPlayersPerTeam to teams that have not purchased players yet
    if (budgetPerTeam > 0 || maxPlayersPerTeam > 0) {
      const existingTeams = await Team.find({ tournamentId });
      for (const t of existingTeams) {
        const purchasedCount = await Player.countDocuments({ soldTo: t._id, deleted: false, isSold: true });
        if (purchasedCount === 0) {
          const newBudget = budgetPerTeam > 0 ? budgetPerTeam : t.totalBudget;
          const newMax = maxPlayersPerTeam > 0 ? maxPlayersPerTeam : t.maxPlayers;
          await Team.findByIdAndUpdate(t._id, {
            totalBudget: newBudget,
            budget: newBudget,
            remainingBudget: newBudget,
            maxPlayers: newMax,
          });
        }
      }
    }

    res.json(tournament);
  } catch (error) {
    next(error);
  }
};

export const deleteTournament = async (req, res, next) => {
  try {
    const tournamentId = new mongoose.Types.ObjectId(req.params.id);
    const tournament = await Tournament.findById(tournamentId);

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    if (tournament.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this tournament" });
    }

    await Tournament.findByIdAndDelete(tournamentId);
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
