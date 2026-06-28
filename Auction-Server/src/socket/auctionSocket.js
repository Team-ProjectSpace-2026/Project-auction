import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Bid from "../models/Bid.js";
import Tournament from "../models/Tournament.js";
import { validateBid, getWinningBid } from "../utils/bidValidator.js";

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
      const { tournamentId, playerId } = data;
      // Verify user has tournament access
      const tournament = await Tournament.findById(tournamentId);
      if (!tournament) return;
      io.to(`tournament-${tournamentId}`).emit("player-revealed", {
        playerId,
      });
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
