import { validationResult } from 'express-validator';
import logger from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(err.message, {
    stack: err.stack,
    method: req.method,
    url: req.url,
    userId: req.user?.id,
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => ({
      path: error.path,
      msg: error.message
    }));
    const message = errors.map(e => e.msg).join('. ') || 'Validation Error';
    return res.status(400).json({
      message,
      errors
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      message: `${field} already exists`
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired' });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = statusCode < 500 ? err.message : 'Internal Server Error';
  
  res.status(statusCode).json({
    message: message || 'Internal Server Error'
  });
};

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsgs = errors.array().map(err => err.msg);
    return res.status(400).json({
      message: errorMsgs.join('. ') || 'Validation Error',
      errors: errors.array().map(err => ({
        path: err.path,
        msg: err.msg
      }))
    });
  }
  next();
};