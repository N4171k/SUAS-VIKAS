const { Op } = require('sequelize');
const { Product } = require('../models');

/**
 * RAG (Retrieval Augmented Generation) Service
 * Searches the product catalog for relevant products based on query
 * Uses keyword-based search across all fashion-specific fields
 */

const searchProducts = async (query, limit = 10) => {
  try {
    const keywords = query
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2);

    if (keywords.length === 0) {
      return [];
    }

    // Build search conditions for each keyword across all relevant fields
    const searchConditions = keywords.map((keyword) => ({
      [Op.or]: [
        { title: { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } },
        { category: { [Op.like]: `%${keyword}%` } },
        { sub_category: { [Op.like]: `%${keyword}%` } },
        { product_type: { [Op.like]: `%${keyword}%` } },
        { brand: { [Op.like]: `%${keyword}%` } },
        { gender: { [Op.like]: `%${keyword}%` } },
        { colour: { [Op.like]: `%${keyword}%` } },
        { usage: { [Op.like]: `%${keyword}%` } },
      ],
    }));

    const products = await Product.findAll({
      where: {
        is_active: true,
        [Op.or]: searchConditions,
      },
      limit,
      order: [
        ['rating', 'DESC'],
        ['rating_count', 'DESC'],
      ],
    });

    return products;
  } catch (error) {
    console.error('RAG Search Error:', error.message);
    return [];
  }
};

/**
 * Get product context string for AI
 */
const getProductContext = async (productIds) => {
  try {
    const products = await Product.findAll({
      where: { id: productIds },
    });

    return products.map((p) => ({
      id: p.id,
      title: p.title,
      price: p.price,
      category: p.category,
      sub_category: p.sub_category,
      product_type: p.product_type,
      gender: p.gender,
      colour: p.colour,
      usage: p.usage,
      brand: p.brand,
      rating: p.rating,
      description: p.description,
    }));
  } catch (error) {
    console.error('Context Error:', error.message);
    return [];
  }
};

module.exports = { searchProducts, getProductContext };
