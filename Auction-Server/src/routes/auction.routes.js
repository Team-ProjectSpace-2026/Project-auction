import express from 'express';
import {
  getAuctionState,
  placeBid,
  getBidHistory
} from '../controllers/auction.controller.js';
import {
  validateBid
} from '../utils/validators.js';
import { handleValidationErrors } from '../middleware/errorHandler.js';
import { apiLimiter, bidLimiter } from '../middleware/rateLimiter.js';
import { sanitizeIdParams, sanitizeQueryIds } from '../middleware/sanitize.js';
import auth from '../middleware/auth.middleware.js';

const router = express.Router();

// Rate limiting applied first
router.use(apiLimiter);

// All routes require authentication
router.use(auth);

router.get('/:tournamentId', sanitizeIdParams(['tournamentId']), getAuctionState);
router.post('/:tournamentId/bid', bidLimiter, sanitizeIdParams(['tournamentId']), validateBid, handleValidationErrors, placeBid);
router.get('/:tournamentId/bids/:playerId?', sanitizeIdParams(['tournamentId', 'playerId']), getBidHistory);

export default router;