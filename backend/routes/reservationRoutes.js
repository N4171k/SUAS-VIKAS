const express = require('express');
const { Reservation, Product, Store, Inventory } = require('../models');
const { authenticate } = require('../middleware/auth');
const reservationService = require('../services/reservationService');

const router = express.Router();

// POST /api/reservations/create
router.post('/create', authenticate, async (req, res, next) => {
  try {
    const { productId, storeId, slot, quantity = 1 } = req.body;

    if (!productId || !storeId || !slot) {
      return res.status(400).json({ error: 'productId, storeId, and slot are required.' });
    }

    const result = await reservationService.createReservation({
      userId: req.user.id,
      productId,
      storeId,
      slot,
      quantity,
    });

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`store-${storeId}`).emit('inventory-update', {
        productId,
        storeId,
        type: 'reservation',
      });
    }

    res.status(201).json(result);
  } catch (error) {
    if (error.message.includes('Not enough stock') || error.message.includes('not found')) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

// POST /api/reservations/:id/pay
router.post('/:id/pay', authenticate, async (req, res, next) => {
  try {
    const reservation = await Reservation.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found.' });
    }

    if (reservation.status !== 'pending') {
      return res.status(400).json({ error: `Cannot pay for reservation with status: ${reservation.status}` });
    }

    reservation.status = 'confirmed';
    await reservation.save();

    res.json({ message: 'Payment confirmed.', reservation });
  } catch (error) {
    next(error);
  }
});

// GET /api/reservations/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const reservation = await Reservation.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: [
        { model: Product, as: 'product' },
        { model: Store, as: 'store' },
      ],
    });

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found.' });
    }

    res.json(reservation);
  } catch (error) {
    next(error);
  }
});

// GET /api/reservations - List user reservations
router.get('/', authenticate, async (req, res, next) => {
  try {
    const reservations = await Reservation.findAll({
      where: { user_id: req.user.id },
      include: [
        { model: Product, as: 'product' },
        { model: Store, as: 'store' },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json(reservations);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
