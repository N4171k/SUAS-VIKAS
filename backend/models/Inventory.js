const { TABLES, nowISO, query, select, esc } = require('../config/mysql');
const { selectAll, selectOne } = require('./baseMysql');

const TABLE = TABLES.Inventory;

const toAPI = (item) => {
  if (!item) return null;
  return {
    id: `${item.store_id}#${item.product_id}`,
    store_id: item.store_id,
    product_id: item.product_id,
    quantity: item.quantity || 0,
    reserved_quantity: item.reserved || 0,
    version: item.version || 0,
    updatedAt: item.updated_at,
  };
};

const findOne = async (storeId, productId) => {
  const row = await selectOne(TABLE, { store_id: storeId, product_id: productId });
  return toAPI(row);
};

const findByProduct = async (productId) => {
  const rows = await selectAll(TABLE, { where: { product_id: productId } });
  return rows.map(toAPI).filter(Boolean);
};

const findByStore = async (storeId) => {
  const rows = await selectAll(TABLE, { where: { store_id: storeId } });
  return rows.map(toAPI).filter(Boolean);
};

const upsert = async ({ storeId, productId, quantity = 0, reserved = 0 }) => {
  const now = nowISO();
  await query(
    `INSERT INTO ${TABLE} (store_id, product_id, quantity, reserved, version, updated_at) ` +
    `VALUES (${esc(storeId)}, ${esc(productId)}, ${Number(quantity) || 0}, ${Number(reserved) || 0}, 1, ${esc(now)}) ` +
    `ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), reserved = VALUES(reserved), ` +
    `version = version + 1, updated_at = VALUES(updated_at)`
  );
  const row = await selectOne(TABLE, { store_id: storeId, product_id: productId });
  return toAPI(row);
};

const reserveStock = async (storeId, productId, quantity = 1) => {
  const now = nowISO();
  const res = await query(
    `UPDATE ${TABLE} SET reserved = reserved + ${Number(quantity) || 0}, version = version + 1, updated_at = ${esc(now)} ` +
    `WHERE store_id = ${esc(storeId)} AND product_id = ${esc(productId)} AND (quantity - reserved) >= ${Number(quantity) || 0}`
  );

  if (!res.affectedRows || res.affectedRows === 0) {
    const existing = await selectOne(TABLE, { store_id: storeId, product_id: productId });
    if (!existing) throw new Error('Inventory not found for product in store.');
    throw new Error('Not enough stock for product in store.');
  }

  const row = await selectOne(TABLE, { store_id: storeId, product_id: productId });
  return toAPI(row);
};

const releaseStock = async (storeId, productId, quantity = 1) => {
  const now = nowISO();
  await query(
    `UPDATE ${TABLE} SET reserved = GREATEST(reserved - ${Number(quantity) || 0}, 0), version = version + 1, updated_at = ${esc(now)} ` +
    `WHERE store_id = ${esc(storeId)} AND product_id = ${esc(productId)}`
  );
  const row = await selectOne(TABLE, { store_id: storeId, product_id: productId });
  return toAPI(row);
};

const fulfillStock = async (storeId, productId, quantity = 1) => {
  const now = nowISO();
  await query(
    `UPDATE ${TABLE} SET quantity = quantity - ${Number(quantity) || 0}, ` +
    `reserved = GREATEST(reserved - ${Number(quantity) || 0}, 0), version = version + 1, updated_at = ${esc(now)} ` +
    `WHERE store_id = ${esc(storeId)} AND product_id = ${esc(productId)}`
  );
  const row = await selectOne(TABLE, { store_id: storeId, product_id: productId });
  return toAPI(row);
};

const availableProductIds = async () => {
  const rows = await select(`SELECT DISTINCT product_id FROM ${TABLE} WHERE quantity - reserved > 0`);
  return rows.map((r) => r.product_id);
};

module.exports = {
  toAPI,
  findOne,
  findByProduct,
  findByStore,
  upsert,
  reserveStock,
  releaseStock,
  fulfillStock,
  availableProductIds,
};