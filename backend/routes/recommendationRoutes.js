const express = require('express');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { getRecommendations } = require('../agents/recommendationAgent');
const { Product } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

/**
 * GET /api/recommendations
 * Returns personalised product recommendations for the logged-in user.
 *
 * Response JSON:
 * {
 *   products: [ { id, title, price, colour, ... , _match_score, _match_reasons }, ... ],
 *   meta:     { total, personalized, size_filtered, clothing_sizes, rag_query, ... }
 * }
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const user = req.user;
    const limit = Math.min(parseInt(req.query.limit) || 12, 40);

    // If user has no preferences at all, return top-rated products
    const hasPreferences =
      user.gender ||
      user.clothing_size ||
      user.footwear_size ||
      (user.favourite_colors  || []).length > 0 ||
      (user.style_preferences || []).length > 0;

    if (!hasPreferences) {
      const products = await Product.findAll({
        where: { is_active: true },
        order: [['rating', 'DESC'], ['rating_count', 'DESC']],
        limit,
      });
      return res.json({
        products,
        meta: {
          total: products.length,
          personalized: false,
          reason: 'No preferences set — showing top rated products',
          generated_at: new Date().toISOString(),
        },
      });
    }

    const result = await getRecommendations(user, limit);
    return res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/recommendations/trending
 * Public endpoint — returns top-rated products (no auth required).
 */
router.get('/trending', optionalAuth, async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 8, 20);
    const products = await Product.findAll({
      where: { is_active: true },
      order: [['rating', 'DESC'], ['rating_count', 'DESC']],
      limit,
    });
    res.json({
      products,
      meta: {
        total: products.length,
        personalized: false,
        generated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
