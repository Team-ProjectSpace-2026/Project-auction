import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';

import User from '../../src/models/User.js';
import Tournament from '../../src/models/Tournament.js';
import Player from '../../src/models/Player.js';
import playerRoutes from '../../src/routes/player.routes.js';
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
  app.use(express.json());
  app.use(xssSanitize);
  app.use('/api/players', playerRoutes);
  app.use(errorHandler);

  user = new User({
    name: 'Player Admin',
    email: 'admin@example.com',
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
  await Player.deleteMany({});
});

const authGet = (url) =>
  request(app).get(url).set('Cookie', [`token=${token}`]);

const authPost = (url, data) =>
  request(app).post(url).set('Cookie', [`token=${token}`]).send(data);

const authPut = (url, data) =>
  request(app).put(url).set('Cookie', [`token=${token}`]).send(data);

const authDelete = (url) =>
  request(app).delete(url).set('Cookie', [`token=${token}`]);

const publicPost = (url, data) =>
  request(app).post(url).send(data);

describe('Player Controller', () => {
  describe('POST /api/players', () => {
    it('creates a player', async () => {
      const res = await authPost('/api/players', {
        name: 'Virat Kohli',
        role: 'Batsman',
        battingStyle: 'Right Hand',
        basePrice: 150000,
        tournamentId: tournament._id.toString(),
      });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Virat Kohli');
      expect(res.body.role).toBe('Batsman');
    });

    it('derives style from batting/bowling', async () => {
      const res = await authPost('/api/players', {
        name: 'Jasprit Bumrah',
        role: 'Bowler',
        battingStyle: 'Right Hand',
        bowlingStyle: 'Right Arm Fast',
        basePrice: 100000,
        tournamentId: tournament._id.toString(),
      });
      expect(res.status).toBe(201);
      expect(res.body.style).toBe('Right Hand Bat, Right Arm Fast');
    });

    it('rejects unauthenticated request', async () => {
      const res = await request(app).post('/api/players').send({
        name: 'No Auth',
        role: 'Batsman',
        tournamentId: tournament._id.toString(),
      });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/players', () => {
    it('returns players for authenticated user', async () => {
      await authPost('/api/players', {
        name: 'Player 1',
        role: 'Batsman',
        tournamentId: tournament._id.toString(),
      });
      await authPost('/api/players', {
        name: 'Player 2',
        role: 'Bowler',
        tournamentId: tournament._id.toString(),
      });

      const res = await authGet('/api/players');
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });

    it('filters by tournamentId', async () => {
      await authPost('/api/players', {
        name: 'Player A',
        role: 'Batsman',
        tournamentId: tournament._id.toString(),
      });

      const res = await authGet(`/api/players?tournamentId=${tournament._id}`);
      expect(res.status).toBe(200);
      expect(res.body.every(p => p.tournamentId._id === tournament._id.toString())).toBe(true);
    });

    it('filters by role', async () => {
      await authPost('/api/players', {
        name: 'Batsman',
        role: 'Batsman',
        tournamentId: tournament._id.toString(),
      });
      await authPost('/api/players', {
        name: 'Bowler',
        role: 'Bowler',
        tournamentId: tournament._id.toString(),
      });

      const res = await authGet(`/api/players?tournamentId=${tournament._id}&role=Batsman`);
      expect(res.status).toBe(200);
      expect(res.body.every(p => p.role === 'Batsman')).toBe(true);
    });

    it('search is regex-safe (no injection)', async () => {
      await authPost('/api/players', {
        name: 'Normal Player',
        role: 'Batsman',
        tournamentId: tournament._id.toString(),
      });

      const res = await authGet(`/api/players?tournamentId=${tournament._id}&search=.*`);
      expect(res.status).toBe(200);
    });
  });

  describe('PUT /api/players/:id', () => {
    it('allows owner to update player', async () => {
      const createRes = await authPost('/api/players', {
        name: 'Update Me',
        role: 'Batsman',
        tournamentId: tournament._id.toString(),
      });
      const id = createRes.body._id;

      const res = await authPut(`/api/players/${id}`, { name: 'Updated Name' });
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated Name');
    });

    it('rejects update by non-owner', async () => {
      const createRes = await authPost('/api/players', {
        name: 'Protected Player',
        role: 'Batsman',
        tournamentId: tournament._id.toString(),
      });
      const id = createRes.body._id;

      const otherUser = new User({
        name: 'Hacker',
        email: 'hacker@example.com',
        mobile: '9876543299',
        password: 'Password123',
      });
      await otherUser.save();
      const otherToken = signToken(otherUser._id);

      const res = await request(app)
        .put(`/api/players/${id}`)
        .set('Cookie', [`token=${otherToken}`])
        .send({ name: 'Hacked' });
      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/players/:id', () => {
    it('soft-deletes a player', async () => {
      const createRes = await authPost('/api/players', {
        name: 'Delete Me',
        role: 'Batsman',
        tournamentId: tournament._id.toString(),
      });
      const id = createRes.body._id;

      const res = await authDelete(`/api/players/${id}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/deleted/i);

      // Should not appear in normal queries
      const player = await Player.findById(id);
      expect(player.deleted).toBe(true);
    });
  });

  describe('POST /api/players/register/:tournamentId (public)', () => {
    it('allows public player registration', async () => {
      const res = await publicPost(
        `/api/players/register/${tournament._id}`,
        {
          playerName: 'Public Player',
          age: 25,
          mobile: '9876543211',
          primaryRole: 'Batsman',
          battingStyle: 'Right Hand',
        }
      );
      expect(res.status).toBe(201);
      expect(res.body.message).toMatch(/success/i);
      expect(res.body.player.isRegistered).toBe(true);
    });

    it('rejects duplicate mobile in same tournament', async () => {
      await publicPost(`/api/players/register/${tournament._id}`, {
        playerName: 'Player One',
        age: 25,
        mobile: '9876543222',
        primaryRole: 'Batsman',
      });

      const res = await publicPost(`/api/players/register/${tournament._id}`, {
        playerName: 'Player Two',
        age: 30,
        mobile: '9876543222',
        primaryRole: 'Bowler',
      });
      expect(res.status).toBe(409);
    });

    it('rejects registration after deadline', async () => {
      tournament.registrationEndDate = new Date('2020-01-01');
      await tournament.save();

      const res = await publicPost(`/api/players/register/${tournament._id}`, {
        playerName: 'Late Player',
        age: 25,
        mobile: '9876543233',
        primaryRole: 'Batsman',
      });
      expect(res.status).toBe(403);
    });

    it('returns 404 for non-existent tournament', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await publicPost(`/api/players/register/${fakeId}`, {
        playerName: 'Ghost',
        age: 25,
        mobile: '9876543244',
        primaryRole: 'Batsman',
      });
      expect(res.status).toBe(404);
    });

    it('returns 400 for invalid tournament ID format', async () => {
      const res = await publicPost('/api/players/register/notavalidid', {
        playerName: 'Bad ID',
        age: 25,
        mobile: '9876543255',
        primaryRole: 'Batsman',
      });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/players/public/:tournamentId', () => {
    it('returns tournament name for registration page', async () => {
      const res = await request(app).get(`/api/players/public/${tournament._id}`);
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Test Tournament');
    });

    it('returns 404 for non-existent tournament', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/players/public/${fakeId}`);
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/players/registered/:tournamentId', () => {
    it('returns only registered players', async () => {
      // Admin-created (not registered)
      await authPost('/api/players', {
        name: 'Admin Player',
        role: 'Batsman',
        tournamentId: tournament._id.toString(),
      });
      // Public registered
      await publicPost(`/api/players/register/${tournament._id}`, {
        playerName: 'Public Player',
        age: 25,
        mobile: '9876543266',
        primaryRole: 'Bowler',
      });

      const res = await request(app).get(`/api/players/registered/${tournament._id}`);
      expect(res.status).toBe(200);
      expect(res.body.every(p => p.isRegistered === true)).toBe(true);
    });
  });
});
