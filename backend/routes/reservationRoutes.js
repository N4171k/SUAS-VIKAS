const express = require('express');
const { Reservation, Product, Store } = require('../models');
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
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation || reservation.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Reservation not found.' });
    }

    if (reservation.status !== 'pending') {
      return res.status(400).json({ error: `Cannot pay for reservation with status: ${reservation.status}` });
    }

    const updated = await Reservation.update(req.params.id, { status: 'confirmed' });

    res.json({ message: 'Payment confirmed.', reservation: updated });
  } catch (error) {
    next(error);
  }
});

// GET /api/reservations/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation || reservation.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Reservation not found.' });
    }

    const [product, store] = await Promise.all([
      Product.findById(reservation.product_id),
      Store.findById(reservation.store_id),
    ]);

    res.json({ ...reservation, product, store });
  } catch (error) {
    next(error);
  }
});

// GET /api/reservations - List user reservations
router.get('/', authenticate, async (req, res, next) => {
  try {
    const reservations = await Reservation.findByUser(req.user.id);

    const withDetails = await Promise.all(reservations.map(async (r) => {
      const [product, store] = await Promise.all([
        Product.findById(r.product_id),
        Store.findById(r.store_id),
      ]);
      return { ...r, product, store };
    }));

    res.json(withDetails);
  } catch (error) {
    next(error);
  }
});

module.exports = router;