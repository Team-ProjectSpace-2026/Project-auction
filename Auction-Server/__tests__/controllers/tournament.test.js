import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';

import User from '../../src/models/User.js';
import Tournament from '../../src/models/Tournament.js';
import tournamentRoutes from '../../src/routes/tournament.routes.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';
import { xssSanitize } from '../../src/middleware/sanitize.js';
import auth from '../../src/middleware/auth.middleware.js';
import { signToken } from '../helpers.js';

let mongoServer;
let app;
let user;
let token;

const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-that-is-at-least-32-chars-long';

const validTournament = {
  name: 'IPL 2027',
  status: 'Upcoming',
  date: '2027-12-31',
  teams: 4,
  venue: 'Mumbai Stadium',
  budgetPerTeam: 1000000,
  maxPlayersPerTeam: 15,
  playerBasePrice: 50000,
};

beforeAll(async () => {
  process.env.JWT_SECRET = JWT_SECRET;
  process.env.NODE_ENV = 'test';
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  app = express();
  app.use(cookieParser());
  app.use(express.json());
  app.use(xssSanitize);
  app.use('/api/tournaments', tournamentRoutes);
  app.use(errorHandler);

  user = new User({
    name: 'Tourney Owner',
    email: 'owner@example.com',
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
});

const authGet = (url) =>
  request(app).get(url).set('Cookie', [`token=${token}`]);

const authPost = (url, data) =>
  request(app).post(url).set('Cookie', [`token=${token}`]).send(data);

const authPut = (url, data) =>
  request(app).put(url).set('Cookie', [`token=${token}`]).send(data);

const authDelete = (url) =>
  request(app).delete(url).set('Cookie', [`token=${token}`]);

describe('Tournament Controller', () => {
  describe('POST /api/tournaments', () => {
    it('creates a tournament', async () => {
      const res = await authPost('/api/tournaments', validTournament);
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('IPL 2027');
      expect(res.body.owner).toBe(user._id.toString());
    });

    it('rejects unauthenticated request', async () => {
      const res = await request(app).post('/api/tournaments').send(validTournament);
      expect(res.status).toBe(401);
    });

    it('rejects missing required fields', async () => {
      const res = await authPost('/api/tournaments', { name: 'Only Name' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/tournaments', () => {
    it('returns only the authenticated user tournaments', async () => {
      await authPost('/api/tournaments', validTournament);
      await authPost('/api/tournaments', { ...validTournament, name: 'Second' });

      const res = await authGet('/api/tournaments');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });

    it('returns empty array for user with no tournaments', async () => {
      const res = await authGet('/api/tournaments');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(0);
    });
  });

  describe('GET /api/tournaments/:id', () => {
    it('returns a tournament by id', async () => {
      const createRes = await authPost('/api/tournaments', validTournament);
      const id = createRes.body._id;

      const res = await authGet(`/api/tournaments/${id}`);
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('IPL 2027');
    });

    it('returns 404 for non-existent tournament', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await authGet(`/api/tournaments/${fakeId}`);
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/tournaments/:id', () => {
    it('allows owner to update', async () => {
      const createRes = await authPost('/api/tournaments', validTournament);
      const id = createRes.body._id;

      const res = await authPut(`/api/tournaments/${id}`, {
        ...validTournament,
        name: 'Updated Name',
      });
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated Name');
    });

    it('rejects update by non-owner', async () => {
      const createRes = await authPost('/api/tournaments', validTournament);
      const id = createRes.body._id;

      const otherUser = new User({
        name: 'Other',
        email: 'other@example.com',
        mobile: '9876543299',
        password: 'Password123',
      });
      await otherUser.save();
      const otherToken = signToken(otherUser._id);

      const res = await request(app)
        .put(`/api/tournaments/${id}`)
        .set('Cookie', [`token=${otherToken}`])
        .send({ ...validTournament, name: 'Hacked' });
      expect(res.status).toBe(403);
    });

    it('returns 404 for non-existent tournament', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await authPut(`/api/tournaments/${fakeId}`, validTournament);
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/tournaments/:id', () => {
    it('allows owner to delete', async () => {
      const createRes = await authPost('/api/tournaments', validTournament);
      const id = createRes.body._id;

      const res = await authDelete(`/api/tournaments/${id}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/deleted/i);

      const checkRes = await authGet(`/api/tournaments/${id}`);
      expect(checkRes.status).toBe(404);
    });

    it('rejects delete by non-owner', async () => {
      const createRes = await authPost('/api/tournaments', validTournament);
      const id = createRes.body._id;

      const otherUser = new User({
        name: 'Other',
        email: 'other@example.com',
        mobile: '9876543299',
        password: 'Password123',
      });
      await otherUser.save();
      const otherToken = signToken(otherUser._id);

      const res = await request(app)
        .delete(`/api/tournaments/${id}`)
        .set('Cookie', [`token=${otherToken}`]);
      expect(res.status).toBe(403);
    });
  });
});
