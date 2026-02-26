const { Op, fn, col, literal } = require('sequelize');
const { sequelize } = require('../config/db');
const Product = require('../models/Product');

/**
 * RAG (Retrieval Augmented Generation) Service
 * Searches the product catalog for relevant products based on query
 * Uses keyword-based search across all fashion-specific fields
 */

// Common stop words to remove from queries
const STOP_WORDS = new Set([
  'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'she', 'it', 'they',
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'is', 'am', 'are', 'was', 'were', 'be', 'been',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'can',
  'could', 'should', 'may', 'might', 'shall', 'what', 'which', 'who',
  'whom', 'this', 'that', 'these', 'those', 'how', 'where', 'when', 'why',
  'not', 'no', 'nor', 'if', 'then', 'so', 'too', 'very', 'just', 'about',
  'show', 'find', 'get', 'want', 'need', 'like', 'looking', 'search',
  'any', 'some', 'all', 'each', 'every', 'many', 'much', 'more', 'most',
  'help', 'please', 'tell', 'give', 'let', 'make',
]);

// Synonym mapping for common fashion terms
const SYNONYMS = {
  'tshirt': ['tshirts', 'tee', 'tees', 't-shirt', 't-shirts'],
  'shirt': ['shirts', 'top', 'tops'],
  'jeans': ['denim', 'denims'],
  'pants': ['trousers', 'bottoms', 'pant'],
  'shoes': ['shoe', 'footwear', 'sneakers', 'sneaker'],
  'dress': ['dresses', 'frock', 'gown'],
  'jacket': ['jackets', 'blazer', 'blazers', 'coat', 'coats'],
  'watch': ['watches', 'wristwatch'],
  'bag': ['bags', 'handbag', 'handbags', 'backpack', 'backpacks', 'purse'],
  'sandal': ['sandals', 'flip flops', 'slippers', 'slipper'],
  'kurta': ['kurtas', 'kurti', 'kurtis'],
  'ethnic': ['traditional', 'indian', 'desi'],
  'formal': ['office', 'professional', 'business'],
  'casual': ['everyday', 'daily', 'relaxed'],
  'sports': ['sporty', 'athletic', 'gym', 'workout', 'running'],
  'men': ['mens', "men's", 'male', 'boys', 'boy'],
  'women': ['womens', "women's", 'female', 'girls', 'girl', 'ladies', 'lady'],
  'kids': ['kid', 'children', 'child'],
  'red': ['maroon', 'crimson', 'burgundy'],
  'blue': ['navy', 'indigo', 'teal', 'cyan', 'aqua'],
  'black': ['dark', 'charcoal'],
  'white': ['cream', 'ivory', 'off-white'],
};

/**
 * Expand a keyword using synonym map
 */
const expandKeyword = (keyword) => {
  const expanded = [keyword];
  for (const [base, syns] of Object.entries(SYNONYMS)) {
    if (base === keyword || syns.includes(keyword)) {
      expanded.push(base, ...syns);
    }
  }
  return [...new Set(expanded)];
};

const searchProducts = async (query, limit = 10) => {
  try {
    const keywords = query
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 1 && !STOP_WORDS.has(w));

    if (keywords.length === 0) {
      // Return popular/top-rated products when query has no useful keywords
      return await Product.findAll({
        where: { is_active: true },
        limit,
        order: [['rating', 'DESC'], ['rating_count', 'DESC']],
      });
    }

    // Expand keywords with synonyms
    const allKeywords = keywords.flatMap(expandKeyword);
    const uniqueKeywords = [...new Set(allKeywords)];

    // Build search conditions — use iLike for PostgreSQL case-insensitive search
    const searchConditions = uniqueKeywords.map((keyword) => ({
      [Op.or]: [
        { title: { [Op.iLike]: `%${keyword}%` } },
        { description: { [Op.iLike]: `%${keyword}%` } },
        { category: { [Op.iLike]: `%${keyword}%` } },
        { sub_category: { [Op.iLike]: `%${keyword}%` } },
        { product_type: { [Op.iLike]: `%${keyword}%` } },
        { brand: { [Op.iLike]: `%${keyword}%` } },
        { gender: { [Op.iLike]: `%${keyword}%` } },
        { colour: { [Op.iLike]: `%${keyword}%` } },
        { usage: { [Op.iLike]: `%${keyword}%` } },
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
 * Get a high-level catalog summary so the AI knows what the store carries.
 * Result is cached in-memory for 10 minutes.
 */
let _catalogCache = null;
let _catalogCacheTime = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 min

const getCatalogSummary = async () => {
  try {
    if (_catalogCache && Date.now() - _catalogCacheTime < CACHE_TTL) {
      return _catalogCache;
    }

    const totalCount = await Product.count({ where: { is_active: true } });

    const categories = await Product.findAll({
      attributes: [
        'category',
        [fn('COUNT', col('id')), 'count'],
      ],
      where: { is_active: true },
      group: ['category'],
      order: [[fn('COUNT', col('id')), 'DESC']],
      raw: true,
    });

    const genders = await Product.findAll({
      attributes: [
        'gender',
        [fn('COUNT', col('id')), 'count'],
      ],
      where: { is_active: true },
      group: ['gender'],
      raw: true,
    });

    const topTypes = await Product.findAll({
      attributes: [
        'product_type',
        [fn('COUNT', col('id')), 'count'],
      ],
      where: { is_active: true },
      group: ['product_type'],
      order: [[fn('COUNT', col('id')), 'DESC']],
      limit: 20,
      raw: true,
    });

    const colours = await Product.findAll({
      attributes: ['colour'],
      where: { is_active: true },
      group: ['colour'],
      raw: true,
    });

    const summary = {
      totalProducts: totalCount,
      categories: categories.map((c) => `${c.category} (${c.count})`).join(', '),
      genders: genders.map((g) => `${g.gender} (${g.count})`).join(', '),
      productTypes: topTypes.map((t) => t.product_type).join(', '),
      colours: colours.map((c) => c.colour).filter(Boolean).join(', '),
    };

    _catalogCache = summary;
    _catalogCacheTime = Date.now();
    return summary;
  } catch (error) {
    console.error('Catalog Summary Error:', error.message);
    return { totalProducts: 0, categories: '', genders: '', productTypes: '', colours: '' };
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

module.exports = { searchProducts, getProductContext, getCatalogSummary };
