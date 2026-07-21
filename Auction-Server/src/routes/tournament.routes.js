import express from 'express';
import {
  getTournaments,
  createTournament,
  getTournament,
  updateTournament,
  deleteTournament,
  updateRegistrationDeadline,
  getPublicRecentTournaments
} from '../controllers/tournament.controller.js';
import {
  validateTournament,
  validateRegistrationDeadline
} from '../utils/validators.js';
import { handleValidationErrors } from '../middleware/errorHandler.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import { sanitizeIdParams } from '../middleware/sanitize.js';
import auth from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Rate limiting applied first
router.use(apiLimiter);

// Public route — no auth required (must be before router.use(auth))
router.get('/public/recent', getPublicRecentTournaments);

// All remaining routes require authentication
router.use(auth);

router.get('/', getTournaments);
router.post('/', upload.single('logo'), validateTournament, handleValidationErrors, createTournament);
router.get('/:id', sanitizeIdParams(['id']), getTournament);
router.put('/:id/deadline', sanitizeIdParams(['id']), validateRegistrationDeadline, handleValidationErrors, updateRegistrationDeadline);
router.put('/:id', sanitizeIdParams(['id']), upload.single('logo'), validateTournament, handleValidationErrors, updateTournament);
router.delete('/:id', sanitizeIdParams(['id']), deleteTournament);

export default router;