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
import auth from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

router.get('/', getTournaments);
router.post('/', validateTournament, handleValidationErrors, createTournament);
router.get('/:id', getTournament);
router.put('/:id', validateTournament, handleValidationErrors, updateTournament);
router.delete('/:id', deleteTournament);

export default router;