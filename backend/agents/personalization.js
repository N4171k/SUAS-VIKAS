const { Product, Order } = require('../models');

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
    const orders = await Order.findByUser(userId);

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
      const purchasedProducts = await Product.listByIds([...purchasedIds]);
      purchasedProducts.forEach((p) => {
        if (p.category) categories.add(p.category);
        if (p.brand) brands.add(p.brand);
      });
    }

    // Find similar products not yet purchased
    const all = await Product.topRated(500);
    let recommendations = all.filter((p) => p.is_active && !purchasedIds.has(p.id));

    if (categories.size > 0 || brands.size > 0) {
      const categoryMatch = recommendations.filter((p) => categories.has(p.category));
      const brandMatch = recommendations.filter((p) => brands.has(p.brand));
      if (categoryMatch.length > 0 || brandMatch.length > 0) {
        recommendations = [...new Set([...categoryMatch, ...brandMatch])];
      }
    }

    return recommendations.slice(0, limit);
  } catch (error) {
    console.error('Personalization Error:', error.message);
    // Fallback: return top-rated products
    return Product.topRated(limit);
  }
};

/**
 * Get trending products (most ordered in last 7 days)
 */
const getTrendingProducts = async (limit = 10) => {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Get recent orders and count product frequency
  const recentOrders = await Order.findAll();
  const recent = recentOrders.filter((o) => new Date(o.createdAt) >= weekAgo);

  const productCounts = {};
  recent.forEach((order) => {
    (order.items || []).forEach((item) => {
      productCounts[item.productId] = (productCounts[item.productId] || 0) + item.quantity;
    });
  });

  const sortedIds = Object.entries(productCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([id]) => id);

  if (sortedIds.length === 0) {
    return Product.topRated(limit);
  }

  const products = await Product.listByIds(sortedIds);
  return products;
};

module.exports = { getPersonalizedRecommendations, getTrendingProducts };