import express from 'express';
import {
  getPlayers,
  createPlayer,
  getPlayer,
  updatePlayer,
  deletePlayer,
  registerPlayer,
  getPublicTournament
} from '../controllers/player.controller.js';
import {
  validatePlayer,
  validatePublicRegistration
} from '../utils/validators.js';
import { handleValidationErrors } from '../middleware/errorHandler.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import { sanitizeIdParams, sanitizeQueryIds } from '../middleware/sanitize.js';
import auth from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Rate limiting applied first
router.use(apiLimiter);

// Public routes - no auth required (must be before auth middleware)
router.get('/public/:tournamentId', sanitizeIdParams(['tournamentId']), getPublicTournament);
router.post('/register/:tournamentId', upload.single('photo'), validatePublicRegistration, handleValidationErrors, registerPlayer);

// All routes below require authentication
router.use(auth);

router.get('/', sanitizeQueryIds(['tournamentId']), getPlayers);
router.post('/', validatePlayer, handleValidationErrors, createPlayer);
router.get('/:id', sanitizeIdParams(['id']), getPlayer);
router.put('/:id', sanitizeIdParams(['id']), validatePlayer, handleValidationErrors, updatePlayer);
router.delete('/:id', sanitizeIdParams(['id']), deletePlayer);

export default router;