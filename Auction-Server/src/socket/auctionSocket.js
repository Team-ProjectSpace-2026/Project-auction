import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import Team from "../models/Team.js";
import Bid from "../models/Bid.js";
import Player from "../models/Player.js";
import Tournament from "../models/Tournament.js";
import {
  validateBid,
  getWinningBid,
  processWinningBid,
  cancelActiveBids,
} from "../utils/bidValidator.js";

let io;

// --- Socket rate limiting (per-connection) ---
const RATE_LIMIT_WINDOW_MS = 600;  // 600ms window
const RATE_LIMIT_MAX_BIDS = 1;     // max 1 bid per 600ms per connection
const RATE_LIMIT_MAX_EVENTS = 10;  // max 10 any events per 600ms

const createRateLimiter = (maxRequests, windowMs) => {
  const timestamps = [];
  return () => {
    const now = Date.now();
    // Remove expired timestamps
    while (timestamps.length > 0 && timestamps[0] <= now - windowMs) {
      timestamps.shift();
    }
    if (timestamps.length >= maxRequests) {
      return false; // rate limited
    }
    timestamps.push(now);
    return true; // allowed
  };
};

// --- Input validation helpers ---
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const sanitizeId = (id) => {
  if (!id || !isValidObjectId(id)) return null;
  return new mongoose.Types.ObjectId(id);
};
const sanitizeNumber = (val, opts = {}) => {
  const num = Number(val);
  if (isNaN(num) || num < 0) return null;
  if (opts.max !== undefined && num > opts.max) return null;
  return num;
};

// --- Authorization helpers ---
const checkTournamentExists = async (tournamentId) => {
  if (!tournamentId || !isValidObjectId(tournamentId)) return null;
  return Tournament.findById(new mongoose.Types.ObjectId(tournamentId));
};

const checkPlayerInTournament = async (playerId, tournamentId) => {
  if (!playerId || !isValidObjectId(playerId)) return null;
  const player = await Player.findById(new mongoose.Types.ObjectId(playerId));
  if (!player || player.tournamentId.toString() !== tournamentId.toString()) return null;
  return player;
};

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
          .split(',')
          .map((o) => o.trim());
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ["GET", "POST"],
    },
  });

  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      // Try cookie first (primary auth), then fall back to handshake.auth.token
      const cookieHeader = socket.handshake.headers?.cookie || "";
      const cookieToken = cookieHeader
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith("token="))
        ?.split("=")[1];
      const token = cookieToken || socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      socket.joinedTournaments = new Set();
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    // Create per-event rate limiters
    const bidRateLimiter = createRateLimiter(RATE_LIMIT_MAX_BIDS, RATE_LIMIT_WINDOW_MS);
    const eventRateLimiter = createRateLimiter(RATE_LIMIT_MAX_EVENTS, RATE_LIMIT_WINDOW_MS);

    // --- join-tournament ---
    socket.on("join-tournament", async (data) => {
      try {
        if (!eventRateLimiter()) {
          socket.emit("rate-limited", { message: "Too many requests. Slow down." });
          return;
        }

        const tournamentId = typeof data === "string" ? data : data?.tournamentId;
        if (!tournamentId || !isValidObjectId(tournamentId)) {
          socket.emit("join-error", { message: "Invalid tournament ID" });
          return;
        }

        const tournament = await checkTournamentExists(tournamentId);
        if (!tournament) {
          socket.emit("join-error", { message: "Tournament not found" });
          return;
        }

        socket.join(`tournament-${tournamentId}`);
        socket.joinedTournaments.add(tournamentId);

        // Also send teams and players so the client has full state immediately
        const [teams, players] = await Promise.all([
          Team.find({ tournamentId }).lean(),
          Player.find({ tournamentId }).lean(),
        ]);

        // Also fetch current bid state if auction is active
        let currentBid = null;
        let highestBidder = null;
        if (tournament.currentPlayerId && tournament.auctionStatus === "bidding") {
          currentBid = await getWinningBid(tournamentId, tournament.currentPlayerId._id);
          if (currentBid) {
            const populatedBid = await Bid.findById(currentBid._id)
              .populate("teamId", "name short")
              .lean();
            currentBid = populatedBid;
            highestBidder = populatedBid.teamId;
          }
        }

        // Populate currentPlayerId to get full player object
        let currentPlayerObj = null;
        if (tournament.currentPlayerId) {
          currentPlayerObj = await Player.findById(tournament.currentPlayerId).lean();
        }

        socket.emit("auction-state", {
          teams,
          players,
          currentPlayer: currentPlayerObj,
          currentBid,
          highestBidder,
          auctionStatus: tournament.auctionStatus,
          tournament: { playerBasePrice: tournament.playerBasePrice || 0 },
        });
      } catch (error) {
        socket.emit("join-error", { message: "Failed to join tournament" });
      }
    });

    // --- leave-tournament ---
    socket.on("leave-tournament", (data) => {
      try {
        const tournamentId = typeof data === "string" ? data : data?.tournamentId;
        if (tournamentId && isValidObjectId(tournamentId)) {
          socket.leave(`tournament-${tournamentId}`);
          socket.joinedTournaments?.delete(tournamentId);
        }
      } catch (error) {
        // Silent fail for leave
      }
    });

    // --- place-bid ---
    socket.on("place-bid", async (data) => {
      try {
        if (!bidRateLimiter()) {
          socket.emit("bid-error", { message: "Too many bids. Please wait." });
          return;
        }

        const { tournamentId, amount, teamId, playerId } = data || {};

        // Input validation
        const sanitizedTournamentId = sanitizeId(tournamentId);
        const sanitizedTeamId = sanitizeId(teamId);
        const sanitizedPlayerId = sanitizeId(playerId);
        const sanitizedAmount = sanitizeNumber(amount);

        if (!sanitizedTournamentId || !sanitizedTeamId || !sanitizedPlayerId || sanitizedAmount === null) {
          socket.emit("bid-error", { message: "Invalid input data" });
          return;
        }

        // Verify tournament exists
        const tournament = await Tournament.findById(sanitizedTournamentId);
        if (!tournament) {
          socket.emit("bid-error", { message: "Tournament not found" });
          return;
        }

        // Reject bids if no active auction or wrong player
        if (
          tournament.auctionStatus !== "bidding" ||
          !tournament.currentPlayerId ||
          tournament.currentPlayerId.toString() !== sanitizedPlayerId.toString()
        ) {
          socket.emit("bid-error", {
            message: "No active auction for this player",
          });
          return;
        }

        // Get current winning bid atomically
        const currentBid = await getWinningBid(sanitizedTournamentId, sanitizedPlayerId);
        const currentBidAmount = currentBid ? currentBid.amount : 0;

        // Validate bid using shared validator
        try {
          await validateBid(
            { amount: sanitizedAmount, teamId: sanitizedTeamId, playerId: sanitizedPlayerId },
            sanitizedTournamentId,
            currentBidAmount
          );
        } catch (validationError) {
          socket.emit("bid-error", { message: validationError.message });
          return;
        }

        if (sanitizedAmount <= currentBidAmount) {
          socket.emit("bid-error", {
            message: `Bid must be higher than current bid of ₹${currentBidAmount.toLocaleString()}`,
          });
          return;
        }

        // Atomic bid creation with fallback for non-replica set Mongo deployments
        let newBidId;
        try {
          const session = await Bid.startSession();
          try {
            await session.withTransaction(async () => {
              // Mark any existing active bid for this player as Outbid FIRST
              await Bid.updateMany(
                { tournamentId: sanitizedTournamentId, playerId: sanitizedPlayerId, status: "Active" },
                { $set: { status: "Outbid" } },
                { session }
              );

              const bid = new Bid({
                tournamentId: sanitizedTournamentId,
                playerId: sanitizedPlayerId,
                teamId: sanitizedTeamId,
                amount: sanitizedAmount,
                status: "Active",
              });
              await bid.save({ session });
              newBidId = bid._id;
            });
          } finally {
            await session.endSession();
          }
        } catch (txErr) {
          // Fallback for standalone MongoDB without transaction support
          await Bid.updateMany(
            { tournamentId: sanitizedTournamentId, playerId: sanitizedPlayerId, status: "Active" },
            { $set: { status: "Outbid" } }
          );

          const bid = new Bid({
            tournamentId: sanitizedTournamentId,
            playerId: sanitizedPlayerId,
            teamId: sanitizedTeamId,
            amount: sanitizedAmount,
            status: "Active",
          });
          await bid.save();
          newBidId = bid._id;
        }

        // Broadcast bid to all clients in tournament room
        const populatedBid = await Bid.findById(newBidId)
          .populate("playerId", "name")
          .populate("teamId", "name");

        io.to(`tournament-${tournamentId}`).emit("new-bid", {
          bid: populatedBid,
          isWinningBid: true,
        });

        socket.emit("bid-success", {
          message: "Bid placed successfully",
          bid: populatedBid,
          isWinningBid: true,
        });
      } catch (error) {
        socket.emit("bid-error", { message: error.message || "Failed to place bid" });
      }
    });

    // --- reveal-player (organizer-only action) ---
    socket.on("reveal-player", async (data) => {
      try {
        if (!eventRateLimiter()) {
          socket.emit("rate-limited", { message: "Too many requests." });
          return;
        }

        const { tournamentId, playerId } = data || {};
        const sanitizedTournamentId = sanitizeId(tournamentId);
        const sanitizedPlayerId = sanitizeId(playerId);

        if (!sanitizedTournamentId || !sanitizedPlayerId) {
          socket.emit("reveal-error", { message: "Invalid input data" });
          return;
        }

        const tournament = await Tournament.findById(sanitizedTournamentId);
        if (!tournament) {
          socket.emit("reveal-error", { message: "Tournament not found" });
          return;
        }

        // Only tournament creator can reveal players
        if (tournament.createdBy && tournament.createdBy.toString() !== socket.user._id.toString()) {
          socket.emit("reveal-error", { message: "Not authorized to reveal players" });
          return;
        }

        const player = await Player.findById(sanitizedPlayerId);
        if (!player || player.tournamentId.toString() !== sanitizedTournamentId.toString()) {
          socket.emit("reveal-error", { message: "Invalid player for this tournament" });
          return;
        }

        if (player.isSold) {
          socket.emit("reveal-error", { message: "Player has already been sold" });
          return;
        }

        if (player.deleted) {
          socket.emit("reveal-error", { message: "Player has been deleted" });
          return;
        }

        tournament.currentPlayerId = sanitizedPlayerId;
        tournament.auctionStatus = "bidding";
        await tournament.save();

        const populatedPlayer = await Player.findById(sanitizedPlayerId);
        io.to(`tournament-${tournamentId}`).emit("player-revealed", {
          playerId: sanitizedPlayerId,
          player: populatedPlayer,
        });
      } catch (error) {
        socket.emit("reveal-error", { message: "Failed to reveal player" });
      }
    });

    // --- start-auction (organizer-only action) ---
    socket.on("start-auction", async (data) => {
      try {
        if (!eventRateLimiter()) {
          socket.emit("rate-limited", { message: "Too many requests." });
          return;
        }

        const { tournamentId } = data || {};
        const sanitizedTournamentId = sanitizeId(tournamentId);
        if (!sanitizedTournamentId) {
          socket.emit("start-error", { message: "Invalid tournament ID" });
          return;
        }

        const tournament = await Tournament.findById(sanitizedTournamentId);
        if (!tournament) return;

        // Only tournament creator can start
        if (tournament.createdBy && tournament.createdBy.toString() !== socket.user._id.toString()) {
          socket.emit("start-error", { message: "Not authorized" });
          return;
        }

        tournament.auctionStatus = "idle";
        await tournament.save();

        io.to(`tournament-${tournamentId}`).emit("auction-started", {
          tournamentId,
        });
      } catch (error) {
        socket.emit("start-error", { message: "Failed to start auction" });
      }
    });

    // --- end-auction (organizer-only action) ---
    socket.on("end-auction", async (data) => {
      try {
        if (!eventRateLimiter()) {
          socket.emit("rate-limited", { message: "Too many requests." });
          return;
        }

        const { tournamentId } = data || {};
        const sanitizedTournamentId = sanitizeId(tournamentId);
        if (!sanitizedTournamentId) {
          socket.emit("end-error", { message: "Invalid tournament ID" });
          return;
        }

        const tournament = await Tournament.findById(sanitizedTournamentId);
        if (!tournament) return;

        // Only tournament creator can end
        if (tournament.createdBy && tournament.createdBy.toString() !== socket.user._id.toString()) {
          socket.emit("end-error", { message: "Not authorized" });
          return;
        }

        tournament.auctionStatus = "idle";
        tournament.currentPlayerId = null;
        tournament.unsoldPlayerIds = [];
        await tournament.save();

        io.to(`tournament-${tournamentId}`).emit("auction-ended", {
          tournamentId,
        });
      } catch (error) {
        socket.emit("end-error", { message: "Failed to end auction" });
      }
    });

    // --- mark-sold (organizer-only action) ---
    socket.on("mark-sold", async (data) => {
      try {
        if (!eventRateLimiter()) {
          socket.emit("rate-limited", { message: "Too many requests." });
          return;
        }

        const { tournamentId, playerId } = data || {};
        const sanitizedTournamentId = sanitizeId(tournamentId);
        const sanitizedPlayerId = sanitizeId(playerId);

        if (!sanitizedTournamentId || !sanitizedPlayerId) {
          socket.emit("mark-sold-error", { message: "Invalid input data" });
          return;
        }

        const tournament = await Tournament.findById(sanitizedTournamentId);
        if (!tournament) {
          socket.emit("mark-sold-error", { message: "Tournament not found" });
          return;
        }

        // Only tournament creator can mark sold
        if (tournament.createdBy && tournament.createdBy.toString() !== socket.user._id.toString()) {
          socket.emit("mark-sold-error", { message: "Not authorized" });
          return;
        }

        // Idempotent: check if already sold
        const player = await Player.findById(sanitizedPlayerId);
        if (player && player.isSold) {
          socket.emit("mark-sold-success", { message: "Player already sold" });
          return;
        }

        const activeBid = await getWinningBid(sanitizedTournamentId, sanitizedPlayerId);
        if (!activeBid) {
          socket.emit("mark-sold-error", {
            message: "No active bid found for this player",
          });
          return;
        }

        await processWinningBid(activeBid);

        tournament.currentPlayerId = null;
        tournament.auctionStatus = "sold";
        await tournament.save();

        const populatedBid = await Bid.findById(activeBid._id)
          .populate("playerId", "name")
          .populate("teamId", "name short logo primaryColor secondaryColor");

        io.to(`tournament-${tournamentId}`).emit("player-sold", {
          playerId: sanitizedPlayerId,
          playerName: populatedBid.playerId.name,
          teamId: populatedBid.teamId._id,
          teamName: populatedBid.teamId.name,
          teamShort: populatedBid.teamId.short,
          teamLogo: populatedBid.teamId.logo,
          primaryColor: populatedBid.teamId.primaryColor,
          secondaryColor: populatedBid.teamId.secondaryColor,
          soldPrice: populatedBid.amount,
        });

        socket.emit("mark-sold-success", {
          message: "Player marked as sold",
          bid: populatedBid,
        });
      } catch (error) {
        socket.emit("mark-sold-error", { message: "Failed to mark player as sold" });
      }
    });

    // --- mark-unsold (organizer-only action) ---
    socket.on("mark-unsold", async (data) => {
      try {
        if (!eventRateLimiter()) {
          socket.emit("rate-limited", { message: "Too many requests." });
          return;
        }

        const { tournamentId, playerId } = data || {};
        const sanitizedTournamentId = sanitizeId(tournamentId);
        const sanitizedPlayerId = sanitizeId(playerId);

        if (!sanitizedTournamentId || !sanitizedPlayerId) {
          socket.emit("mark-unsold-error", { message: "Invalid input data" });
          return;
        }

        const tournament = await Tournament.findById(sanitizedTournamentId);
        if (!tournament) {
          socket.emit("mark-unsold-error", { message: "Tournament not found" });
          return;
        }

        // Only tournament creator can mark unsold
        if (tournament.createdBy && tournament.createdBy.toString() !== socket.user._id.toString()) {
          socket.emit("mark-unsold-error", { message: "Not authorized" });
          return;
        }

        let cancelledCount = 0;
        try {
          const session = await Bid.startSession();
          try {
            await session.withTransaction(async () => {
              cancelledCount = await cancelActiveBids(sanitizedTournamentId, sanitizedPlayerId, session);
            });
          } finally {
            await session.endSession();
          }
        } catch (txErr) {
          cancelledCount = await cancelActiveBids(sanitizedTournamentId, sanitizedPlayerId);
        }

        tournament.currentPlayerId = null;
        tournament.auctionStatus = "unsold";
        if (!tournament.unsoldPlayerIds.includes(sanitizedPlayerId)) {
          tournament.unsoldPlayerIds.push(sanitizedPlayerId);
        }
        await tournament.save();

        const player = await Player.findById(sanitizedPlayerId);

        io.to(`tournament-${tournamentId}`).emit("player-unsold", {
          playerId: sanitizedPlayerId,
          playerName: player ? player.name : "Unknown",
          cancelledBids: cancelledCount,
        });

        socket.emit("mark-unsold-success", {
          message: "Player marked as unsold",
          cancelledBids: cancelledCount,
        });
      } catch (error) {
        socket.emit("mark-unsold-error", { message: "Failed to mark player as unsold" });
      }
    });

    // --- get-auction-state ---
    socket.on("get-auction-state", async (data) => {
      try {
        const { tournamentId } = data || {};
        const sanitizedTournamentId = sanitizeId(tournamentId);

        if (!sanitizedTournamentId) {
          socket.emit("auction-state-error", { message: "Invalid tournament ID" });
          return;
        }

        const tournament = await Tournament.findById(sanitizedTournamentId)
          .populate("currentPlayerId", "name role style basePrice");

        if (!tournament) {
          socket.emit("auction-state-error", { message: "Tournament not found" });
          return;
        }

        let currentBid = null;
        let highestBidder = null;

        if (tournament.currentPlayerId && tournament.auctionStatus === "bidding") {
          currentBid = await getWinningBid(sanitizedTournamentId, tournament.currentPlayerId._id);
          if (currentBid) {
            const populatedBid = await Bid.findById(currentBid._id)
              .populate("teamId", "name short");
            currentBid = populatedBid;
            highestBidder = populatedBid.teamId;
          }
        }

        socket.emit("auction-state", {
          currentPlayer: tournament.currentPlayerId,
          currentBid,
          highestBidder,
          auctionStatus: tournament.auctionStatus,
          unsoldPlayerIds: tournament.unsoldPlayerIds || [],
          tournament: { playerBasePrice: tournament.playerBasePrice || 0 },
        });
      } catch (error) {
        socket.emit("auction-state-error", { message: "Failed to get auction state" });
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      // Clean up joined tournaments tracking
      socket.joinedTournaments?.clear();
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
};

export const emitToTournament = (tournamentId, event, data) => {
  if (io) {
    io.to(`tournament-${tournamentId}`).emit(event, data);
  }
};
