import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"]
    }
  });

  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.name} connected`);

    // Join tournament room
    socket.on('join-tournament', (tournamentId) => {
      socket.join(`tournament-${tournamentId}`);
      console.log(`User ${socket.user.name} joined tournament ${tournamentId}`);
    });

    // Handle bid placement
    socket.on('place-bid', async (data) => {
      try {
        const { tournamentId, amount, teamId, playerId } = data;
        
        // Validate bid (this should be done by the API first)
        const Bid = require('../models/Bid.js');
        const currentBid = await Bid.findOne({
          tournamentId,
          playerId,
          status: 'Active'
        }).sort({ amount: -1, timestamp: 1 });

        const currentBidAmount = currentBid ? currentBid.amount : 0;
        
        if (amount <= currentBidAmount) {
          socket.emit('bid-error', {
            message: `Bid must be higher than current bid of ₹${currentBidAmount.toLocaleString()}`
          });
          return;
        }

        // Create bid
        const bid = new Bid({
          tournamentId,
          playerId,
          teamId,
          amount,
          status: 'Active'
        });

        await bid.save();

        // Update winning bid status
        if (currentBid) {
          currentBid.status = 'Outbid';
          await currentBid.save();
        }
        
        // Broadcast bid to all clients in tournament room
        const populatedBid = await Bid.findById(bid._id)
          .populate('playerId', 'name')
          .populate('teamId', 'name');

        io.to(`tournament-${tournamentId}`).emit('new-bid', {
          bid: populatedBid,
          isWinningBid: amount > currentBidAmount
        });

        // Emit success to bidder
        socket.emit('bid-success', {
          message: 'Bid placed successfully',
          bid: populatedBid,
          isWinningBid: amount > currentBidAmount
        });

      } catch (error) {
        socket.emit('bid-error', { message: error.message });
      }
    });

    // Handle player reveal
    socket.on('reveal-player', (data) => {
      const { tournamentId, playerId } = data;
      io.to(`tournament-${tournamentId}`).emit('player-revealed', {
        playerId
      });
    });

    // Handle auction start
    socket.on('start-auction', (data) => {
      const { tournamentId } = data;
      io.to(`tournament-${tournamentId}`).emit('auction-started', {
        tournamentId
      });
    });

    // Handle auction end
    socket.on('end-auction', (data) => {
      const { tournamentId } = data;
      io.to(`tournament-${tournamentId}`).emit('auction-ended', {
        tournamentId
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${socket.user.name} disconnected`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

export const emitToTournament = (tournamentId, event, data) => {
  if (io) {
    io.to(`tournament-${tournamentId}`).emit(event, data);
  }
};