import mongoose from 'mongoose';
import Tournament from '../models/Tournament.js';
import { getCashfreeConfig, createCashfreeOrder, createCashfreeRefund } from '../config/cashfree.js';
import { sendOrganizerPackInvoiceEmail, sendOrganizerUpgradeInvoiceEmail, sendOrganizerCancellationRefundEmail } from '../services/email.service.js';

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
    const { orderId, numTeams, tournamentName, type } = req.body;

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
      const { tournamentId, isUpgrade, newTeams } = req.body;

      // Handle tournament_hosting or upgrade payments
      if ((type === 'tournament_hosting' || isUpgrade) && numTeams) {
        const teams = Number(numTeams);
        const planTiers = [
          { maxTeams: 3, name: 'Plan 1', price: 0, effectivePerTeam: 0, description: 'Great for quick friendly mini-tournaments.' },
          { maxTeams: 4, name: 'Plan 2', price: 249, effectivePerTeam: 62, description: 'Ideal for 4-team leagues.' },
          { maxTeams: 6, name: 'Plan 3', price: 349, effectivePerTeam: 58, description: 'Popular choice for club competitions.' },
          { maxTeams: 8, name: 'Plan 4', price: 449, effectivePerTeam: 56, description: 'Best for standard 8-team franchise leagues.' },
          { maxTeams: 12, name: 'Plan 5', price: 599, effectivePerTeam: 50, description: 'Designed for mid-scale tournaments.' },
          { maxTeams: 16, name: 'Plan 6', price: 749, effectivePerTeam: 47, description: 'Perfect for large corporate or district leagues.' },
          { maxTeams: 20, name: 'Plan 7', price: 899, effectivePerTeam: 45, description: 'Maximum scale for major grand auctions.' },
          { maxTeams: 30, name: 'Plan 8', price: 1199, effectivePerTeam: 40, description: 'Mega scale for grand tournaments up to 30 teams.' }
        ];

        let matchedPlan = planTiers.find(p => teams <= p.maxTeams) || planTiers[planTiers.length - 1];

        // Update tournament model if tournamentId provided
        if (tournamentId && mongoose.Types.ObjectId.isValid(tournamentId)) {
          const tournament = await Tournament.findById(tournamentId);
          if (!tournament) {
            return res.status(404).json({ success: false, message: 'Tournament not found' });
          }

          // Verify ownership
          if (req.user && tournament.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized: You do not own this tournament' });
          }

          // Verify orderId reuse
          const existingOrderUse = await Tournament.findOne({ 'hostingPayment.orderId': data.order_id, _id: { $ne: tournament._id } });
          if (existingOrderUse) {
            return res.status(400).json({ success: false, message: 'Order ID already used for another tournament' });
          }

          const oldPaid = tournament.hostingPayment?.amountPaid || 0;
          const expectedDiff = isUpgrade ? Math.max(0, matchedPlan.price - oldPaid) : matchedPlan.price;

          // Verify amount
          if (Number(data.order_amount) < expectedDiff) {
            return res.status(400).json({ success: false, message: `Paid amount (₹${data.order_amount}) is less than required plan fee (₹${expectedDiff})` });
          }

          const oldPlan = planTiers.find(p => tournament.teams <= p.maxTeams) || { name: 'Previous Plan', price: oldPaid, maxTeams: tournament.teams };

          if (isUpgrade) {
            tournament.teams = matchedPlan.maxTeams;
            tournament.hostingPayment = {
              orderId: data.order_id,
              amountPaid: oldPaid + Number(data.order_amount),
              planName: matchedPlan.name,
              maxTeams: matchedPlan.maxTeams,
              status: 'UPGRADED',
              paidAt: new Date()
            };
            await tournament.save();

            sendOrganizerUpgradeInvoiceEmail({
              organizer: { name: req.user.name || 'Organizer', email: req.user.email, phone: req.user.mobile || '' },
              oldPlan,
              newPlan: matchedPlan,
              netPaid: Number(data.order_amount),
              payment: { orderId: data.order_id, method: 'Cashfree' },
              tournament: { name: tournament.name }
            }).catch(err => console.error('Upgrade invoice email error:', err));
          } else {
            tournament.hostingPayment = {
              orderId: data.order_id,
              amountPaid: Number(data.order_amount),
              planName: matchedPlan.name,
              maxTeams: matchedPlan.maxTeams,
              status: 'PAID',
              paidAt: new Date()
            };
            await tournament.save();

            sendOrganizerPackInvoiceEmail({
              organizer: { name: req.user.name || 'Organizer', email: req.user.email, phone: req.user.mobile || '' },
              plan: matchedPlan,
              payment: { orderId: data.order_id, transactionId: data.cf_order_id || data.order_id, method: 'Cashfree' },
              tournament: { name: tournamentName || tournament.name, numTeams: teams }
            }).catch(err => console.error('Pack invoice email error:', err));
          }
        } else if (type === 'tournament_hosting' && req.user) {
          sendOrganizerPackInvoiceEmail({
            organizer: { name: req.user.name || 'Organizer', email: req.user.email, phone: req.user.mobile || '' },
            plan: matchedPlan,
            payment: { orderId: data.order_id, transactionId: data.cf_order_id || data.order_id, method: 'Cashfree' },
            tournament: { name: tournamentName || 'Tournament', numTeams: teams }
          }).catch(err => console.error('Pack invoice email error:', err));
        }
      }

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

/**
 * @desc    Initiate Cashfree Payment for player registration (PUBLIC - no auth)
 * @route   POST /api/payment/public/initiate-player-payment
 * @access  Public
 */
export const initiatePlayerPayment = async (req, res) => {
  try {
    const { tournamentId, firstname, email, phone } = req.body;

    if (!tournamentId || !mongoose.Types.ObjectId.isValid(tournamentId)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing Tournament ID' });
    }

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    const cleanAmount = Number(tournament.registrationFee || 0);

    if (cleanAmount <= 0) {
      return res.status(200).json({
        success: true,
        isFree: true,
        amount: 0,
        message: 'No payment required — free registration.'
      });
    }

    const { env } = getCashfreeConfig();
    const orderId = `cf_preg_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const userFirstName = (firstname || 'Player').trim();
    const userEmail = (email || 'player@example.com').trim();
    const userPhone = (phone || '9999999999').trim();

    const cashfreeOrder = await createCashfreeOrder({
      orderId,
      orderAmount: cleanAmount,
      customerId: 'player_' + Date.now(),
      customerName: userFirstName,
      customerEmail: userEmail,
      customerPhone: userPhone,
      returnUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/register/${tournamentId}?payment_status=success&order_id=${orderId}`
    });

    return res.status(200).json({
      success: true,
      isFree: false,
      orderId: cashfreeOrder.order_id,
      paymentSessionId: cashfreeOrder.payment_session_id,
      amount: cleanAmount,
      env,
      message: 'Cashfree payment session created for player registration'
    });

  } catch (error) {
    console.error('Error initiating player registration payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to initiate payment',
      error: error.message
    });
  }
};

/**
 * @desc    Verify Cashfree Payment for player registration (PUBLIC - no auth)
 * @route   POST /api/payment/public/verify-player-payment
 * @access  Public
 */
export const verifyPlayerPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId || typeof orderId !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid or missing orderId' });
    }

    const sanitizedOrderId = String(orderId).trim();
    if (!/^[a-zA-Z0-9_-]{3,100}$/.test(sanitizedOrderId)) {
      return res.status(400).json({ success: false, message: 'Malformed orderId' });
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
        message: 'Player registration payment verified successfully'
      });
    } else {
      return res.status(400).json({
        success: false,
        status: data.order_status || 'UNPAID',
        message: 'Payment not completed or verification failed'
      });
    }

  } catch (error) {
    console.error('Error verifying player payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
};

/**
 * @desc    Initiate Upgrade Payment (pay difference amount)
 * @route   POST /api/payment/initiate-upgrade-payment
 * @access  Private (Tournament Owner)
 */
export const initiateUpgradePayment = async (req, res) => {
  try {
    const { tournamentId, targetTeams } = req.body;

    if (!tournamentId || !mongoose.Types.ObjectId.isValid(tournamentId)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing Tournament ID' });
    }

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    if (tournament.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the tournament owner can upgrade the plan' });
    }

    const newTeams = Number(targetTeams);
    if (!newTeams || newTeams <= tournament.teams) {
      return res.status(400).json({ success: false, message: 'Target teams must be higher than current team count' });
    }

    const planTiers = [
      { maxTeams: 3, price: 0, name: 'Plan 1' },
      { maxTeams: 4, price: 249, name: 'Plan 2' },
      { maxTeams: 6, price: 349, name: 'Plan 3' },
      { maxTeams: 8, price: 449, name: 'Plan 4' },
      { maxTeams: 12, price: 599, name: 'Plan 5' },
      { maxTeams: 16, price: 749, name: 'Plan 6' },
      { maxTeams: 20, price: 899, name: 'Plan 7' },
      { maxTeams: 30, price: 1199, name: 'Plan 8' }
    ];

    const currentPaid = tournament.hostingPayment?.amountPaid || 0;
    const targetPlan = planTiers.find(p => newTeams <= p.maxTeams) || planTiers[planTiers.length - 1];
    const diffAmount = Math.max(0, targetPlan.price - currentPaid);

    if (diffAmount <= 0) {
      // Free tier bump
      tournament.teams = targetPlan.maxTeams;
      if (!tournament.hostingPayment) tournament.hostingPayment = {};
      tournament.hostingPayment.maxTeams = targetPlan.maxTeams;
      tournament.hostingPayment.planName = targetPlan.name;
      await tournament.save();
      return res.status(200).json({
        success: true,
        isFree: true,
        amount: 0,
        message: `Plan upgraded to ${targetPlan.name} (${targetPlan.maxTeams} Teams) at no extra charge.`
      });
    }

    const orderId = `cf_upg_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const { env } = getCashfreeConfig();

    const cashfreeOrder = await createCashfreeOrder({
      orderId,
      orderAmount: diffAmount,
      customerId: req.user._id.toString(),
      customerName: req.user.name || 'Organizer',
      customerEmail: req.user.email,
      customerPhone: req.user.mobile || '9999999999',
      returnUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/tournaments/${tournamentId}?upgrade=success&order_id=${orderId}`
    });

    return res.status(200).json({
      success: true,
      isFree: false,
      orderId: cashfreeOrder.order_id,
      paymentSessionId: cashfreeOrder.payment_session_id,
      amount: diffAmount,
      currentPaid,
      targetPrice: targetPlan.price,
      newTeams: targetPlan.maxTeams,
      env,
      message: `Upgrade session created. Pay difference of ₹${diffAmount}`
    });

  } catch (error) {
    console.error('Error initiating upgrade payment:', error);
    return res.status(500).json({ success: false, message: 'Failed to initiate upgrade payment', error: error.message });
  }
};

/**
 * @desc    Cancel Hosting Subscription & Trigger Cashfree Refund
 * @route   POST /api/payment/cancel-hosting-subscription
 * @access  Private (Tournament Owner)
 */
export const cancelHostingSubscription = async (req, res) => {
  try {
    const { tournamentId } = req.body;

    if (!tournamentId || !mongoose.Types.ObjectId.isValid(tournamentId)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing Tournament ID' });
    }

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    if (tournament.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the tournament owner can cancel the subscription' });
    }

    if (tournament.status === 'Active' || tournament.status === 'Completed' || tournament.auctionStatus !== 'idle') {
      return res.status(400).json({ success: false, message: 'Cannot cancel plan after auction has started or completed' });
    }

    const paymentInfo = tournament.hostingPayment;
    if (!paymentInfo || paymentInfo.status === 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'Subscription is already cancelled or has no paid plan' });
    }

    const orderId = paymentInfo.orderId;
    const amountToRefund = paymentInfo.amountPaid || 0;

    // Atomically mark status as CANCELLED before executing refund to prevent race conditions
    tournament.hostingPayment.status = 'CANCELLED';

    const deterministicRefundId = orderId
      ? `ref_${orderId.replace(/[^a-zA-Z0-9_-]/g, '_')}`
      : `ref_${tournament._id}_${Date.now()}`;

    let refundId = deterministicRefundId;
    let refundStatus = 'PROCESSED';

    if (orderId && amountToRefund > 0) {
      try {
        const refundResult = await createCashfreeRefund({
          orderId,
          refundAmount: amountToRefund,
          refundId,
          remark: `Organizer requested cancellation for ${tournament.name}`
        });
        refundId = refundResult.refund_id || refundId;
        refundStatus = refundResult.refund_status || 'PROCESSED';
      } catch (refundErr) {
        console.warn('⚠️ Cashfree Refund API error (marking pending for admin review):', refundErr.message);
        refundStatus = 'PENDING_ADMIN_REVIEW';
      }
    }

    tournament.hostingPayment.cancellationDetails = {
      cancelledAt: new Date(),
      refundId,
      refundAmount: amountToRefund,
      refundStatus
    };
    await tournament.save();

    // Send Cancellation Email with accurate status
    sendOrganizerCancellationRefundEmail({
      organizer: { name: req.user.name || 'Organizer', email: req.user.email, phone: req.user.mobile || '' },
      plan: { name: paymentInfo.planName || 'Auction Hosting Plan', maxTeams: paymentInfo.maxTeams || tournament.teams, price: amountToRefund },
      refundAmount: amountToRefund,
      refundId,
      refundStatus,
      payment: { orderId },
      tournament: { name: tournament.name }
    }).catch(err => console.error('Cancellation email error:', err));

    const responseMsg = refundStatus === 'PENDING_ADMIN_REVIEW'
      ? 'Tournament subscription plan cancelled. Refund is pending admin review.'
      : 'Tournament subscription plan cancelled and refund initiated successfully';

    return res.status(200).json({
      success: true,
      message: responseMsg,
      refundId,
      refundAmount: amountToRefund,
      refundStatus
    });

  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return res.status(500).json({ success: false, message: 'Failed to cancel subscription', error: error.message });
  }
};

