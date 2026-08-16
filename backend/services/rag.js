const Product = require('../models/Product');

/**
 * RAG (Retrieval Augmented Generation) Service
 * Searches the product catalog for relevant products based on query
 * Uses in-memory keyword search over the DynamoDB catalog (28k items)
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

/**
 * In-memory catalog cache (shared with Product model so the 28k-item table is
 * only scanned once per process — see Product.getCatalog).
 */
const getCatalog = async () => {
  return Product.getCatalog();
};

const searchProducts = async (query, limit = 10) => {
  try {
    const keywords = query
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 1 && !STOP_WORDS.has(w));

    const catalog = await getCatalog();

    if (keywords.length === 0) {
      // Return popular/top-rated products when query has no useful keywords
      return [...catalog]
        .filter((p) => p.is_active)
        .sort((a, b) => (b.rating - a.rating) || (b.rating_count - a.rating_count))
        .slice(0, limit);
    }

    // Expand keywords with synonyms
    const allKeywords = keywords.flatMap(expandKeyword);
    const uniqueKeywords = [...new Set(allKeywords)];

    const scored = catalog.filter((p) => p.is_active).map((p) => {
      const haystack = [
        p.title, p.description, p.category, p.sub_category,
        p.product_type, p.brand, p.gender, p.colour, p.usage,
      ].filter(Boolean).join(' ').toLowerCase();

      let matches = 0;
      for (const kw of uniqueKeywords) {
        if (haystack.includes(kw)) matches++;
      }
      return { product: p, matches };
    });

    return scored
      .filter((s) => s.matches > 0)
      .sort((a, b) => (b.matches - a.matches) || (b.product.rating - a.product.rating))
      .slice(0, limit)
      .map((s) => s.product);
  } catch (error) {
    console.error('RAG Search Error:', error.message);
    return [];
  }
};

/**
 * Get a high-level catalog summary so the AI knows what the store carries.
 */
const getCatalogSummary = async () => {
  try {
    const catalog = await getCatalog();

    const totalCount = catalog.length;

    const categories = {};
    const genders = {};
    const productTypes = {};
    const colours = new Set();

    catalog.forEach((p) => {
      if (p.category) categories[p.category] = (categories[p.category] || 0) + 1;
      if (p.gender) genders[p.gender] = (genders[p.gender] || 0) + 1;
      if (p.product_type) productTypes[p.product_type] = (productTypes[p.product_type] || 0) + 1;
      if (p.colour) colours.add(p.colour);
    });

    const topTypes = Object.entries(productTypes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([t]) => t);

    return {
      totalProducts: totalCount,
      categories: Object.entries(categories).map(([c, n]) => `${c} (${n})`).join(', '),
      genders: Object.entries(genders).map(([g, n]) => `${g} (${n})`).join(', '),
      productTypes: topTypes.join(', '),
      colours: [...colours].filter(Boolean).join(', '),
    };
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
    const products = await Product.listByIds(productIds);
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