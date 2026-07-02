import express from 'express';
import {
  getTournaments,
  createTournament,
  getTournament,
  updateTournament,
  deleteTournament
} from '../controllers/tournament.controller.js';
import {
  validateTournament
} from '../utils/validators.js';
import { handleValidationErrors } from '../middleware/errorHandler.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import { sanitizeIdParams } from '../middleware/sanitize.js';
import auth from '../middleware/auth.middleware.js';

const router = express.Router();

// Rate limiting applied first
router.use(apiLimiter);

// All routes require authentication
router.use(auth);

router.get('/', getTournaments);
router.post('/', validateTournament, handleValidationErrors, createTournament);
router.get('/:id', sanitizeIdParams(['id']), getTournament);
router.put('/:id', sanitizeIdParams(['id']), validateTournament, handleValidationErrors, updateTournament);
router.delete('/:id', sanitizeIdParams(['id']), deleteTournament);

export default router;