import mongoose from 'mongoose';
import Tournament from '../models/Tournament.js';
import { getCashfreeConfig, createCashfreeOrder } from '../config/cashfree.js';

/**
 * @desc    Initiate Cashfree Payment Session for tournament hosting fee or player registration fee
 * @route   POST /api/payment/initiate-payment
 * @access  Private / Public
 */
export const initiatePayment = async (req, res) => {
  try {
    const { tournamentId, numTeams, amount, type = 'tournament_hosting', firstname, email, phone } = req.body;

    const { env } = getCashfreeConfig();

    let cleanAmount = 0;
    let orderId = `cf_${type.slice(0, 4)}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    if (type === 'tournament_hosting') {
      if (numTeams && Number(numTeams) > 0) {
        const teams = Number(numTeams);
        if (teams <= 3) cleanAmount = 0;
        else if (teams <= 4) cleanAmount = 20; // Temporary 20 Rs live test plan
        else if (teams <= 6) cleanAmount = 349;
        else if (teams <= 8) cleanAmount = 449;
        else if (teams <= 12) cleanAmount = 599;
        else if (teams <= 16) cleanAmount = 749;
        else cleanAmount = 899;
      } else if (amount && Number(amount) > 0) {
        cleanAmount = Number(amount);
      }
    } else if (type === 'player_registration') {
      if (!tournamentId || !mongoose.Types.ObjectId.isValid(tournamentId)) {
        return res.status(400).json({ success: false, message: 'Invalid or missing Tournament ID' });
      }
      const tournament = await Tournament.findById(tournamentId);
      if (!tournament) {
        return res.status(404).json({ success: false, message: 'Tournament not found' });
      }
      cleanAmount = Number(tournament.registrationFee || 0);
    }

    if (cleanAmount <= 0) {
      return res.status(200).json({
        success: true,
        isFree: true,
        amount: 0,
        message: 'No payment required for this tier.'
      });
    }

    const userFirstName = (firstname || req.user?.name || 'Customer').trim();
    const userEmail = (email || req.user?.email || 'customer@example.com').trim();
    const userPhone = (phone || req.user?.mobile || '9999999999').trim();

    // Call Cashfree API to create Order & obtain payment_session_id
    const cashfreeOrder = await createCashfreeOrder({
      orderId,
      orderAmount: cleanAmount,
      customerId: req.user?._id?.toString() || 'user_' + Date.now(),
      customerName: userFirstName,
      customerEmail: userEmail,
      customerPhone: userPhone,
      returnUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment-success?order_id=${orderId}`
    });

    return res.status(200).json({
      success: true,
      isFree: false,
      orderId: cashfreeOrder.order_id,
      paymentSessionId: cashfreeOrder.payment_session_id,
      amount: cleanAmount,
      env,
      message: 'Cashfree payment session created successfully'
    });

  } catch (error) {
    console.error('Error initiating Cashfree payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to initiate Cashfree payment',
      error: error.message
    });
  }
};

/**
 * @desc    Verify Cashfree Payment Status
 * @route   POST /api/payment/verify-payment
 * @access  Private / Public
 */
export const verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId || typeof orderId !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid or missing orderId parameter' });
    }

    const sanitizedOrderId = String(orderId).trim();
    if (!/^[a-zA-Z0-9_-]{3,100}$/.test(sanitizedOrderId)) {
      return res.status(400).json({ success: false, message: 'Malformed orderId parameter' });
    }

    const { appId, secretKey, baseUrl } = getCashfreeConfig();

    const safeEndpoint = new URL(`/pg/orders/${encodeURIComponent(sanitizedOrderId)}`, baseUrl).toString();

    const response = await fetch(safeEndpoint, {
      method: 'GET',
      headers: {
        'x-api-version': '2023-08-01',
        'x-client-id': appId,
        'x-client-secret': secretKey
      }
    });

    const data = await response.json();

    if (response.ok && data.order_status === 'PAID') {
      return res.status(200).json({
        success: true,
        orderId: data.order_id,
        amount: data.order_amount,
        status: data.order_status,
        message: 'Cashfree payment verified successfully'
      });
    } else {
      return res.status(400).json({
        success: false,
        status: data.order_status || 'UNPAID',
        message: 'Payment verification failed or payment is pending'
      });
    }

  } catch (error) {
    console.error('Error verifying Cashfree payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify Cashfree payment',
      error: error.message
    });
  }
};
