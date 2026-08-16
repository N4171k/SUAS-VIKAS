const { v4: uuidv4 } = require('uuid');
const { TABLES, INDEXES } = require('../config/db');
const { getItem, putItem, updateItem, query, scanAll } = require('./base');

const table = TABLES.Orders;

const toAPI = (item) => {
  if (!item) return null;
  return {
    id: item.orderId,
    orderId: item.orderId,
    user_id: item.userId,
    items: item.items || [],
    total: item.total,
    status: item.status || 'pending',
    shipping_address: item.shippingAddress || null,
    payment_method: item.paymentMethod || 'cod',
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
};

const create = async ({ userId, items, total, shippingAddress, paymentMethod = 'cod', status = 'confirmed' }) => {
  const orderId = `ord_${uuidv4()}`;
  const now = new Date().toISOString();
  const item = {
    userId,
    orderId,
    items,
    total,
    status,
    shippingAddress: shippingAddress || null,
    paymentMethod,
    createdAt: now,
    updatedAt: now,
  };
  await putItem(table, item);
  return toAPI(item);
};

const findByUser = async (userId) => {
  const { items } = await query({
    TableName: table,
    KeyConditionExpression: 'userId = :uid',
    ExpressionAttributeValues: { ':uid': userId },
    ScanIndexForward: false,
  });
  return items.map(toAPI).filter(Boolean);
};

const findById = async (orderId) => {
  const { items } = await query({
    TableName: table,
    IndexName: INDEXES.orderIdIndex,
    KeyConditionExpression: 'orderId = :oid',
    ExpressionAttributeValues: { ':oid': orderId },
    Limit: 1,
  });
  return items.length ? toAPI(items[0]) : null;
};

const update = async (userId, orderId, updates) => {
  const item = await updateItem(table, { userId, orderId }, { ...updates, updatedAt: new Date().toISOString() });
  return toAPI(item);
};

const findAll = async () => {
  const items = await scanAll({ TableName: table });
  return items.map(toAPI).filter(Boolean);
};

const count = async () => {
  const items = await scanAll({ TableName: table, ProjectionExpression: 'orderId' });
  return items.length;
};

module.exports = { table, toAPI, create, findByUser, findById, update, findAll, count };