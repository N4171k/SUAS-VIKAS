const express = require('express');
const { Op, Sequelize } = require('sequelize');
const { Product, Inventory, Store } = require('../models');
const { optionalAuth, authenticate } = require('../middleware/auth');

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

// ── Size adjacency helpers ──────────────────────────────────────────────────
const CLOTHING_SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const FOOTWEAR_SIZE_ORDER = ['5', '6', '7', '8', '9', '10', '11', '12', '13'];

function getAdjacentSizes(size, sizeOrder) {
  const upper = size ? size.toUpperCase().trim() : '';
  const idx = sizeOrder.indexOf(upper);
  if (idx === -1) return [upper]; // unknown size — exact match only
  const result = new Set();
  if (idx > 0) result.add(sizeOrder[idx - 1]);
  result.add(sizeOrder[idx]);
  if (idx < sizeOrder.length - 1) result.add(sizeOrder[idx + 1]);
  return Array.from(result);
}

// GET /api/products/suggestions  — requires auth
// Returns products matching user's size (±1), colour & style preferences
// that are actually available in inventory at the right size
router.get('/suggestions', authenticate, async (req, res, next) => {
  try {
    const user = req.user;
    const limit = Math.min(parseInt(req.query.limit) || 12, 40);

    const {
      clothing_size,
      footwear_size,
      favourite_colors = [],
      style_preferences = [],
      gender,
    } = user;

    // Build the allowed size sets
    const clothingSizes = clothing_size
      ? getAdjacentSizes(clothing_size, CLOTHING_SIZE_ORDER)
      : null;
    const footwearSizes = footwear_size
      ? getAdjacentSizes(footwear_size, FOOTWEAR_SIZE_ORDER)
      : null;

    if (!clothingSizes && !footwearSizes) {
      // No size preferences set — return top-rated as fallback
      const fallback = await Product.findAll({
        where: { is_active: true },
        order: [['rating', 'DESC'], ['rating_count', 'DESC']],
        limit,
      });
      return res.json({ products: fallback, personalized: false });
    }

    // Find product IDs that have available inventory in the allowed sizes
    const sizeConditions = [];
    if (clothingSizes) sizeConditions.push(...clothingSizes);
    if (footwearSizes) sizeConditions.push(...footwearSizes);

    const availableInventory = await Inventory.findAll({
      attributes: ['product_id'],
      where: {
        size: { [Op.in]: sizeConditions },
        [Op.and]: Sequelize.literal('"quantity" - "reserved_quantity" > 0'),
      },
      group: ['product_id'],
      raw: true,
    });

    const availableProductIds = availableInventory.map((inv) => inv.product_id);

    if (availableProductIds.length === 0) {
      return res.json({ products: [], personalized: true });
    }

    // Build product filter based on user preferences
    const productWhere = {
      is_active: true,
      id: { [Op.in]: availableProductIds },
    };

    const preferenceFilters = [];

    // Gender filter
    if (gender) {
      preferenceFilters.push({ gender: { [Op.like]: `%${gender}%` } });
    }

    // Colour preferences (OR match)
    if (Array.isArray(favourite_colors) && favourite_colors.length > 0) {
      favourite_colors.forEach((color) => {
        if (color) preferenceFilters.push({ colour: { [Op.like]: `%${color}%` } });
      });
    }

    // Style / usage preferences (OR match)
    if (Array.isArray(style_preferences) && style_preferences.length > 0) {
      style_preferences.forEach((style) => {
        if (style) {
          preferenceFilters.push({ usage: { [Op.like]: `%${style}%` } });
          preferenceFilters.push({ product_type: { [Op.like]: `%${style}%` } });
          preferenceFilters.push({ sub_category: { [Op.like]: `%${style}%` } });
        }
      });
    }

    if (preferenceFilters.length > 0) {
      productWhere[Op.or] = preferenceFilters;
    }

    const products = await Product.findAll({
      where: productWhere,
      order: [['rating', 'DESC'], ['rating_count', 'DESC']],
      limit,
    });

    // If strict preferences gave < 4 results, pad with general size-available products
    let finalProducts = products;
    if (products.length < 4) {
      const padded = await Product.findAll({
        where: {
          is_active: true,
          id: {
            [Op.in]: availableProductIds,
            [Op.notIn]: products.map((p) => p.id),
          },
        },
        order: [['rating', 'DESC'], ['rating_count', 'DESC']],
        limit: limit - products.length,
      });
      finalProducts = [...products, ...padded];
    }

    res.json({ products: finalProducts, personalized: true });
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
