import express from 'express';
import { initiatePayment, verifyPayment } from '../controllers/payment.controller.js';
import auth from '../middleware/auth.middleware.js';

const router = express.Router();

// Easebuzz payment endpoints
router.post('/initiate-payment', auth, initiatePayment);
router.post('/create-order', auth, initiatePayment); // Alias for backward compatibility
router.post('/verify-payment', auth, verifyPayment);

export default router;
