import express from 'express';
import {
  getPlayers,
  createPlayer,
  getPlayer,
  updatePlayer,
  deletePlayer
} from '../controllers/player.controller.js';
import {
  validatePlayer
} from '../utils/validators.js';
import { handleValidationErrors } from '../middleware/errorHandler.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import auth from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

router.get('/', apiLimiter, getPlayers);
router.post('/', apiLimiter, validatePlayer, handleValidationErrors, createPlayer);
router.get('/:id', apiLimiter, getPlayer);
router.put('/:id', apiLimiter, validatePlayer, handleValidationErrors, updatePlayer);
router.delete('/:id', apiLimiter, deletePlayer);

export default router;