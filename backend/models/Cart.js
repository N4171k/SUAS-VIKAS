const { TABLES, nowISO, insert, updateRow, deleteRow, query, esc } = require('../config/mysql');
const { selectAll, selectOne } = require('./baseMysql');

const TABLE = TABLES.Carts;

const parseJSON = (value, fallback) => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

/**
 * Cart rows are consumed directly by routes using camelCase field names
 * (item.productId, item.quantity, item.createdAt), so expose both spellings.
 */
const normalize = (row) => {
  if (!row) return null;
  return {
    ...row,
    userId: row.user_id,
    productId: row.product_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const toAPI = (item, product = null) => {
  if (!item) return null;
  const userId = item.user_id || item.userId;
  const productId = item.product_id || item.productId;
  const snapshot = parseJSON(item.product, null);
  return {
    id: `${userId}#${productId}`,
    user_id: userId,
    product_id: productId,
    productId,
    quantity: item.quantity || 1,
    product: product ? { ...product, id: product.id || product.productId, product_id: product.id || product.productId } : snapshot || null,
    createdAt: item.created_at || item.createdAt,
    updatedAt: item.updated_at || item.updatedAt,
  };
};

const findByUser = async (userId) => {
  const rows = await selectAll(TABLE, { where: { user_id: userId }, orderBy: { field: 'created_at', dir: 'DESC' } });
  return rows.map(normalize);
};

const findOne = async (userId, productId) => {
  return normalize(await selectOne(TABLE, { user_id: userId, product_id: productId }));
};

const add = async ({ userId, productId, quantity = 1, product = null }) => {
  const now = nowISO();
  const row = {
    user_id: userId,
    product_id: productId,
    quantity,
    product: product ? JSON.stringify({
      productId: product.id || product.productId,
      title: product.title,
      price: product.price,
      image_url: product.image_url,
    }) : null,
    created_at: now,
    updated_at: now,
  };
  await insert(TABLE, row);
  return normalize(row);
};

const setQuantity = async (userId, productId, quantity) => {
  await updateRow(TABLE, { user_id: userId, product_id: productId, quantity, updated_at: nowISO() }, ['user_id', 'product_id']);
  return normalize(await selectOne(TABLE, { user_id: userId, product_id: productId }));
};

const remove = async (userId, productId) => {
  await deleteRow(TABLE, ['user_id', 'product_id'], [userId, productId]);
};

const clear = async (userId) => {
  await query(`DELETE FROM ${TABLE} WHERE user_id = ${esc(userId)}`);
};

module.exports = { toAPI, findByUser, findOne, add, setQuantity, remove, clear };