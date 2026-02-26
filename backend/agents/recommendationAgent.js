/**
 * Recommendation Agent (RAG-powered)
 *
 * Flow:
 *  1. Build a rich preference query from the user profile
 *  2. Retrieve candidate products via keyword RAG search
 *  3. Additionally pull high-rated products matching gender/colour/style directly
 *  4. Filter by inventory availability (with graceful ±1 size fallback)
 *  5. Score every candidate against preferences and rank them
 *  6. Return structured JSON: { products, meta }
 */

const { Op, literal, fn, col } = require('sequelize');
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
// Maps user-selected colour names to terms likely in the catalogue
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
async function getAvailableProductIds(clothingSizes, footwearSizes) {
  try {
    const allSizes = [
      ...(clothingSizes || []),
      ...(footwearSizes || []),
    ];

    // Try size-aware availability first
    if (allSizes.length > 0) {
      const rows = await Inventory.findAll({
        attributes: ['product_id'],
        where: {
          size: { [Op.in]: allSizes },
          [Op.and]: literal('"quantity" - "reserved_quantity" > 0'),
        },
        group: ['product_id'],
        raw: true,
      });
      if (rows.length > 0) {
        return { ids: rows.map((r) => r.product_id), sizeFiltered: true };
      }
    }

    // Fallback: any available inventory (size column may not exist yet / be null)
    const fallback = await Inventory.findAll({
      attributes: ['product_id'],
      where: {
        quantity: { [Op.gt]: 0 },
      },
      group: ['product_id'],
      raw: true,
    });
    return { ids: fallback.map((r) => r.product_id), sizeFiltered: false };
  } catch (err) {
    console.error('[RecommendationAgent] Inventory query error:', err.message);
    // Return empty to allow product-only fallback
    return { ids: [], sizeFiltered: false };
  }
}

// ── Per-product preference scorer ────────────────────────────────────────
function scoreProduct(product, user, clothingSizesSet) {
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
    if (terms.some((t) => usage.includes(t) || prodType.includes(t) || subCat.includes(t))) {
      score += 6;
      reasons.push(`style match (${s})`);
    }
  });

  // Bonus: high rated product
  const rating = parseFloat(product.rating) || 0;
  if (rating >= 4.5) { score += 4; reasons.push('top rated'); }
  else if (rating >= 4.0) { score += 2; }

  // Bonus: size mentioned in title (rough heuristic since catalogue has no size field)
  if (clothingSizesSet.size > 0) {
    [...clothingSizesSet].forEach((sz) => {
      if (title.includes(sz.toLowerCase())) {
        score += 3;
        reasons.push(`size hint (${sz})`);
      }
    });
  }

  return { score, reasons: [...new Set(reasons)] };
}

// ── Main agent function ───────────────────────────────────────────────────
/**
 * @param {object} user  — full Sequelize User instance
 * @param {number} limit — max products to return
 * @returns {object}     — { products: [...], meta: {...} }
 */
async function getRecommendations(user, limit = 12) {
  const startTime = Date.now();

  // 1. Compute adjacent sizes
  const clothingSizes = adjacentSizes(user.clothing_size, CLOTHING_ORDER);
  const footwearSizes  = adjacentSizes(user.footwear_size,  FOOTWEAR_ORDER);
  const clothingSizesSet = new Set(clothingSizes || []);

  // 2. Build RAG query string
  const query = buildPreferenceQuery(user);

  // 3. Retrieve candidates via RAG (keyword search)
  const [ragResults, directResults] = await Promise.all([
    searchProducts(query, 60).catch(() => []),

    // Additional direct DB fetch: gender + colour match
    (async () => {
      try {
        const where = { is_active: true };
        const orClauses = [];

        if (user.gender) {
          orClauses.push({ gender: { [Op.iLike]: `%${user.gender}%` } });
        }

        (user.favourite_colors || []).forEach((c) => {
          colourTerms(c).forEach((t) => {
            orClauses.push({ colour: { [Op.iLike]: `%${t}%` } });
          });
        });

        (user.style_preferences || []).forEach((s) => {
          styleTerms(s).forEach((t) => {
            orClauses.push({ usage:        { [Op.iLike]: `%${t}%` } });
            orClauses.push({ product_type: { [Op.iLike]: `%${t}%` } });
          });
        });

        if (orClauses.length > 0) where[Op.or] = orClauses;

        return await Product.findAll({
          where,
          order: [['rating', 'DESC'], ['rating_count', 'DESC']],
          limit: 60,
        });
      } catch (e) {
        console.error('[RecommendationAgent] Direct query error:', e.message);
        return [];
      }
    })(),
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
  const { ids: availableIds, sizeFiltered } = await getAvailableProductIds(
    clothingSizes, footwearSizes
  );

  let filtered = candidates;
  if (availableIds.length > 0) {
    const availSet = new Set(availableIds);
    filtered = candidates.filter((p) => availSet.has(p.id));
  }

  // If no candidates survive, fall back to top-rated available products
  if (filtered.length < 4) {
    try {
      const topRated = await Product.findAll({
        where: {
          is_active: true,
          ...(availableIds.length > 0 ? { id: { [Op.in]: availableIds.slice(0, 500) } } : {}),
        },
        order: [['rating', 'DESC'], ['rating_count', 'DESC']],
        limit: limit,
      });
      // Merge without duplicates
      const extra = topRated.filter((p) => !seen.has(p.id));
      filtered = [...filtered, ...extra].slice(0, limit);
    } catch (e) {
      console.error('[RecommendationAgent] Fallback error:', e.message);
    }
  }

  // 6. Score every candidate
  const scored = filtered.map((p) => {
    const { score, reasons } = scoreProduct(p, user, clothingSizesSet);
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
    id:           p.id,
    title:        p.title,
    price:        p.price,
    original_price: p.original_price,
    category:     p.category,
    sub_category: p.sub_category,
    product_type: p.product_type,
    gender:       p.gender,
    colour:       p.colour,
    usage:        p.usage,
    brand:        p.brand,
    rating:       p.rating,
    rating_count: p.rating_count,
    image_url:    p.image_url,
    is_active:    p.is_active,
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
