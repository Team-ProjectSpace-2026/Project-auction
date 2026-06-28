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
import auth from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

router.get('/:tournamentId', getAuctionState);
router.post('/:tournamentId/bid', validateBid, handleValidationErrors, placeBid);
router.get('/:tournamentId/bids/:playerId?', getBidHistory);

export default router;