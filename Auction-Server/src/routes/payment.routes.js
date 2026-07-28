import express from 'express';
import { createOrder, verifyPayment } from '../controllers/payment.controller.js';
import auth from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/create-order', auth, createOrder);
router.post('/verify-payment', auth, verifyPayment);

export default router;
