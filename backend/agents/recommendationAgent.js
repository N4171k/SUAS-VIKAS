/**
 * Recommendation Agent (RAG-powered)
 *
 * Flow:
 *  1. Build a rich preference query from the user profile
 *  2. Retrieve candidate products via keyword RAG search
 *  3. Additionally pull high-rated products matching gender/colour/style directly
 *  4. Filter by inventory availability
 *  5. Score every candidate against preferences and rank them
 *  6. Return structured JSON: { products, meta }
 */

const { Product, Inventory } = require('../models');
const { searchProducts } = require('../services/rag');

// ── Clothing size adjacency ───────────────────────────────────────────────
const CLOTHING_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const FOOTWEAR_ORDER = ['5', '6', '7', '8', '9', '10', '11', '12', '13'];

function adjacentSizes(size, order) {
  const idx = order.indexOf((size || '').toUpperCase().trim());
  if (idx === -1) return null; // unknown — will skip size filter
  const set = new Set();
  if (idx > 0) set.add(order[idx - 1]);
  set.add(order[idx]);
  if (idx < order.length - 1) set.add(order[idx + 1]);
  return Array.from(set);
}

// ── Colour normalisation ──────────────────────────────────────────────────
const COLOUR_ALIASES = {
  Navy: ['navy', 'blue', 'indigo'],
  Maroon: ['maroon', 'red', 'burgundy'],
  Beige: ['beige', 'cream', 'off-white'],
  Teal: ['teal', 'green', 'cyan'],
  Coral: ['coral', 'orange', 'red'],
};

function colourTerms(colorName) {
  return COLOUR_ALIASES[colorName] || [colorName.toLowerCase()];
}

// ── Style → usage/product_type mapping ───────────────────────────────────
const STYLE_MAP = {
  Casual:     ['casual', 'everyday'],
  Formal:     ['formal', 'office', 'business'],
  Sporty:     ['sports', 'gym', 'athletic', 'activewear', 'running'],
  Ethnic:     ['ethnic', 'traditional', 'kurta', 'saree', 'indian'],
  Streetwear: ['streetwear', 'urban', 'hip hop'],
  Minimalist: ['minimal', 'plain', 'basic'],
  Bohemian:   ['bohemian', 'boho', 'floral'],
  Party:      ['party', 'night out', 'club', 'glam'],
};

function styleTerms(styleName) {
  return STYLE_MAP[styleName] || [styleName.toLowerCase()];
}

// ── Preference query builder ──────────────────────────────────────────────
function buildPreferenceQuery(user) {
  const parts = [];

  if (user.gender) parts.push(user.gender);

  (user.favourite_colors || []).slice(0, 3).forEach((c) => {
    colourTerms(c).slice(0, 1).forEach((t) => parts.push(t));
  });

  (user.style_preferences || []).slice(0, 3).forEach((s) => {
    styleTerms(s).slice(0, 1).forEach((t) => parts.push(t));
  });

  return parts.join(' ') || 'fashion clothing';
}

// ── Inventory availability check ─────────────────────────────────────────
async function getAvailableProductIds() {
  try {
    const ids = await Inventory.availableProductIds();
    return { ids, sizeFiltered: false };
  } catch (err) {
    console.error('[RecommendationAgent] Inventory query error:', err.message);
    return { ids: [], sizeFiltered: false };
  }
}

// ── Per-product preference scorer ────────────────────────────────────────
function scoreProduct(product, user) {
  let score = 0;
  const reasons = [];

  const title      = (product.title       || '').toLowerCase();
  const colour     = (product.colour      || '').toLowerCase();
  const usage      = (product.usage       || '').toLowerCase();
  const gender     = (product.gender      || '').toLowerCase();
  const subCat     = (product.sub_category|| '').toLowerCase();
  const prodType   = (product.product_type|| '').toLowerCase();

  // Gender match
  if (user.gender) {
    const g = user.gender.toLowerCase();
    if (gender.includes(g) || gender === 'unisex') {
      score += 10;
      reasons.push(`matches your gender (${user.gender})`);
    }
  }

  // Colour match
  const userColors = user.favourite_colors || [];
  userColors.forEach((c) => {
    const terms = colourTerms(c);
    if (terms.some((t) => colour.includes(t))) {
      score += 8;
      reasons.push(`colour match (${product.colour})`);
    }
  });

  // Style match
  const userStyles = user.style_preferences || [];
  userStyles.forEach((s) => {
    const terms = styleTerms(s);
    if (terms.some((t) => usage.includes(t) || prodType.includes(t) || subCat.includes(t) || title.includes(t))) {
      score += 6;
      reasons.push(`style match (${s})`);
    }
  });

  // Bonus: high rated product
  const rating = parseFloat(product.rating) || 0;
  if (rating >= 4.5) { score += 4; reasons.push('top rated'); }
  else if (rating >= 4.0) { score += 2; }

  return { score, reasons: [...new Set(reasons)] };
}

// ── Main agent function ───────────────────────────────────────────────────
/**
 * @param {object} user  — full API user object (from DynamoDB)
 * @param {number} limit — max products to return
 * @returns {object}     — { products: [...], meta: {...} }
 */
async function getRecommendations(user, limit = 12) {
  const startTime = Date.now();

  // 1. Compute adjacent sizes (used for meta only; DynamoDB inventory has no size)
  const clothingSizes = adjacentSizes(user.clothing_size, CLOTHING_ORDER);
  const footwearSizes  = adjacentSizes(user.footwear_size,  FOOTWEAR_ORDER);

  // 2. Build RAG query string
  const query = buildPreferenceQuery(user);

  // 3. Retrieve candidates via RAG (keyword search)
  const [ragResults, directResults] = await Promise.all([
    searchProducts(query, 60).catch(() => []),
    Product.topRated(60).catch(() => []),
  ]);

  // 4. Merge and deduplicate candidates
  const seen  = new Set();
  const candidates = [];
  for (const p of [...ragResults, ...directResults]) {
    if (!seen.has(p.id)) {
      seen.add(p.id);
      candidates.push(p);
    }
  }

  // 5. Inventory availability filter
  const { ids: availableIds, sizeFiltered } = await getAvailableProductIds();

  let filtered = candidates;
  if (availableIds.length > 0) {
    const availSet = new Set(availableIds);
    filtered = candidates.filter((p) => availSet.has(p.id));
  }

  // If no candidates survive, fall back to top-rated available products
  if (filtered.length < 4) {
    try {
      const topRated = await Product.topRated(limit * 2);
      const extra = topRated.filter((p) => !seen.has(p.id));
      filtered = [...filtered, ...extra].slice(0, limit);
    } catch (e) {
      console.error('[RecommendationAgent] Fallback error:', e.message);
    }
  }

  // 6. Score every candidate
  const scored = filtered.map((p) => {
    const { score, reasons } = scoreProduct(p, user);
    return { product: p, score, reasons };
  });

  // Sort by score desc, then rating desc
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return parseFloat(b.product.rating) - parseFloat(a.product.rating);
  });

  const top = scored.slice(0, limit);

  // 7. Build structured JSON output
  const products = top.map(({ product: p, score, reasons }) => ({
    ...p,
    // Recommendation metadata
    _match_score:   score,
    _match_reasons: reasons,
  }));

  const meta = {
    total:          products.length,
    personalized:   true,
    size_filtered:  sizeFiltered,
    clothing_sizes: clothingSizes,
    footwear_sizes: footwearSizes,
    rag_query:      query,
    generated_at:   new Date().toISOString(),
    elapsed_ms:     Date.now() - startTime,
  };

  return { products, meta };
}

module.exports = { getRecommendations };