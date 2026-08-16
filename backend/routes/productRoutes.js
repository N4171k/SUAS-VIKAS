const express = require('express');
const { Product, Inventory, Store, User } = require('../models');
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
      sort = 'updatedAt',
      order = 'DESC',
      rating,
    } = req.query;

    const validSortFields = ['price', 'rating', 'title', 'rating_count', 'updatedAt'];
    const sortField = validSortFields.includes(sort) ? sort : 'updatedAt';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const result = await Product.list({
      page,
      limit,
      category,
      sub_category: sub_category || product_type || null,
      brand,
      gender,
      colour,
      usage: usageFilter,
      minPrice,
      maxPrice,
      rating,
      search,
      sort: sortField,
      order: sortOrder,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/products/meta/categories
router.get('/meta/categories', async (req, res, next) => {
  try {
    const categories = await Product.getCategories();
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

// GET /api/products/meta/brands
router.get('/meta/brands', async (req, res, next) => {
  try {
    const brands = await Product.getBrands();
    res.json(brands);
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

    // DynamoDB inventory has no size dimension, so availability = stock > reserved.
    const availableIds = new Set(await Inventory.availableProductIds());

    const candidates = (await Product.topRated(200)).filter(
      (p) => p.is_active && availableIds.has(p.id)
    );

    if (!clothingSizes && !footwearSizes && !gender &&
        favourite_colors.length === 0 && style_preferences.length === 0) {
      return res.json({ products: candidates.slice(0, limit), personalized: false });
    }

    // Score candidates against user preferences
    const scored = candidates.map((p) => {
      let score = 0;
      const titleLower = `${p.title || ''} ${p.colour || ''} ${p.usage || ''} ${p.product_type || ''} ${p.sub_category || ''}`.toLowerCase();

      if (gender) {
        const g = gender.toLowerCase();
        if ((p.gender || '').toLowerCase().includes(g)) score += 10;
      }
      (favourite_colors || []).forEach((c) => {
        const t = c.toLowerCase();
        if ((p.colour || '').toLowerCase().includes(t) ||
            (p.title || '').toLowerCase().includes(t)) score += 8;
      });
      (style_preferences || []).forEach((s) => {
        const t = s.toLowerCase();
        if (titleLower.includes(t)) score += 6;
      });
      score += Math.min(parseFloat(p.rating) || 0, 5);
      return { p, score };
    });

    const personalized = scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((s) => s.p);

    let finalProducts = personalized;
    if (personalized.length < 4) {
      const pad = candidates
        .filter((p) => !personalized.some((pp) => pp.id === p.id))
        .slice(0, limit - personalized.length);
      finalProducts = [...personalized, ...pad];
    }

    res.json({ products: finalProducts.slice(0, limit), personalized: true });
  } catch (error) {
    next(error);
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id, { includeEmbedding: true });
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    // Attach inventory across stores
    const inventories = await Inventory.findByProduct(product.id);
    const inventory = [];
    for (const inv of inventories) {
      const store = await Store.findById(inv.store_id);
      inventory.push({
        ...inv,
        store: store || null,
        available: inv.quantity - inv.reserved_quantity,
      });
    }

    res.json({ ...product, inventory });
  } catch (error) {
    next(error);
  }
});

// GET /api/products/:id/stores - Get stores that have this product
router.get('/:id/stores', async (req, res, next) => {
  try {
    const inventories = await Inventory.findByProduct(req.params.id);

    const stores = [];
    for (const inv of inventories) {
      if (inv.quantity <= 0) continue;
      const store = await Store.findById(inv.store_id);
      if (!store) continue;
      stores.push({
        store,
        quantity: inv.quantity,
        reserved: inv.reserved_quantity,
        available: inv.quantity - inv.reserved_quantity,
      });
    }

    res.json(stores);
  } catch (error) {
    next(error);
  }
});

module.exports = router;