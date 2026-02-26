const express = require('express');
const { Op } = require('sequelize');
const { Product, Inventory, Store } = require('../models');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/products - List products with filtering, search, pagination
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      sub_category,
      product_type,
      gender,
      colour,
      usage: usageFilter,
      brand,
      minPrice,
      maxPrice,
      search,
      sort = 'created_at',
      order = 'DESC',
      rating,
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = { is_active: true };

    if (category) where.category = { [Op.like]: `%${category}%` };
    if (sub_category) where.sub_category = { [Op.like]: `%${sub_category}%` };
    if (product_type) where.product_type = { [Op.like]: `%${product_type}%` };
    if (gender) where.gender = { [Op.like]: `%${gender}%` };
    if (colour) where.colour = { [Op.like]: `%${colour}%` };
    if (usageFilter) where.usage = { [Op.like]: `%${usageFilter}%` };
    if (brand) where.brand = { [Op.like]: `%${brand}%` };
    if (minPrice) where.price = { ...where.price, [Op.gte]: parseFloat(minPrice) };
    if (maxPrice) where.price = { ...where.price, [Op.lte]: parseFloat(maxPrice) };
    if (rating) where.rating = { [Op.gte]: parseFloat(rating) };
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { brand: { [Op.like]: `%${search}%` } },
        { category: { [Op.like]: `%${search}%` } },
        { sub_category: { [Op.like]: `%${search}%` } },
        { product_type: { [Op.like]: `%${search}%` } },
        { colour: { [Op.like]: `%${search}%` } },
        { gender: { [Op.like]: `%${search}%` } },
      ];
    }

    const validSortFields = ['price', 'rating', 'created_at', 'title', 'rating_count'];
    const sortField = validSortFields.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const { rows: products, count: total } = await Product.findAndCountAll({
      where,
      offset,
      limit: parseInt(limit),
      order: [[sortField, sortOrder]],
    });

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/products/meta/categories
router.get('/meta/categories', async (req, res, next) => {
  try {
    const categories = await Product.findAll({
      attributes: ['category'],
      where: { is_active: true, category: { [Op.ne]: null } },
      group: ['category'],
      order: [['category', 'ASC']],
    });
    res.json(categories.map((c) => c.category).filter(Boolean));
  } catch (error) {
    next(error);
  }
});

// GET /api/products/meta/brands
router.get('/meta/brands', async (req, res, next) => {
  try {
    const brands = await Product.findAll({
      attributes: ['brand'],
      where: { is_active: true, brand: { [Op.ne]: null } },
      group: ['brand'],
      order: [['brand', 'ASC']],
    });
    res.json(brands.map((b) => b.brand).filter(Boolean));
  } catch (error) {
    next(error);
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{
        model: Inventory,
        as: 'inventory',
        include: [{ model: Store, as: 'store' }],
      }],
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
});

// GET /api/products/:id/stores - Get stores that have this product
router.get('/:id/stores', async (req, res, next) => {
  try {
    const inventories = await Inventory.findAll({
      where: { product_id: req.params.id, quantity: { [Op.gt]: 0 } },
      include: [{ model: Store, as: 'store' }],
    });

    const stores = inventories.map((inv) => ({
      store: inv.store,
      quantity: inv.quantity,
      reserved: inv.reserved_quantity,
      available: inv.quantity - inv.reserved_quantity,
    }));

    res.json(stores);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
