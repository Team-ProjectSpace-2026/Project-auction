import { errorHandler, handleValidationErrors } from '../../src/middleware/errorHandler.js';

const createMockReq = (overrides = {}) => ({
  method: 'GET',
  url: '/test',
  user: { id: 'user123' },
  ...overrides,
});

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const createMockNext = () => jest.fn();

describe('Error Handler Middleware', () => {
  describe('errorHandler', () => {
    it('handles Mongoose ValidationError', () => {
      const err = new Error('Validation failed');
      err.name = 'ValidationError';
      err.errors = {
        name: { path: 'name', message: 'Name is required' },
        email: { path: 'email', message: 'Invalid email' },
      };

      const req = createMockReq();
      const res = createMockRes();
      const next = createMockNext();

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Validation Error',
          errors: expect.arrayContaining([
            expect.objectContaining({ path: 'name', msg: 'Name is required' }),
          ]),
        })
      );
    });

    it('handles duplicate key error (code 11000)', () => {
      const err = new Error('duplicate key');
      err.code = 11000;
      err.keyPattern = { email: 1 };

      const req = createMockReq();
      const res = createMockRes();
      const next = createMockNext();

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'email already exists' })
      );
    });

    it('handles JsonWebTokenError', () => {
      const err = new Error('jwt malformed');
      err.name = 'JsonWebTokenError';

      const req = createMockReq();
      const res = createMockRes();
      const next = createMockNext();

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Invalid token' })
      );
    });

    it('handles TokenExpiredError', () => {
      const err = new Error('jwt expired');
      err.name = 'TokenExpiredError';

      const req = createMockReq();
      const res = createMockRes();
      const next = createMockNext();

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Token expired' })
      );
    });

    it('handles generic error with status code', () => {
      const err = new Error('Not found');
      err.statusCode = 404;

      const req = createMockReq();
      const res = createMockRes();
      const next = createMockNext();

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Not found' })
      );
    });

    it('returns 500 for unknown errors', () => {
      const err = new Error('Something broke');

      const req = createMockReq();
      const res = createMockRes();
      const next = createMockNext();

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Internal Server Error' })
      );
    });
  });

  describe('handleValidationErrors', () => {
    it('calls next when no validation errors', () => {
      const req = { expressValidator: undefined };
      const res = createMockRes();
      const next = createMockNext();

      // Mock express-validator validationResult
      jest.mock('express-validator', () => ({
        validationResult: jest.fn().mockReturnValue({
          isEmpty: () => true,
          array: () => [],
        }),
      }));

      const { handleValidationErrors: hve } = require('../../src/middleware/errorHandler.js');
      hve(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
