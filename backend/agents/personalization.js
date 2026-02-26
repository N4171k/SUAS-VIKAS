const { Product, Order } = require('../models');
const { Op } = require('sequelize');

/**
 * Personalization Agent
 * Provides personalized recommendations based on user behavior
 */

/**
 * Get recommendations based on user's order history
 */
const getPersonalizedRecommendations = async (userId, limit = 10) => {
  try {
    // Get user's past orders
    const orders = await Order.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit: 10,
    });

    // Extract categories and brands from past purchases
    const categories = new Set();
    const brands = new Set();
    const purchasedIds = new Set();

    orders.forEach((order) => {
      const items = order.items || [];
      items.forEach((item) => {
        purchasedIds.add(item.productId);
      });
    });

    // Get product details for purchased items
    if (purchasedIds.size > 0) {
      const purchasedProducts = await Product.findAll({
        where: { id: Array.from(purchasedIds) },
      });

      purchasedProducts.forEach((p) => {
        if (p.category) categories.add(p.category);
        if (p.brand) brands.add(p.brand);
      });
    }

    // Find similar products not yet purchased
    const where = {
      is_active: true,
      id: { [Op.notIn]: Array.from(purchasedIds) },
    };

    if (categories.size > 0 || brands.size > 0) {
      where[Op.or] = [];
      if (categories.size > 0) {
        where[Op.or].push({ category: { [Op.in]: Array.from(categories) } });
      }
      if (brands.size > 0) {
        where[Op.or].push({ brand: { [Op.in]: Array.from(brands) } });
      }
    }

    const recommendations = await Product.findAll({
      where,
      limit,
      order: [['rating', 'DESC'], ['rating_count', 'DESC']],
    });

    return recommendations;
  } catch (error) {
    console.error('Personalization Error:', error.message);
    // Fallback: return top-rated products
    return Product.findAll({
      where: { is_active: true },
      limit,
      order: [['rating', 'DESC']],
    });
  }
};

/**
 * Get trending products (most ordered in last 7 days)
 */
const getTrendingProducts = async (limit = 10) => {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Get recent orders and count product frequency
  const recentOrders = await Order.findAll({
    where: { created_at: { [Op.gte]: weekAgo } },
  });

  const productCounts = {};
  recentOrders.forEach((order) => {
    (order.items || []).forEach((item) => {
      productCounts[item.productId] = (productCounts[item.productId] || 0) + item.quantity;
    });
  });

  const sortedIds = Object.entries(productCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([id]) => parseInt(id));

  if (sortedIds.length === 0) {
    return Product.findAll({
      where: { is_active: true },
      limit,
      order: [['rating', 'DESC']],
    });
  }

  return Product.findAll({
    where: { id: { [Op.in]: sortedIds } },
  });
};

module.exports = { getPersonalizedRecommendations, getTrendingProducts };
