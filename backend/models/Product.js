const fs = require('fs');
const path = require('path');

const CSV_PATH = path.join(__dirname, '..', 'products.csv');

let cachedProducts = null;
let cachedCategories = null;
let cachedBrands = null;

// ── Minimal RFC-4180 CSV parser (handles quoted fields, escaped quotes, newlines) ──
function parseCSV(text) {
  text = text.replace(/^\uFEFF/, '');
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (ch !== '\r') {
      field += ch;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function num(s) {
  if (!s) return 0;
  const n = parseFloat(String(s).replace(/,/g, ''));
  return isFinite(n) ? n : 0;
}

function parsePrice(value) {
  const n = parseFloat(String(value || '0').replace(/,/g, ''));
  return isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : 0;
}

function parseListPrice(value) {
  if (!value) return null;
  const m = String(value).match(/[\d.,]+/);
  if (!m) return null;
  const n = parseFloat(m[0].replace(/,/g, ''));
  return isFinite(n) ? n : null;
}

function parseRatingStars(value) {
  if (!value) return 0;
  const m = String(value).match(/(\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : 0;
}

function parseRatingCount(value) {
  if (!value) return 0;
  const raw = String(value).replace(/,/g, '');
  const m = raw.match(/(\d+(?:\.\d+)?)([kK])?/);
  if (!m) return 0;
  let n = parseFloat(m[1]);
  if (m[2]) n *= 1000;
  return Math.round(n);
}

function parseImages(value) {
  if (!value) return null;
  const urls = String(value).match(/https?:\/\/[^\s'"]+/g);
  return urls && urls.length > 0 ? urls[0] : null;
}

function parseColour(...variants) {
  for (const v of variants) {
    if (!v) continue;
    const m = String(v).match(/^colou?r\s*:\s*(.+)$/i);
    if (m) return m[1].trim() || null;
  }
  return null;
}

const GENDER_WORDS = ['men', 'women', 'boys', 'girls', 'baby', 'unisex', 'kids', 'male', 'female'];

function detectGender(breadcrumbs, title) {
  const needle = (breadcrumbs ? breadcrumbs.split('›').map((p) => p.trim().toLowerCase()) : [])
    .concat([String(title || '').toLowerCase()]);
  for (const g of GENDER_WORDS) {
    if (needle.some((p) => p === g || p === `${g}`)) return g === 'unisex' ? 'Unisex' : g.charAt(0).toUpperCase() + g.slice(1);
  }
  // word-boundary fallback inside title/breadcrumb text
  const blob = `${breadcrumbs || ''} ${title || ''}`.toLowerCase();
  const reOrder = [
    { re: /\bwomen'?s\b|women\b|\bfemale\b|\bladies\b|\blady\b/, val: 'Women' },
    { re: /\bgirls?\b/, val: 'Girls' },
    { re: /\bunisex\b/, val: 'Unisex' },
    { re: /\bboys?\b/, val: 'Boys' },
    { re: /\bmen'?s\b|\bmen\b|\bmale\b/, val: 'Men' },
  ];
  for (const { re, val } of reOrder) {
    if (re.test(blob)) return val;
  }
  return null;
}

const TOP_BUCKETS = new Set(['clothing, shoes & jewelry', 'clothing', 'shoes & jewelry', 'home & kitchen', 'electronics', 'sports & outdoors', 'beauty']);

function coarseCategory(breadcrumbs) {
  const parts = (breadcrumbs || '').split('›')
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean)
    .filter((p) => !TOP_BUCKETS.has(p));
  const s = parts.join(' ');
  if (/(shoes?|footwear|sandal|sneaker|slipper|\bboots?\b|heel|loafer)/.test(s)) return 'Footwear';
  if (/(\bhandbags?\b|\bbags?\b|backpack|wallet|\bbelts?\b|\bhats?\b|sunglass|jeweller|jewelr|watch|scarf)/.test(s)) return 'Bags, Wallets & Belts';
  if (/(\btoys?\b|\bgame\b|gaming)/.test(s)) return 'Toys';
  return 'Clothing and Accessories';
}

function deriveFields(record) {
  const breadcrumbs = (record.breadcrumbs || '').split('›').map((p) => p.trim()).filter(Boolean);

  let category = coarseCategory(record.breadcrumbs);
  if (breadcrumbs.length > 0) {
    const last = breadcrumbs[breadcrumbs.length - 1];
    if (/clothing|activewear|apparel/i.test(last)) category = 'Clothing and Accessories';
  }

  return {
    category,
    sub_category: breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1] : 'General',
    product_type: breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2] : null,
    gender: detectGender(record.breadcrumbs, record.title),
    usage: null,
  };
}

function mapProduct(record, index) {
  const derived = deriveFields(record);
  const title = (record.title || '').trim();
  const price = parsePrice(record.price_value);
  const originalPrice = parseListPrice(record.list_price);

  return {
    id: record.asin || `csv_${index}`,
    productId: record.asin || `csv_${index}`,
    title: title.substring(0, 500),
    description: (record.product_description || record.about_item || '').substring(0, 10000) || null,
    price,
    original_price: originalPrice && originalPrice > price ? originalPrice : null,
    category: derived.category,
    sub_category: derived.sub_category,
    product_type: derived.product_type,
    gender: derived.gender,
    colour: parseColour(record['default_variant/0'], record['default_variant/1'], record['default_variant/2']),
    usage: derived.usage,
    brand: (record.brand_name || 'Unknown').trim(),
    rating: parseRatingStars(record.rating_stars),
    rating_count: parseRatingCount(record.rating_count),
    image_url: parseImages(record.all_images),
    features: (record.about_item || '').substring(0, 10000) || null,
    is_active: String(record.availability || '').toLowerCase() === 'in stock',
    isArEnabled: false,
    source: 'products.csv',
    updatedAt: record.scrape_time || new Date().toISOString(),
  };
}

function loadProducts() {
  if (cachedProducts) return cachedProducts;

  console.log('Loading products from products.csv...');
  const text = fs.readFileSync(CSV_PATH, 'utf8');
  const rows = parseCSV(text);
  const header = rows[0];
  const cols = {};
  header.forEach((name, i) => {
    cols[name] = i;
  });

  cachedProducts = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length < 2) continue;
    const record = {};
    for (const name of Object.keys(cols)) {
      if (cols[name] < row.length) record[name] = row[cols[name]];
    }
    const product = mapProduct(record, r - 1);
    if (!product.title || product.price <= 0) continue;
    cachedProducts.push(product);
  }

  console.log(`Loaded ${cachedProducts.length} products`);
  return cachedProducts;
}

const getCategories = async () => {
  if (cachedCategories) return cachedCategories;
  const products = loadProducts();
  const set = new Set();
  products.forEach((p) => { if (p.category) set.add(p.category); });
  cachedCategories = [...set].sort();
  return cachedCategories;
};

const getBrands = async () => {
  if (cachedBrands) return cachedBrands;
  const products = loadProducts();
  const set = new Set();
  products.forEach((p) => { if (p.brand) set.add(p.brand); });
  cachedBrands = [...set].filter((b) => b !== 'Unknown').sort();
  return cachedBrands;
};

function filterProducts(products, filters) {
  const {
    category,
    sub_category,
    brand,
    gender,
    colour,
    minPrice,
    maxPrice,
    rating,
    search,
  } = filters;

  const normalizedSearch = (search || '').toLowerCase().trim();

  return products.filter((p) => {
    if (category && !(p.category || '').toLowerCase().includes(category.toLowerCase())) return false;
    if (sub_category && !(p.sub_category || '').toLowerCase().includes(sub_category.toLowerCase())) return false;
    if (brand && !(p.brand || '').toLowerCase().includes(brand.toLowerCase())) return false;
    if (gender && !(p.gender || '').toLowerCase().includes(gender.toLowerCase())) return false;
    if (colour && !(p.colour || '').toLowerCase().includes(colour.toLowerCase())) return false;
    if (minPrice && p.price < minPrice) return false;
    if (maxPrice && p.price > maxPrice) return false;
    if (rating && p.rating < rating) return false;
    if (normalizedSearch) {
      const haystack = [
        p.title, p.description, p.brand, p.category,
        p.sub_category, p.colour, p.gender,
      ].filter(Boolean).join(' ').toLowerCase();
      if (!haystack.includes(normalizedSearch)) return false;
    }
    return true;
  });
}

function sortProducts(products, sort, order) {
  const validSortFields = ['price', 'rating', 'title', 'rating_count', 'updatedAt'];
  const sortField = validSortFields.includes(sort) ? sort : 'updatedAt';
  const sortOrder = (order || 'DESC').toUpperCase() === 'ASC' ? 1 : -1;

  return [...products].sort((a, b) => {
    const va = a[sortField];
    const vb = b[sortField];
    let cmp = 0;
    if (typeof va === 'number' && typeof vb === 'number') cmp = va - vb;
    else cmp = String(va || '').localeCompare(String(vb || ''));
    return sortOrder * cmp;
  });
}

const findById = async (productId, { includeEmbedding = false } = {}) => {
  const products = loadProducts();
  const product = products.find((p) => p.id === productId || p.productId === productId);
  if (!product) return null;
  const result = { ...product };
  if (includeEmbedding) result.embedding = product.embedding;
  return result;
};

const create = async () => {
  throw new Error('Create not supported - products come from products.csv');
};

const update = async () => {
  throw new Error('Update not supported - products come from products.csv');
};

const list = async ({
  page = 1,
  limit = 20,
  category,
  sub_category,
  brand,
  gender,
  colour,
  minPrice,
  maxPrice,
  rating,
  search,
  sort = 'updatedAt',
  order = 'DESC',
}) => {
  const products = loadProducts();
  const filtered = filterProducts(products, { category, sub_category, brand, gender, colour, minPrice, maxPrice, rating, search });
  const sorted = sortProducts(filtered, sort, order);

  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 20));
  const total = sorted.length;
  const start = (pageNum - 1) * limitNum;
  const paginated = sorted.slice(start, start + limitNum);

  return {
    products: paginated,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

const topRated = async (limit = 12) => {
  const products = loadProducts();
  return [...products]
    .sort((a, b) => (b.rating - a.rating) || (b.rating_count - a.rating_count))
    .slice(0, limit);
};

const listByIds = async (ids) => {
  const products = loadProducts();
  const idSet = new Set(ids);
  return products.filter((p) => idSet.has(p.id) || idSet.has(p.productId));
};

const getCatalog = async () => loadProducts();

module.exports = {
  findById,
  create,
  update,
  list,
  topRated,
  listByIds,
  getCategories,
  getBrands,
  count: async () => loadProducts().length,
  scanAllForAnalytics: async () => loadProducts(),
  scanAllRaw: async () => loadProducts(),
  getCatalog,
};