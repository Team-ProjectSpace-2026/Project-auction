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
import auth from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

router.get('/', getTeams);
router.get('/:id', getTeam);
router.post('/', validateTeam, handleValidationErrors, createTeam);
router.put('/:id', validateTeam, handleValidationErrors, updateTeam);
router.delete('/:id', deleteTeam);

export default router;