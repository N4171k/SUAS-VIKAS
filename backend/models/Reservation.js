const { v4: uuidv4 } = require('uuid');
const { TABLES, nowISO, insert, updateRow } = require('../config/mysql');
const { selectAll, selectOne, countRows } = require('./baseMysql');

const TABLE = TABLES.Reservations;

const toAPI = (item) => {
  if (!item) return null;
  return {
    id: item.reservation_id,
    reservationId: item.reservation_id,
    user_id: item.user_id,
    product_id: item.product_id,
    store_id: item.store_id,
    quantity: item.quantity || 1,
    slot: item.slot || null,
    status: (item.status || 'pending').toLowerCase(),
    qr_code: item.qr_token || null,
    price: item.price,
    productImage: item.product_image,
    productName: item.product_name,
    expires_at: item.expires_at || null,
    createdAt: item.created_at,
  };
};

const create = async ({ userId, productId, storeId, quantity, slot, status = 'pending', price, productImage, productName, expiresAt }) => {
  const reservationId = `res_${uuidv4()}`;
  const now = nowISO();
  const row = {
    reservation_id: reservationId,
    user_id: userId,
    product_id: productId,
    store_id: storeId,
    quantity: quantity || 1,
    slot: slot || null,
    status,
    price: price ?? null,
    product_image: productImage || null,
    product_name: productName || null,
    expires_at: expiresAt || null,
    created_at: now,
  };
  await insert(TABLE, row);
  return toAPI(row);
};

const findById = async (reservationId) => {
  const row = await selectOne(TABLE, { reservation_id: reservationId });
  return toAPI(row);
};

const findByUser = async (userId) => {
  const rows = await selectAll(TABLE, { where: { user_id: userId }, orderBy: { field: 'created_at', dir: 'DESC' } });
  return rows.map(toAPI).filter(Boolean);
};

const findByStore = async (storeId) => {
  const rows = await selectAll(TABLE, { where: { store_id: storeId }, orderBy: { field: 'created_at', dir: 'DESC' } });
  return rows.map(toAPI).filter(Boolean);
};

const update = async (reservationId, updates) => {
  const data = { reservation_id: reservationId };
  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined) continue;
    const column = key === 'qrToken' ? 'qr_token' : (key === 'productImage' ? 'product_image' : key === 'productName' ? 'product_name' : key === 'expiresAt' ? 'expires_at' : key);
    data[column] = value;
  }
  data.updated_at = nowISO();
  await updateRow(TABLE, data, ['reservation_id']);
  return toAPI(await selectOne(TABLE, { reservation_id: reservationId }));
};

const findAll = async () => {
  const rows = await selectAll(TABLE, { orderBy: { field: 'created_at', dir: 'DESC' } });
  return rows.map(toAPI).filter(Boolean);
};

const count = async () => countRows(TABLE);

module.exports = { toAPI, create, findById, findByUser, findByStore, update, findAll, count };