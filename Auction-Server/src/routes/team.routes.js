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
import auth from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

router.get('/', apiLimiter, getTeams);
router.get('/:id', apiLimiter, getTeam);
router.post('/', apiLimiter, validateTeam, handleValidationErrors, createTeam);
router.put('/:id', apiLimiter, validateTeam, handleValidationErrors, updateTeam);
router.delete('/:id', apiLimiter, deleteTeam);

export default router;