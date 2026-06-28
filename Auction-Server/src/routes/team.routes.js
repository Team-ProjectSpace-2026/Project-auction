import express from 'express';
import {
  getTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam
} from '../controllers/team.controller.js';
import {
  validateTeam
} from '../utils/validators.js';
import { handleValidationErrors } from '../middleware/errorHandler.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import { sanitizeIdParams, sanitizeQueryIds } from '../middleware/sanitize.js';
import auth from '../middleware/auth.middleware.js';

const router = express.Router();

// Rate limiting applied first
router.use(apiLimiter);

// All routes require authentication
router.use(auth);

router.get('/', sanitizeQueryIds(['tournamentId']), getTeams);
router.get('/:id', sanitizeIdParams(['id']), getTeam);
router.post('/', validateTeam, handleValidationErrors, createTeam);
router.put('/:id', sanitizeIdParams(['id']), validateTeam, handleValidationErrors, updateTeam);
router.delete('/:id', sanitizeIdParams(['id']), deleteTeam);

export default router;