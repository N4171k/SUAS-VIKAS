/**
 * Payment Gateway Simulation
 * Simulates Razorpay/Stripe-style payment flows with multiple payment methods.
 *
 * POST /api/payment/initiate   — Create a payment session
 * POST /api/payment/process    — Process the payment (simulate success/failure)
 * GET  /api/payment/:sessionId — Poll payment status
 */

const express = require('express');
const crypto = require('crypto');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// In-memory session store (production would use Redis / DB)
const sessions = new Map();

// ── Helpers ───────────────────────────────────────────────────────────────
function generateSessionId() {
  return 'pay_' + crypto.randomBytes(12).toString('hex');
}

function generateTransactionId() {
  return 'txn_' + crypto.randomBytes(8).toString('hex').toUpperCase();
}

// ── Simulate outcome deterministically if special test values are used ────
function simulateOutcome(method, payload) {
  if (method === 'card') {
    const num = (payload.cardNumber || '').replace(/\s/g, '');
    if (num.endsWith('0000')) return { success: false, reason: 'Card declined by issuer.' };
    if (num.endsWith('1111')) return { success: false, reason: 'Insufficient funds.' };
    if (num.endsWith('9999')) return { success: false, reason: 'Card expired.' };
    return { success: true };
  }
  if (method === 'upi') {
    const id = (payload.upiId || '').toLowerCase();
    if (id.startsWith('fail@')) return { success: false, reason: 'UPI transaction declined.' };
    if (id.startsWith('timeout@')) return { success: false, reason: 'UPI request timed out.' };
    return { success: true };
  }
  if (method === 'netbanking') {
    // 95% success for simulation
    return Math.random() > 0.05 ? { success: true } : { success: false, reason: 'Bank gateway timeout.' };
  }
  if (method === 'cash' || method === 'kiosk_cash') {
    return { success: true };
  }
  if (method === 'qr') {
    return { success: true };
  }
  return { success: true };
}

// ── POST /api/payment/initiate ────────────────────────────────────────────
router.post('/initiate', optionalAuth, (req, res) => {
  const { amount, currency = 'INR', orderId, description, method, source = 'web' } = req.body;

  if (!amount || isNaN(parseFloat(amount))) {
    return res.status(400).json({ error: 'Valid amount is required.' });
  }

  const sessionId = generateSessionId();
  const session = {
    sessionId,
    amount:      parseFloat(amount).toFixed(2),
    currency,
    orderId:     orderId || null,
    description: description || 'VIKAS Purchase',
    method:      method || null,
    source,
    status:      'initiated',
    userId:      req.user?.id || null,
    createdAt:   new Date().toISOString(),
    expiresAt:   new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15-min window
    transactionId: null,
    failureReason: null,
  };

  sessions.set(sessionId, session);

  res.json({
    sessionId,
    amount:      session.amount,
    currency,
    description: session.description,
    expiresAt:   session.expiresAt,
    methods:     ['card', 'upi', 'netbanking', 'cash', 'qr'],
    gateway:     'VIKAS Pay Simulator v1',
  });
});

// ── POST /api/payment/process ─────────────────────────────────────────────
router.post('/process', optionalAuth, async (req, res) => {
  const { sessionId, method, payload = {} } = req.body;

  if (!sessionId || !method) {
    return res.status(400).json({ error: 'sessionId and method are required.' });
  }

  const session = sessions.get(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Payment session not found or expired.' });
  }
  if (session.status === 'success') {
    return res.json({ status: 'success', transactionId: session.transactionId, message: 'Already processed.' });
  }
  if (session.status === 'failed') {
    return res.status(400).json({ status: 'failed', reason: session.failureReason });
  }
  if (new Date() > new Date(session.expiresAt)) {
    session.status = 'expired';
    return res.status(400).json({ status: 'expired', error: 'Payment session has expired.' });
  }

  session.status = 'processing';
  session.method = method;

  // Simulate processing delay (300–900 ms)
  await new Promise((r) => setTimeout(r, 300 + Math.floor(Math.random() * 600)));

  const outcome = simulateOutcome(method, payload);

  if (outcome.success) {
    session.status = 'success';
    session.transactionId = generateTransactionId();
    sessions.set(sessionId, session);
    return res.json({
      status:        'success',
      sessionId,
      transactionId: session.transactionId,
      amount:        session.amount,
      currency:      session.currency,
      method,
      description:   session.description,
      paidAt:        new Date().toISOString(),
      gateway:       'VIKAS Pay Simulator v1',
    });
  } else {
    session.status = 'failed';
    session.failureReason = outcome.reason;
    sessions.set(sessionId, session);
    return res.status(402).json({
      status:  'failed',
      reason:  outcome.reason,
      sessionId,
      method,
    });
  }
});

// ── GET /api/payment/:sessionId ───────────────────────────────────────────
router.get('/:sessionId', optionalAuth, (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Payment session not found.' });
  }
  res.json({
    sessionId:     session.sessionId,
    status:        session.status,
    amount:        session.amount,
    currency:      session.currency,
    method:        session.method,
    transactionId: session.transactionId,
    failureReason: session.failureReason,
    createdAt:     session.createdAt,
    expiresAt:     session.expiresAt,
  });
});

module.exports = router;
