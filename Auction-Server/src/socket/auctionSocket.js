import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
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

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User ${socket.user.name} connected`);

    // Join tournament room
    socket.on("join-tournament", (tournamentId) => {
      socket.join(`tournament-${tournamentId}`);
      console.log(`User ${socket.user.name} joined tournament ${tournamentId}`);
    });

    // Handle bid placement
    socket.on("place-bid", async (data) => {
      try {
        const { tournamentId, amount, teamId, playerId } = data;

        // Verify user has tournament access
        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
          socket.emit("bid-error", { message: "Tournament not found" });
          return;
        }

        // Reject bids if no active auction or wrong player
        if (
          tournament.auctionStatus !== "bidding" ||
          !tournament.currentPlayerId ||
          tournament.currentPlayerId.toString() !== playerId
        ) {
          socket.emit("bid-error", {
            message: "No active auction for this player",
          });
          return;
        }

        // Validate bid using shared validator
        try {
          await validateBid({ amount, teamId, playerId }, tournamentId);
        } catch (validationError) {
          socket.emit("bid-error", { message: validationError.message });
          return;
        }

        // Get current winning bid atomically
        const currentBid = await getWinningBid(tournamentId, playerId);
        const currentBidAmount = currentBid ? currentBid.amount : 0;

        if (amount <= currentBidAmount) {
          socket.emit("bid-error", {
            message: `Bid must be higher than current bid of ₹${currentBidAmount.toLocaleString()}`,
          });
          return;
        }

         // Atomic bid creation with conditional update for active bid transition
         const session = await Bid.startSession();
         let newBidId;
         try {
           await session.withTransaction(async () => {
             // Create new bid
             const bid = new Bid({
               tournamentId,
               playerId,
               teamId,
               amount,
               status: "Active",
             });
             await bid.save({ session });
             newBidId = bid._id;
 
             // Update previous active bid to Outbid atomically
             if (currentBid) {
               await Bid.updateOne(
                 { _id: currentBid._id, status: "Active" },
                 { $set: { status: "Outbid" } },
                 { session },
               );
             }
           });
         } finally {
           await session.endSession();
         }
 
         // Broadcast bid to all clients in tournament room after transaction resolves
         const populatedBid = await Bid.findById(newBidId)
           .populate("playerId", "name")
           .populate("teamId", "name");
 
         io.to(`tournament-${tournamentId}`).emit("new-bid", {
           bid: populatedBid,
           isWinningBid: true,
         });
 
         // Emit success to bidder
         socket.emit("bid-success", {
           message: "Bid placed successfully",
           bid: populatedBid,
           isWinningBid: true,
         });
      } catch (error) {
        socket.emit("bid-error", { message: error.message });
      }
    });

    // Handle player reveal
    socket.on("reveal-player", async (data) => {
      try {
        const { tournamentId, playerId } = data;

        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
          socket.emit("reveal-error", { message: "Tournament not found" });
          return;
        }

        // Verify player exists and belongs to tournament
        const player = await Player.findById(playerId);
        if (!player || player.tournamentId.toString() !== tournamentId) {
          socket.emit("reveal-error", { message: "Invalid player for this tournament" });
          return;
        }

        if (player.isSold) {
          socket.emit("reveal-error", { message: "Player has already been sold" });
          return;
        }

        // Update tournament state
        tournament.currentPlayerId = playerId;
        tournament.auctionStatus = "bidding";
        await tournament.save();

        // Broadcast revealed player to all clients
        const populatedPlayer = await Player.findById(playerId);
        io.to(`tournament-${tournamentId}`).emit("player-revealed", {
          playerId,
          player: populatedPlayer,
        });
      } catch (error) {
        socket.emit("reveal-error", { message: error.message });
      }
    });

    // Handle auction start
    socket.on("start-auction", async (data) => {
      const { tournamentId } = data;
      // Verify user has tournament access
      const tournament = await Tournament.findById(tournamentId);
      if (!tournament) return;
      io.to(`tournament-${tournamentId}`).emit("auction-started", {
        tournamentId,
      });
    });

    // Handle auction end
    socket.on("end-auction", async (data) => {
      const { tournamentId } = data;
      // Verify user has tournament access
      const tournament = await Tournament.findById(tournamentId);
      if (!tournament) return;
      io.to(`tournament-${tournamentId}`).emit("auction-ended", {
        tournamentId,
      });
    });

    // Handle mark player as sold
    socket.on("mark-sold", async (data) => {
      try {
        const { tournamentId, playerId } = data;

        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
          socket.emit("mark-sold-error", { message: "Tournament not found" });
          return;
        }

        // Find the active bid for this player
        const activeBid = await getWinningBid(tournamentId, playerId);
        if (!activeBid) {
          socket.emit("mark-sold-error", {
            message: "No active bid found for this player",
          });
          return;
        }

        // Process the winning bid (marks bid as Won, updates player and team)
        await processWinningBid(activeBid);

        // Update tournament state
        tournament.currentPlayerId = null;
        tournament.auctionStatus = "sold";
        await tournament.save();

        // Populate response data
        const populatedBid = await Bid.findById(activeBid._id)
          .populate("playerId", "name")
          .populate("teamId", "name");

        // Broadcast to all clients
        io.to(`tournament-${tournamentId}`).emit("player-sold", {
          playerId,
          playerName: populatedBid.playerId.name,
          teamId: populatedBid.teamId._id,
          teamName: populatedBid.teamId.name,
          soldPrice: populatedBid.amount,
        });

        // Emit success to sender
        socket.emit("mark-sold-success", {
          message: "Player marked as sold",
          bid: populatedBid,
        });
      } catch (error) {
        socket.emit("mark-sold-error", { message: error.message });
      }
    });

    // Handle mark player as unsold
    socket.on("mark-unsold", async (data) => {
      try {
        const { tournamentId, playerId } = data;

        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
          socket.emit("mark-unsold-error", { message: "Tournament not found" });
          return;
        }

        // Cancel any active bids for this player
        const session = await Bid.startSession();
        let cancelledCount = 0;
        try {
          await session.withTransaction(async () => {
            cancelledCount = await cancelActiveBids(tournamentId, playerId, session);
          });
        } finally {
          await session.endSession();
        }

        // Update tournament state
        tournament.currentPlayerId = null;
        tournament.auctionStatus = "unsold";
        await tournament.save();

        // Get player name for broadcast
        const player = await Player.findById(playerId);

        // Broadcast to all clients
        io.to(`tournament-${tournamentId}`).emit("player-unsold", {
          playerId,
          playerName: player ? player.name : "Unknown",
          cancelledBids: cancelledCount,
        });

        // Emit success to sender
        socket.emit("mark-unsold-success", {
          message: "Player marked as unsold",
          cancelledBids: cancelledCount,
        });
      } catch (error) {
        socket.emit("mark-unsold-error", { message: error.message });
      }
    });

    // Handle get auction state request
    socket.on("get-auction-state", async (data) => {
      try {
        const { tournamentId } = data;

        const tournament = await Tournament.findById(tournamentId)
          .populate("currentPlayerId", "name role style basePrice");

        if (!tournament) {
          socket.emit("auction-state-error", { message: "Tournament not found" });
          return;
        }

        let currentBid = null;
        let highestBidder = null;

        // If there's a current player, get the active bid
        if (tournament.currentPlayerId && tournament.auctionStatus === "bidding") {
          currentBid = await getWinningBid(tournamentId, tournament.currentPlayerId._id);
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
        });
      } catch (error) {
        socket.emit("auction-state-error", { message: error.message });
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User ${socket.user.name} disconnected`);
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
