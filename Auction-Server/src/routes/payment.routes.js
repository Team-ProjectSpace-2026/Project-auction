import express from 'express';
import { initiatePayment, verifyPayment, initiatePlayerPayment, verifyPlayerPayment } from '../controllers/payment.controller.js';
import auth from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes (no auth) — for player registration payments
router.post('/public/initiate-player-payment', initiatePlayerPayment);
router.post('/public/verify-player-payment', verifyPlayerPayment);

// Authenticated payment endpoints (tournament hosting)
router.post('/initiate-payment', auth, initiatePayment);
router.post('/create-order', auth, initiatePayment); // Alias for backward compatibility
router.post('/verify-payment', auth, verifyPayment);

export default router;
