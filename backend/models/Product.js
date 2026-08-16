const { TABLES } = require('../config/db');
const { getItem, putItem, updateItem, scanAll, batchGet } = require('./base');

const table = TABLES.Products;

const strip = (s) => String(s || '').replace(/,/g, '').trim();
const toNumber = (s) => {
  const n = parseFloat(strip(s));
  return isNaN(n) ? 0 : n;
};

/**
 * Map a raw DynamoDB product item into the API shape the frontend expects.
 * Raw items keep the original Flipkart payload under `attributes` and only a
 * few flattened fields (title, price, category, subCategory, brand, rating…).
 */
const toAPI = (item, { includeEmbedding = false } = {}) => {
  if (!item) return null;
  const attrs = item.attributes || {};
  const details = attrs.product_details || [];
  const detail = (key) => {
    const found = details.find((d) => Object.keys(d)[0]?.toLowerCase() === key.toLowerCase());
    return found ? Object.values(found)[0] : null;
  };

  const title = item.title || attrs.title || 'Fashion Product';
  const titleLower = title.toLowerCase();
  let gender = attrs.gender || null;
  if (!gender) {
    if (titleLower.includes('men') && !titleLower.includes('women')) gender = 'Men';
    else if (titleLower.includes('women') || titleLower.includes('woman')) gender = 'Women';
    else if (titleLower.includes('boys')) gender = 'Boys';
    else if (titleLower.includes('girls')) gender = 'Girls';
  }

  const price = item.price > 0 ? item.price : toNumber(attrs.selling_price);
  const original_price = toNumber(attrs.actual_price) || price;

  const out = {
    id: item.productId,
    productId: item.productId,
    title,
    description: item.description || attrs.description || null,
    price,
    original_price: original_price > price ? original_price : null,
    category: item.category || attrs.category || 'Fashion',
    sub_category: item.subCategory || attrs.sub_category || null,
    product_type: item.product_type || detail('Type') || attrs.product_type || null,
    gender,
    colour: item.colour || detail('Color') || attrs.colour || null,
    usage: item.usage || detail('Occasion') || attrs.usage || null,
    brand: item.brand || attrs.brand || null,
    rating: item.rating || toNumber(attrs.average_rating),
    rating_count: item.rating_count || 0,
    image_url: item.image_url || (Array.isArray(attrs.images) ? attrs.images[0] : null) || null,
    features: item.features || (details.length ? JSON.stringify(details) : null),
    is_active: item.is_active !== undefined ? item.is_active : !attrs.out_of_stock,
    isArEnabled: item.isArEnabled === true,
    source: item.source || null,
    updatedAt: item.updatedAt,
  };
  if (includeEmbedding && Array.isArray(item.embedding)) out.embedding = item.embedding;
  return out;
};

const findById = async (productId, { includeEmbedding = false } = {}) => {
  const item = await getItem(table, { productId });
  return toAPI(item, { includeEmbedding });
};

const create = async (data) => {
  const productId = data.productId || data.id;
  const now = new Date().toISOString();
  const item = {
    productId,
    title: data.title,
    description: data.description || null,
    price: data.price || 0,
    category: data.category || null,
    subCategory: data.sub_category || null,
    brand: data.brand || null,
    rating: data.rating || 0,
    isArEnabled: data.isArEnabled || false,
    source: data.source || 'manual',
    updatedAt: now,
  };
  if (data.attributes) item.attributes = data.attributes;
  if (data.embedding) item.embedding = data.embedding;
  await putItem(table, item);
  patchCatalog(toAPI(item));
  return toAPI(item);
};

const update = async (productId, updates) => {
  const item = await updateItem(table, { productId }, { ...updates, updatedAt: new Date().toISOString() });
  patchCatalog(toAPI(item));
  return toAPI(item);
};

/**
 * Shared in-memory catalog cache.
 * Scanning the full Products table costs ~112k RCU (28k items × 16KB, mostly
 * the 768-dim `embedding`) and is throttled at 25 RCU (~1 h). The catalog is
 * therefore prebuilt ONCE into backend/catalog.json (scripts/buildCatalog.js)
 * and loaded from disk; getCatalog falls back to a paced scan only if the
 * file is missing. Writes patch the cache and refresh the file.
 */
const fs = require('fs');
const path = require('path');

const CATALOG_TTL_MS = 30 * 60 * 1000;
const CATALOG_FILE = path.join(__dirname, '..', 'catalog.json');
let _catalog = null;
let _catalogAt = 0;

const writeCatalogFile = () => {
  try {
    fs.writeFileSync(CATALOG_FILE, JSON.stringify(_catalog || []));
  } catch (err) {
    console.error('⚠️  Could not write catalog.json:', err.message);
  }
};

const invalidateCatalog = () => {
  _catalog = null;
  _catalogAt = 0;
};

const getCatalog = async ({ force = false } = {}) => {
  if (force || !_catalog || Date.now() - _catalogAt > CATALOG_TTL_MS) {
    if (fs.existsSync(CATALOG_FILE)) {
      _catalog = JSON.parse(fs.readFileSync(CATALOG_FILE, 'utf8'));
      _catalogAt = Date.now();
      console.log(`📚 Catalog loaded from file: ${_catalog.length} products`);
      return _catalog;
    }
    const raw = await scanAll({
      TableName: table,
      ProjectionExpression: 'productId, title, attributes',
    });
    _catalog = raw.map((it) => toAPI(it)).filter((p) => p && p.id);
    _catalogAt = Date.now();
    writeCatalogFile();
    console.log(`📚 Catalog cache built via scan: ${_catalog.length} products`);
  }
  return _catalog;
};

/** Patch the cached catalog after a write so reads stay fresh without a rescan. */
const patchCatalog = (formattedItem) => {
  if (!_catalog) return;
  const idx = _catalog.findIndex((p) => p.id === formattedItem.id);
  if (idx >= 0) _catalog[idx] = formattedItem;
  else _catalog.unshift(formattedItem);
  writeCatalogFile();
};

/**
 * List products with filtering / search / sorting / pagination.
 * DynamoDB has no LIKE/ILIKE and scans are too expensive at this scale, so
 * filtering + sorting + pagination run in memory over the cached catalog.
 */
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
  const catalog = await getCatalog();
  const normalizedSearch = (search || '').toLowerCase().trim();

  const filtered = catalog.filter((api) => {
    if (!api.is_active) return false;
    if (category && !(api.category || '').toLowerCase().includes(category.toLowerCase())) return false;
    if (sub_category && !(api.sub_category || '').toLowerCase().includes(sub_category.toLowerCase())) return false;
    if (brand && !(api.brand || '').toLowerCase().includes(brand.toLowerCase())) return false;
    if (gender && !(api.gender || '').toLowerCase().includes(gender.toLowerCase())) return false;
    if (colour && !(api.colour || '').toLowerCase().includes(colour.toLowerCase())) return false;
    if (minPrice && api.price < parseFloat(minPrice)) return false;
    if (maxPrice && api.price > parseFloat(maxPrice)) return false;
    if (rating && api.rating < parseFloat(rating)) return false;
    if (normalizedSearch) {
      const haystack = [
        api.title, api.description, api.brand, api.category,
        api.sub_category, api.product_type, api.colour, api.gender, api.usage,
      ].filter(Boolean).join(' ').toLowerCase();
      if (!haystack.includes(normalizedSearch)) return false;
    }
    return true;
  });

  const sortField = ['price', 'rating', 'title', 'rating_count'].includes(sort) ? sort : 'updatedAt';
  const sortKey = sortField === 'title' ? 'title' : sortField;
  filtered.sort((a, b) => {
    const va = a[sortKey];
    const vb = b[sortKey];
    let cmp = 0;
    if (typeof va === 'number' && typeof vb === 'number') cmp = va - vb;
    else cmp = String(va || '').localeCompare(String(vb || ''));
    return order.toUpperCase() === 'ASC' ? cmp : -cmp;
  });

  const total = filtered.length;
  const start = (parseInt(page) - 1) * parseInt(limit);
  const products = filtered.slice(start, start + parseInt(limit));

  return {
    products,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
    },
  };
};

const topRated = async (limit = 12) => {
  const catalog = await getCatalog();
  return catalog
    .filter((p) => p.is_active)
    .sort((a, b) => (b.rating - a.rating) || (b.rating_count - a.rating_count))
    .slice(0, limit);
};

const listByIds = async (ids) => {
  const keys = ids.map((productId) => ({ productId }));
  const items = await batchGet(table, keys);
  return items.map((it) => toAPI(it)).filter(Boolean);
};

const getCategories = async () => {
  const catalog = await getCatalog();
  const set = new Set();
  catalog.forEach((p) => { if (p.category) set.add(p.category); });
  return [...set].sort();
};

const getBrands = async () => {
  const catalog = await getCatalog();
  const set = new Set();
  catalog.forEach((p) => { if (p.brand) set.add(p.brand); });
  return [...set].sort();
};

const count = async () => {
  const catalog = await getCatalog();
  return catalog.length;
};

/** Raw catalog items (formatted) for analytics aggregations. */
const scanAllForAnalytics = async () => {
  return getCatalog();
};

/** Raw scan returning all items with full details (for RAG/search). */
const scanAllRaw = async () => {
  return scanAll({ TableName: table });
};

module.exports = { table, toAPI, findById, create, update, list, topRated, listByIds, getCategories, getBrands, count, getCatalog, invalidateCatalog, patchCatalog, scanAllForAnalytics, scanAllRaw };