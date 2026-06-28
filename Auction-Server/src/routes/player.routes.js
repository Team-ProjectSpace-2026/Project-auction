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
router.use(apiLimiter);

router.get('/', getPlayers);
router.post('/', validatePlayer, handleValidationErrors, createPlayer);
router.get('/:id', getPlayer);
router.put('/:id', validatePlayer, handleValidationErrors, updatePlayer);
router.delete('/:id', deletePlayer);

export default router;