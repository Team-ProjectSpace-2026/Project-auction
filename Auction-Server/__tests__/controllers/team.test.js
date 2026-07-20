import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';

import User from '../../src/models/User.js';
import Tournament from '../../src/models/Tournament.js';
import Team from '../../src/models/Team.js';
import Player from '../../src/models/Player.js';
import Bid from '../../src/models/Bid.js';
import teamRoutes from '../../src/routes/team.routes.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';
import { xssSanitize } from '../../src/middleware/sanitize.js';
import { signToken } from '../helpers.js';

let mongoServer;
let app;
let user;
let token;
let tournament;

const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-that-is-at-least-32-chars-long';

beforeAll(async () => {
  process.env.JWT_SECRET = JWT_SECRET;
  process.env.NODE_ENV = 'test';
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  app = express();
  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));
  app.use(xssSanitize);
  app.use('/api/teams', teamRoutes);
  app.use(errorHandler);

  user = new User({
    name: 'Team Owner',
    email: 'owner@example.com',
    mobile: '9876543210',
    password: 'Password123',
  });
  await user.save();
  token = signToken(user._id);

  tournament = new Tournament({
    name: 'Test Tournament',
    status: 'Upcoming',
    date: new Date('2027-12-31'),
    teams: 4,
    venue: 'Test Stadium',
    budgetPerTeam: 1000000,
    maxPlayersPerTeam: 15,
    playerBasePrice: 50000,
    owner: user._id,
    createdBy: user._id,
  });
  await tournament.save();
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

afterEach(async () => {
  await Team.deleteMany({});
  await Player.deleteMany({});
  await Bid.deleteMany({});
});

const authGet = (url) =>
  request(app).get(url).set('Cookie', [`token=${token}`]);

const authPost = (url, data) =>
  request(app).post(url).set('Cookie', [`token=${token}`]).send(data);

const authPut = (url, data) =>
  request(app).put(url).set('Cookie', [`token=${token}`]).send(data);

const authDelete = (url) =>
  request(app).delete(url).set('Cookie', [`token=${token}`]);

const createTeamData = (overrides = {}) => ({
  name: 'Chennai Super Kings',
  short: 'CSK',
  budget: 1000000,
  maxPlayers: 15,
  totalBudget: 1000000,
  tournamentId: tournament._id.toString(),
  ownerName: 'MS Dhoni',
  ...overrides,
});

describe('Team Controller', () => {
  describe('POST /api/teams', () => {
    it('creates a team with remainingBudget = totalBudget', async () => {
      const res = await authPost('/api/teams', createTeamData());
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Chennai Super Kings');
      expect(res.body.remainingBudget).toBe(1000000);
      expect(res.body.totalBudget).toBe(1000000);
    });

    it('rejects duplicate team name in same tournament', async () => {
      await authPost('/api/teams', createTeamData());
      const res = await authPost('/api/teams', createTeamData());
      expect(res.status).toBe(400);
    });

    it('rejects invalid tournamentId', async () => {
      const res = await authPost('/api/teams', createTeamData({
        tournamentId: 'notavalidid',
      }));
      expect(res.status).toBe(400);
    });

    it('returns 404 for non-existent tournament', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await authPost('/api/teams', createTeamData({
        tournamentId: fakeId.toString(),
      }));
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/teams', () => {
    it('returns teams for authenticated user', async () => {
      await authPost('/api/teams', createTeamData({ name: 'Team A', short: 'TA' }));
      await authPost('/api/teams', createTeamData({ name: 'Team B', short: 'TB' }));

      const res = await authGet('/api/teams');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });

    it('filters by tournamentId', async () => {
      const otherTournament = new Tournament({
        name: 'Other',
        status: 'Upcoming',
        date: new Date('2027-12-31'),
        teams: 2,
        venue: 'Other',
        budgetPerTeam: 500000,
        maxPlayersPerTeam: 10,
        playerBasePrice: 25000,
        owner: user._id,
        createdBy: user._id,
      });
      await otherTournament.save();

      await authPost('/api/teams', createTeamData({ name: 'T1', short: 'T1' }));
      await authPost('/api/teams', createTeamData({
        name: 'Other Team',
        short: 'OT',
        tournamentId: otherTournament._id.toString(),
      }));

      const res = await authGet(`/api/teams?tournamentId=${tournament._id}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });
  });

  describe('GET /api/teams/:id', () => {
    it('returns team with sold players', async () => {
      const createRes = await authPost('/api/teams', createTeamData());
      const teamId = createRes.body._id;

      // Create a sold player for this team
      const player = new Player({
        name: 'Sold Player',
        role: 'Batsman',
        tournamentId: tournament._id,
        isSold: true,
        soldTo: teamId,
        soldPrice: 200000,
        createdBy: user._id,
      });
      await player.save();

      const res = await authGet(`/api/teams/${teamId}`);
      expect(res.status).toBe(200);
      expect(res.body.players).toHaveLength(1);
      expect(res.body.players[0].name).toBe('Sold Player');
    });

    it('rejects access by non-owner', async () => {
      const createRes = await authPost('/api/teams', createTeamData());
      const teamId = createRes.body._id;

      const otherUser = new User({
        name: 'Other',
        email: 'other@example.com',
        mobile: '9876543299',
        password: 'Password123',
      });
      await otherUser.save();
      const otherToken = signToken(otherUser._id);

      const res = await request(app)
        .get(`/api/teams/${teamId}`)
        .set('Cookie', [`token=${otherToken}`]);
      expect(res.status).toBe(403);
    });
  });

  describe('PUT /api/teams/:id', () => {
    it('updates team and recalculates remainingBudget', async () => {
      const createRes = await authPost('/api/teams', createTeamData());
      const teamId = createRes.body._id;

      // Simulate some budget spent
      await Team.findByIdAndUpdate(teamId, { remainingBudget: 800000 });

      const res = await authPut(`/api/teams/${teamId}`, createTeamData({
        name: 'Updated CSK',
        totalBudget: 1500000,
      }));
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated CSK');
      // remainingBudget = totalBudget - (totalBudget - oldRemaining) = 1500000 - (1000000 - 800000) = 1300000
      expect(res.body.remainingBudget).toBe(1300000);
    });

    it('rejects duplicate name (excluding self)', async () => {
      await authPost('/api/teams', createTeamData({ name: 'Team A', short: 'TA' }));
      const createRes = await authPost('/api/teams', createTeamData({ name: 'Team B', short: 'TB' }));
      const teamId = createRes.body._id;

      const res = await authPut(`/api/teams/${teamId}`, createTeamData({
        name: 'Team A',
        short: 'TA',
      }));
      expect(res.status).toBe(409);
    });

    it('allows updating own team to same name', async () => {
      const createRes = await authPost('/api/teams', createTeamData());
      const teamId = createRes.body._id;

      const res = await authPut(`/api/teams/${teamId}`, createTeamData());
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /api/teams/:id', () => {
    it('transactionally deletes team, reverts sold players, cancels bids', async () => {
      const createRes = await authPost('/api/teams', createTeamData());
      const teamId = createRes.body._id;

      // Create a sold player for this team
      const player = new Player({
        name: 'Sold Player',
        role: 'Batsman',
        tournamentId: tournament._id,
        isSold: true,
        soldTo: teamId,
        soldPrice: 200000,
        createdBy: user._id,
      });
      await player.save();

      // Create an active bid for this team
      const bid = new Bid({
        tournamentId: tournament._id,
        playerId: player._id,
        teamId,
        amount: 200000,
        status: 'Active',
      });
      await bid.save();

      const res = await authDelete(`/api/teams/${teamId}`);
      expect(res.status).toBe(200);

      // Team deleted
      const teamCheck = await Team.findById(teamId);
      expect(teamCheck).toBeNull();

      // Player reverted
      const playerCheck = await Player.findById(player._id);
      expect(playerCheck.isSold).toBe(false);
      expect(playerCheck.soldTo).toBeNull();
      expect(playerCheck.soldPrice).toBeNull();

      // Bid cancelled
      const bidCheck = await Bid.findById(bid._id);
      expect(bidCheck.status).toBe('Cancelled');
    });

    it('rejects delete by non-owner', async () => {
      const createRes = await authPost('/api/teams', createTeamData());
      const teamId = createRes.body._id;

      const otherUser = new User({
        name: 'Other',
        email: 'other@example.com',
        mobile: '9876543299',
        password: 'Password123',
      });
      await otherUser.save();
      const otherToken = signToken(otherUser._id);

      const res = await request(app)
        .delete(`/api/teams/${teamId}`)
        .set('Cookie', [`token=${otherToken}`]);
      expect(res.status).toBe(403);
    });
  });
});
