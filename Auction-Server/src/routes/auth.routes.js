import express from 'express';
import { register, login, getProfile } from '../controllers/auth.controller.js';
import { validateRegister, validateLogin } from '../utils/validators.js';
import { handleValidationErrors } from '../middleware/errorHandler.js';
import auth from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegister, handleValidationErrors, register);
router.post('/login', validateLogin, handleValidationErrors, login);

// Protected routes
router.get('/profile', auth, getProfile);

export default router;