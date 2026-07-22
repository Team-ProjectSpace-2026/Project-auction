import crypto from 'crypto';
import Tournament from '../models/Tournament.js';
import { getRazorpayInstance } from '../config/razorpay.js';

// Calculate convenience fee (Option 2: 2.5% passed to player)
const CONVENIENCE_FEE_PERCENT = 0.025;

/**
 * @desc    Create Razorpay Order for tournament registration
 * @route   POST /api/payment/create-order
 * @access  Public
 */
export const createOrder = async (req, res) => {
  try {
    const { tournamentId } = req.body;

    if (!tournamentId) {
      return res.status(400).json({ success: false, message: 'Tournament ID is required' });
    }

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    // If tournament is free, no order needed
    if (!tournament.isPaid || !tournament.registrationFee || tournament.registrationFee <= 0) {
      return res.status(200).json({
        success: true,
        isPaid: false,
        amount: 0,
        message: 'This tournament is free. No payment required.'
      });
    }

    const entryFee = Number(tournament.registrationFee);
    const convenienceFee = Math.round(entryFee * CONVENIENCE_FEE_PERCENT * 100) / 100;
    const totalAmount = entryFee + convenienceFee;

    // Amount in paise (1 INR = 100 Paise)
    const amountInPaise = Math.round(totalAmount * 100);

    const razorpay = getRazorpayInstance();

    const options = {
      amount: amountInPaise,
      currency: tournament.currency || 'INR',
      receipt: `treg_${tournamentId.toString().slice(-6)}_${Date.now().toString().slice(-6)}`,
      notes: {
        tournamentId: tournament._id.toString(),
        tournamentName: tournament.name,
        entryFee,
        convenienceFee
      }
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      isPaid: true,
      orderId: order.id,
      amount: totalAmount,
      amountPaise: order.amount,
      currency: order.currency,
      entryFee,
      convenienceFee,
      keyId: process.env.RAZORPAY_KEY_ID || '',
      tournamentName: tournament.name
    });

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message
    });
  }
};

/**
 * @desc    Verify Razorpay payment signature
 * @route   POST /api/payment/verify-payment
 * @access  Public
 */
export const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification parameters'
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(500).json({
        success: false,
        message: 'Server payment configuration missing (RAZORPAY_KEY_SECRET)'
      });
    }

    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body.toString())
      .digest('hex');

    const isValid = expectedSignature === razorpaySignature;

    if (isValid) {
      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature verification failed'
      });
    }

  } catch (error) {
    console.error('Error verifying payment signature:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
};
