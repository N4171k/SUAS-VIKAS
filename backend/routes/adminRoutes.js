const express = require('express');
const { Op, fn, col, literal } = require('sequelize');
const { Reservation, Order, Product, Store, User } = require('../models');
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
    const where = {};
    if (status) where.status = status;
    if (storeId) where.store_id = storeId;

    const { rows: reservations, count: total } = await Reservation.findAndCountAll({
      where,
      include: [
        { model: Product, as: 'product', attributes: ['id', 'title', 'price', 'image_url'] },
        { model: Store, as: 'store', attributes: ['id', 'name', 'location'] },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      ],
      order: [['created_at', 'DESC']],
      offset: (parseInt(page) - 1) * parseInt(limit),
      limit: parseInt(limit),
    });

    res.json({
      reservations,
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
    const stores = await Store.findAll({ order: [['name', 'ASC']] });
    res.json(stores);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
