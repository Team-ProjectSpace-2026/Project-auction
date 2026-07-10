import Tournament from "../models/Tournament.js";
import Player from "../models/Player.js";
import Team from "../models/Team.js";

const getDynamicStatus = (date) => {
  if (!date) return "Upcoming";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const auctionDate = new Date(date);
  auctionDate.setHours(0, 0, 0, 0);
  if (auctionDate < today) return "Completed";
  if (auctionDate.getTime() === today.getTime()) return "Active";
  return "Upcoming";
};

export const getDashboardStats = async (req, res, next) => {
  try {
    const ownerId = req.user._id;

    const tournaments = await Tournament.find({ owner: ownerId }).sort({
      createdAt: -1,
    });

    const tournamentIds = tournaments.map((t) => t._id);

    const tournamentsWithStatus = tournaments.map((t) => ({
      ...t.toObject(),
      dynamicStatus: getDynamicStatus(t.date),
    }));

    const metrics = {
      total: tournaments.length,
      active: tournamentsWithStatus.filter((t) => t.dynamicStatus === "Active").length,
      upcoming: tournamentsWithStatus.filter((t) => t.dynamicStatus === "Upcoming").length,
      completed: tournamentsWithStatus.filter((t) => t.dynamicStatus === "Completed").length,
    };

    let totalPlayers = 0;
    let totalTeams = 0;
    let totalBudget = 0;

    if (tournamentIds.length > 0) {
      const [playerCount, teamCount, budgetSum] = await Promise.all([
        Player.countDocuments({ tournamentId: { $in: tournamentIds }, deleted: { $ne: true } }),
        Team.countDocuments({ tournamentId: { $in: tournamentIds } }),
        Team.aggregate([
          { $match: { tournamentId: { $in: tournamentIds } } },
          { $group: { _id: null, total: { $sum: "$totalBudget" } } },
        ]),
      ]);

      totalPlayers = playerCount;
      totalTeams = teamCount;
      totalBudget = budgetSum.length > 0 ? budgetSum[0].total : 0;
    }

    const recentTournaments = tournamentsWithStatus.slice(0, 10).map((t) => ({
      id: t._id,
      name: t.name,
      status: t.dynamicStatus,
      auctionDate: t.date,
      teamsCount: t.teams,
      logo: t.logo || "",
    }));

    res.json({
      metrics,
      stats: { totalPlayers, totalTeams, totalBudget },
      tournaments: recentTournaments,
    });
  } catch (error) {
    next(error);
  }
};
