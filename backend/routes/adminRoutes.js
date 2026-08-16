const express = require('express');
const { Reservation, Product, Store, User } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const analyticsService = require('../services/analyticsService');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('store_admin', 'super_admin'));

// GET /api/admin/analytics
router.get('/analytics', async (req, res, next) => {
  try {
    const analytics = await analyticsService.getDashboardAnalytics();
    res.json(analytics);
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/reservations
router.get('/reservations', async (req, res, next) => {
  try {
    const { status, storeId, page = 1, limit = 20 } = req.query;

    let reservations;
    if (storeId) {
      reservations = await Reservation.findByStore(storeId);
    } else {
      reservations = await Reservation.findAll();
    }

    if (status) reservations = reservations.filter((r) => r.status === status);
    reservations.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

    const total = reservations.length;
    const start = (parseInt(page) - 1) * parseInt(limit);
    const pageItems = reservations.slice(start, start + parseInt(limit));

    const withDetails = await Promise.all(pageItems.map(async (r) => {
      const [product, store, user] = await Promise.all([
        Product.findById(r.product_id),
        Store.findById(r.store_id),
        User.findById(r.user_id),
      ]);
      return {
        ...r,
        product: product ? { id: product.id, title: product.title, price: product.price, image_url: product.image_url } : null,
        store: store ? { id: store.id, name: store.name, location: store.location } : null,
        user: user ? { id: user.id, name: user.name, email: user.email } : null,
      };
    }));

    res.json({
      reservations: withDetails,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/sales
router.get('/sales', async (req, res, next) => {
  try {
    const { period = '7d' } = req.query;
    const salesData = await analyticsService.getSalesData(period);
    res.json(salesData);
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/stores
router.get('/stores', async (req, res, next) => {
  try {
    const stores = await Store.findAll();
    res.json(stores);
  } catch (error) {
    next(error);
  }
});

module.exports = router;