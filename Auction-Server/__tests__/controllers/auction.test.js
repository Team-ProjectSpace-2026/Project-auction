import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';

import User from '../../src/models/User.js';
import Tournament from '../../src/models/Tournament.js';
import Player from '../../src/models/Player.js';
import Team from '../../src/models/Team.js';
import Bid from '../../src/models/Bid.js';
import auctionRoutes from '../../src/routes/auction.routes.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';
import { xssSanitize } from '../../src/middleware/sanitize.js';
import { signToken } from '../helpers.js';

let mongoServer;
let app;
let user;
let token;
let tournament;
let team;
let player;

const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-that-is-at-least-32-chars-long';

beforeAll(async () => {
  process.env.JWT_SECRET = JWT_SECRET;
  process.env.NODE_ENV = 'test';
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  app = express();
  app.use(cookieParser());
  app.use(express.json());
  app.use(xssSanitize);
  app.use('/api/auction', auctionRoutes);
  app.use(errorHandler);

  user = new User({
    name: 'Auctioneer',
    email: 'auction@example.com',
    mobile: '9876543210',
    password: 'Password123',
  });
  await user.save();
  token = signToken(user._id);

  tournament = new Tournament({
    name: 'Auction Tournament',
    status: 'Upcoming',
    date: new Date('2027-12-31'),
    teams: 4,
    venue: 'Stadium',
    budgetPerTeam: 1000000,
    maxPlayersPerTeam: 15,
    playerBasePrice: 50000,
    owner: user._id,
    createdBy: user._id,
    auctionStatus: 'idle',
  });
  await tournament.save();

  team = new Team({
    name: 'Mumbai Indians',
    short: 'MI',
    budget: 1000000,
    maxPlayers: 15,
    totalBudget: 1000000,
    remainingBudget: 1000000,
    ownerName: 'Mukesh',
    tournamentId: tournament._id,
    createdBy: user._id,
  });
  await team.save();

  player = new Player({
    name: 'Rohit Sharma',
    role: 'Batsman',
    battingStyle: 'Right Hand',
    basePrice: 100000,
    tournamentId: tournament._id,
    createdBy: user._id,
  });
  await player.save();
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

afterEach(async () => {
  await Bid.deleteMany({});
  // Reset player sold status
  await Player.updateMany({}, { $set: { isSold: false, soldTo: null, soldPrice: null } });
  // Reset team budget
  await Team.updateMany({}, { $set: { remainingBudget: 1000000, players: 0 } });
  // Reset tournament
  await Tournament.updateMany({}, { $set: { auctionStatus: 'idle', currentPlayerId: null } });
});

const authGet = (url) =>
  request(app).get(url).set('Cookie', [`token=${token}`]);

const authPost = (url, data) =>
  request(app).post(url).set('Cookie', [`token=${token}`]).send(data);

describe('Auction Controller', () => {
  describe('GET /api/auction/:tournamentId', () => {
    it('returns auction state with players, teams, stats', async () => {
      const res = await authGet(`/api/auction/${tournament._id}`);
      expect(res.status).toBe(200);
      expect(res.body.players).toBeDefined();
      expect(res.body.teams).toBeDefined();
      expect(res.body.stats).toBeDefined();
      expect(res.body.stats.totalPlayersSold).toBe(0);
      expect(res.body.stats.totalBudgetUsed).toBe(0);
    });
  });

  describe('POST /api/auction/:tournamentId/bid', () => {
    it('places a bid when auction is active', async () => {
      // Set up auction state
      tournament.auctionStatus = 'bidding';
      tournament.currentPlayerId = player._id;
      await tournament.save();

      const res = await authPost(`/api/auction/${tournament._id}/bid`, {
        amount: 150000,
        teamId: team._id.toString(),
        playerId: player._id.toString(),
      });
      expect(res.status).toBe(201);
      expect(res.body.bid.amount).toBe(150000);
      expect(res.body.bid.status).toBe('Active');
    });

    it('rejects bid when no active auction', async () => {
      const res = await authPost(`/api/auction/${tournament._id}/bid`, {
        amount: 150000,
        teamId: team._id.toString(),
        playerId: player._id.toString(),
      });
      expect(res.status).toBe(400);
    });

    it('rejects bid for wrong player', async () => {
      tournament.auctionStatus = 'bidding';
      tournament.currentPlayerId = player._id;
      await tournament.save();

      const otherPlayer = new Player({
        name: 'Other',
        role: 'Bowler',
        tournamentId: tournament._id,
        createdBy: user._id,
      });
      await otherPlayer.save();

      const res = await authPost(`/api/auction/${tournament._id}/bid`, {
        amount: 150000,
        teamId: team._id.toString(),
        playerId: otherPlayer._id.toString(),
      });
      expect(res.status).toBe(400);
    });

    it('rejects bid exceeding team budget', async () => {
      tournament.auctionStatus = 'bidding';
      tournament.currentPlayerId = player._id;
      await tournament.save();

      const res = await authPost(`/api/auction/${tournament._id}/bid`, {
        amount: 2000000,
        teamId: team._id.toString(),
        playerId: player._id.toString(),
      });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auction/:tournamentId/mark-sold', () => {
    it('marks player as sold and deducts budget', async () => {
      // Place a bid first
      tournament.auctionStatus = 'bidding';
      tournament.currentPlayerId = player._id;
      await tournament.save();

      await authPost(`/api/auction/${tournament._id}/bid`, {
        amount: 150000,
        teamId: team._id.toString(),
        playerId: player._id.toString(),
      });

      const res = await authPost(`/api/auction/${tournament._id}/mark-sold`, {
        playerId: player._id.toString(),
      });
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/sold/i);

      // Verify player is sold
      const playerCheck = await Player.findById(player._id);
      expect(playerCheck.isSold).toBe(true);
      expect(playerCheck.soldTo.toString()).toBe(team._id.toString());
      expect(playerCheck.soldPrice).toBe(150000);

      // Verify team budget deducted
      const teamCheck = await Team.findById(team._id);
      expect(teamCheck.remainingBudget).toBe(850000);
      expect(teamCheck.players).toBe(1);

      // Verify bid is Won
      const bidCheck = await Bid.findOne({ playerId: player._id, status: 'Won' });
      expect(bidCheck).not.toBeNull();
    });

    it('returns 400 when no active bid', async () => {
      const res = await authPost(`/api/auction/${tournament._id}/mark-sold`, {
        playerId: player._id.toString(),
      });
      expect(res.status).toBe(400);
    });

    it('returns 400 for invalid player ID', async () => {
      const res = await authPost(`/api/auction/${tournament._id}/mark-sold`, {
        playerId: 'notavalidid',
      });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auction/:tournamentId/mark-unsold', () => {
    it('cancels all active bids for the player', async () => {
      tournament.auctionStatus = 'bidding';
      tournament.currentPlayerId = player._id;
      await tournament.save();

      // Place a bid
      await authPost(`/api/auction/${tournament._id}/bid`, {
        amount: 150000,
        teamId: team._id.toString(),
        playerId: player._id.toString(),
      });

      const res = await authPost(`/api/auction/${tournament._id}/mark-unsold`, {
        playerId: player._id.toString(),
      });
      expect(res.status).toBe(200);
      expect(res.body.cancelledBids).toBe(1);

      // Verify bid cancelled
      const bidCheck = await Bid.findOne({ playerId: player._id });
      expect(bidCheck.status).toBe('Cancelled');

      // Verify player NOT sold
      const playerCheck = await Player.findById(player._id);
      expect(playerCheck.isSold).toBe(false);
    });
  });

  describe('GET /api/auction/:tournamentId/bids', () => {
    it('returns paginated bid history', async () => {
      // Create some bids
      tournament.auctionStatus = 'bidding';
      tournament.currentPlayerId = player._id;
      await tournament.save();

      await authPost(`/api/auction/${tournament._id}/bid`, {
        amount: 100000,
        teamId: team._id.toString(),
        playerId: player._id.toString(),
      });
      await authPost(`/api/auction/${tournament._id}/bid`, {
        amount: 120000,
        teamId: team._id.toString(),
        playerId: player._id.toString(),
      });

      const res = await authGet(`/api/auction/${tournament._id}/bids`);
      expect(res.status).toBe(200);
      expect(res.body.bids).toBeDefined();
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.total).toBeGreaterThanOrEqual(2);
    });

    it('filters by playerId', async () => {
      const otherPlayer = new Player({
        name: 'Other',
        role: 'Bowler',
        tournamentId: tournament._id,
        createdBy: user._id,
      });
      await otherPlayer.save();

      tournament.auctionStatus = 'bidding';
      tournament.currentPlayerId = player._id;
      await tournament.save();

      await authPost(`/api/auction/${tournament._id}/bid`, {
        amount: 100000,
        teamId: team._id.toString(),
        playerId: player._id.toString(),
      });

      const res = await authGet(
        `/api/auction/${tournament._id}/bids/${player._id}`
      );
      expect(res.status).toBe(200);
      expect(res.body.bids.every(b => b.playerId._id === player._id.toString())).toBe(true);
    });
  });
});
