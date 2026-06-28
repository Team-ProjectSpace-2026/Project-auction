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
import auth from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

router.get('/', apiLimiter, getTournaments);
router.post('/', apiLimiter, validateTournament, handleValidationErrors, createTournament);
router.get('/:id', apiLimiter, getTournament);
router.put('/:id', apiLimiter, validateTournament, handleValidationErrors, updateTournament);
router.delete('/:id', apiLimiter, deleteTournament);

export default router;