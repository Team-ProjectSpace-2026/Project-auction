import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';

import User from '../../src/models/User.js';
import Tournament from '../../src/models/Tournament.js';
import Player from '../../src/models/Player.js';
import Team from '../../src/models/Team.js';
import dashboardRoutes from '../../src/routes/dashboard.routes.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';
import { xssSanitize } from '../../src/middleware/sanitize.js';
import { signToken } from '../helpers.js';

let mongoServer;
let app;
let user;
let token;

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
  app.use('/api/dashboard', dashboardRoutes);
  app.use(errorHandler);

  user = new User({
    name: 'Dashboard User',
    email: 'dash@example.com',
    mobile: '9876543210',
    password: 'Password123',
  });
  await user.save();
  token = signToken(user._id);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

afterEach(async () => {
  await Tournament.deleteMany({});
  await Player.deleteMany({});
  await Team.deleteMany({});
});

const authGet = (url) =>
  request(app).get(url).set('Cookie', [`token=${token}`]);

describe('Dashboard Controller', () => {
  describe('GET /api/dashboard', () => {
    it('returns empty stats for user with no tournaments', async () => {
      const res = await authGet('/api/dashboard');
      expect(res.status).toBe(200);
      expect(res.body.metrics.total).toBe(0);
      expect(res.body.stats.totalPlayers).toBe(0);
      expect(res.body.stats.totalTeams).toBe(0);
      expect(res.body.stats.totalBudget).toBe(0);
      expect(res.body.tournaments).toHaveLength(0);
    });

    it('returns aggregated stats across tournaments', async () => {
      // Create tournaments with different dates
      const upcoming = new Tournament({
        name: 'Upcoming',
        status: 'Upcoming',
        date: new Date('2027-12-31'),
        teams: 2,
        venue: 'A',
        budgetPerTeam: 500000,
        maxPlayersPerTeam: 10,
        playerBasePrice: 25000,
        owner: user._id,
        createdBy: user._id,
      });
      await upcoming.save();

      const completed = new Tournament({
        name: 'Completed',
        status: 'Completed',
        date: new Date('2020-01-01'),
        teams: 2,
        venue: 'B',
        budgetPerTeam: 500000,
        maxPlayersPerTeam: 10,
        playerBasePrice: 25000,
        owner: user._id,
        createdBy: user._id,
      });
      await completed.save();

      // Create teams
      const team1 = new Team({
        name: 'Team A',
        short: 'TA',
        budget: 500000,
        totalBudget: 500000,
        remainingBudget: 400000,
        ownerName: 'Owner',
        tournamentId: upcoming._id,
        createdBy: user._id,
      });
      await team1.save();

      // Create players
      await Player.create([
        {
          name: 'Player 1',
          role: 'Batsman',
          tournamentId: upcoming._id,
          createdBy: user._id,
        },
        {
          name: 'Player 2',
          role: 'Bowler',
          tournamentId: upcoming._id,
          createdBy: user._id,
        },
      ]);

      const res = await authGet('/api/dashboard');
      expect(res.status).toBe(200);
      expect(res.body.metrics.total).toBe(2);
      expect(res.body.metrics.upcoming).toBe(1);
      expect(res.body.metrics.completed).toBe(1);
      expect(res.body.stats.totalPlayers).toBe(2);
      expect(res.body.stats.totalTeams).toBe(1);
      expect(res.body.stats.totalBudget).toBe(500000);
      expect(res.body.tournaments).toHaveLength(2);
    });

    it('correctly computes dynamic status based on date', async () => {
      // Today's tournament
      const today = new Tournament({
        name: 'Today',
        status: 'Upcoming',
        date: new Date(),
        teams: 1,
        venue: 'X',
        budgetPerTeam: 100000,
        maxPlayersPerTeam: 5,
        playerBasePrice: 10000,
        owner: user._id,
        createdBy: user._id,
      });
      await today.save();

      const res = await authGet('/api/dashboard');
      expect(res.status).toBe(200);
      const todayTournament = res.body.tournaments.find(t => t.name === 'Today');
      expect(todayTournament.status).toBe('Active');
    });

    it('rejects unauthenticated request', async () => {
      const res = await request(app).get('/api/dashboard');
      expect(res.status).toBe(401);
    });
  });
});
