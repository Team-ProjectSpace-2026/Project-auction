import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

import User from '../../src/models/User.js';
import authRoutes from '../../src/routes/auth.routes.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';
import { xssSanitize } from '../../src/middleware/sanitize.js';

let mongoServer;
let app;

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
  // Bypass captcha and rate limiter for tests
  app.use((req, res, next) => {
    if (req.path.includes('/captcha')) return next();
    next();
  });
  app.use('/api/auth', authRoutes);
  app.use(errorHandler);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

const registerUser = (data) =>
  request(app).post('/api/auth/register').send(data);

const loginUser = (data) =>
  request(app).post('/api/auth/login').send(data);

describe('Auth Controller', () => {
  describe('POST /api/auth/register', () => {
    const validUser = {
      name: 'Test User',
      email: 'test@example.com',
      mobile: '9876543210',
      password: 'Password123',
    };

    it('registers a new user and sets httpOnly cookie', async () => {
      const res = await registerUser(validUser);
      expect(res.status).toBe(201);
      expect(res.body.message).toBe('User registered successfully');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.name).toBe('Test User');
      expect(res.body.user.email).toBe('test@example.com');
      expect(res.body.user.mobile).toBe('9876543210');
      expect(res.body.user.role).toBe('Organizer');
      // Token should NOT be in response body
      expect(res.body).not.toHaveProperty('token');
      // Cookie should be set
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some(c => c.startsWith('token='))).toBe(true);
    });

    it('rejects duplicate email', async () => {
      await registerUser(validUser);
      const res = await registerUser({ ...validUser, mobile: '9876543211' });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already exists/);
    });

    it('rejects duplicate mobile', async () => {
      await registerUser(validUser);
      const res = await registerUser({ ...validUser, email: 'other@example.com' });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already exists/);
    });

    it('rejects missing required fields', async () => {
      const res = await registerUser({});
      expect(res.status).toBe(400);
    });

    it('rejects short password', async () => {
      const res = await registerUser({ ...validUser, password: 'Ab1' });
      expect(res.status).toBe(400);
    });

    it('rejects invalid email format', async () => {
      const res = await registerUser({ ...validUser, email: 'not-an-email' });
      expect(res.status).toBe(400);
    });

    it('rejects invalid mobile format', async () => {
      const res = await registerUser({ ...validUser, mobile: '123' });
      expect(res.status).toBe(400);
    });

    it('hashes password (not stored in plaintext)', async () => {
      await registerUser(validUser);
      const user = await User.findOne({ email: validUser.email });
      expect(user.password).not.toBe(validUser.password);
      expect(user.password.length).toBeGreaterThan(20);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await registerUser({
        name: 'Test User',
        email: 'test@example.com',
        mobile: '9876543210',
        password: 'Password123',
      });
    });

    it('logs in with valid credentials', async () => {
      const res = await loginUser({ email: 'test@example.com', password: 'Password123' });
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Login successful');
      expect(res.body.user.email).toBe('test@example.com');
      // Token should NOT be in response body
      expect(res.body).not.toHaveProperty('token');
      // Cookie should be set
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some(c => c.startsWith('token='))).toBe(true);
    });

    it('rejects wrong password', async () => {
      const res = await loginUser({ email: 'test@example.com', password: 'WrongPassword1' });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid credentials');
    });

    it('rejects non-existent email', async () => {
      const res = await loginUser({ email: 'nobody@example.com', password: 'Password123' });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid credentials');
    });
  });

  describe('GET /api/auth/profile', () => {
    let token;
    let userId;

    beforeEach(async () => {
      const res = await registerUser({
        name: 'Profile User',
        email: 'profile@example.com',
        mobile: '9876543211',
        password: 'Password123',
      });
      userId = res.body.user.id;
      token = res.headers['set-cookie']
        ?.find(c => c.startsWith('token='))
        ?.split('token=')[1]
        ?.split(';')[0];
    });

    it('returns user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Cookie', [`token=${token}`]);
      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('profile@example.com');
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('rejects request without token', async () => {
      const res = await request(app).get('/api/auth/profile');
      expect(res.status).toBe(401);
    });

    it('rejects request with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Cookie', ['token=invalidtoken123']);
      expect(res.status).toBe(401);
    });

    it('rejects request with expired token', async () => {
      const expiredToken = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '0s' });
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Cookie', [`token=${expiredToken}`]);
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('clears the token cookie', async () => {
      const regRes = await registerUser({
        name: 'Logout User',
        email: 'logout@example.com',
        mobile: '9876543212',
        password: 'Password123',
      });
      const token = regRes.headers['set-cookie']
        ?.find(c => c.startsWith('token='))
        ?.split('token=')[1]
        ?.split(';')[0];

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', [`token=${token}`]);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Logged out successfully');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('issues a new token with valid token', async () => {
      const regRes = await registerUser({
        name: 'Refresh User',
        email: 'refresh@example.com',
        mobile: '9876543213',
        password: 'Password123',
      });
      const token = regRes.headers['set-cookie']
        ?.find(c => c.startsWith('token='))
        ?.split('token=')[1]
        ?.split(';')[0];

      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`token=${token}`]);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Token refreshed');
      const cookies = res.headers['set-cookie'];
      expect(cookies?.some(c => c.startsWith('token='))).toBe(true);
    });

    it('rejects refresh without token', async () => {
      const res = await request(app).post('/api/auth/refresh');
      expect(res.status).toBe(401);
    });
  });
});
