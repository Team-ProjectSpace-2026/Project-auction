import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import auth from '../../src/middleware/auth.middleware.js';
import User from '../../src/models/User.js';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-that-is-at-least-32-chars-long';

beforeAll(async () => {
  process.env.JWT_SECRET = JWT_SECRET;
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

const createMockReq = (overrides = {}) => ({
  cookies: {},
  ...overrides,
});

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const createMockNext = () => jest.fn();

describe('Auth Middleware', () => {
  let user;

  beforeEach(async () => {
    user = new User({
      name: 'Auth User',
      email: 'auth@example.com',
      mobile: '9876543210',
      password: 'Password123',
    });
    await user.save();
  });

  it('attaches user to req with valid token', async () => {
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
    const req = createMockReq({ cookies: { token } });
    const res = createMockRes();
    const next = createMockNext();

    await auth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.email).toBe('auth@example.com');
    expect(req.user.password).toBeUndefined();
  });

  it('rejects request without token', async () => {
    const req = createMockReq();
    const res = createMockRes();
    const next = createMockNext();

    await auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('token') })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects request with invalid token', async () => {
    const req = createMockReq({ cookies: { token: 'invalidtoken' } });
    const res = createMockRes();
    const next = createMockNext();

    await auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects expired token', async () => {
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '0s' });
    const req = createMockReq({ cookies: { token } });
    const res = createMockRes();
    const next = createMockNext();

    await auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Token expired' })
    );
  });

  it('rejects token for non-existent user', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const token = jwt.sign({ id: fakeId }, JWT_SECRET, { expiresIn: '1d' });
    const req = createMockReq({ cookies: { token } });
    const res = createMockRes();
    const next = createMockNext();

    await auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
