const { v4: uuidv4 } = require('uuid');
const { TABLES, nowISO, insert, updateRow } = require('../config/mysql');
const { selectAll, selectOne, countRows } = require('./baseMysql');

const TABLE = TABLES.Orders;

const parseJSON = (value, fallback) => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const toAPI = (item) => {
  if (!item) return null;
  return {
    id: item.order_id,
    orderId: item.order_id,
    user_id: item.user_id,
    items: parseJSON(item.items, []),
    total: item.total,
    status: item.status || 'pending',
    shipping_address: parseJSON(item.shipping_address, null),
    payment_method: item.payment_method || 'cod',
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
};

const create = async ({ userId, items, total, shippingAddress, paymentMethod = 'cod', status = 'confirmed' }) => {
  const orderId = `ord_${uuidv4()}`;
  const now = nowISO();
  const row = {
    order_id: orderId,
    user_id: userId,
    items: JSON.stringify(items || []),
    total,
    status,
    shipping_address: shippingAddress ? JSON.stringify(shippingAddress) : null,
    payment_method: paymentMethod,
    created_at: now,
    updated_at: now,
  };
  await insert(TABLE, row);
  return toAPI(row);
};

const findByUser = async (userId) => {
  const rows = await selectAll(TABLE, { where: { user_id: userId }, orderBy: { field: 'created_at', dir: 'DESC' } });
  return rows.map(toAPI).filter(Boolean);
};

const findById = async (orderId) => {
  const row = await selectOne(TABLE, { order_id: orderId });
  return toAPI(row);
};

const update = async (userId, orderId, updates) => {
  const data = { order_id: orderId };
  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined) continue;
    const column = key === 'shippingAddress' ? 'shipping_address' : key;
    data[column] = (column === 'items' || column === 'shipping_address') && typeof value === 'object'
      ? JSON.stringify(value)
      : value;
  }
  data.updated_at = nowISO();
  await updateRow(TABLE, data, ['order_id']);
  return toAPI(await selectOne(TABLE, { order_id: orderId }));
};

const findAll = async () => {
  const rows = await selectAll(TABLE, { orderBy: { field: 'created_at', dir: 'DESC' } });
  return rows.map(toAPI).filter(Boolean);
};

const count = async () => countRows(TABLE);

module.exports = { toAPI, create, findByUser, findById, update, findAll, count };