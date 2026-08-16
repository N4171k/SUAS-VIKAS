const { v4: uuidv4 } = require('uuid');
const { TABLES, INDEXES } = require('../config/db');
const { getItem, putItem, updateItem, query, scanAll } = require('./base');

const table = TABLES.Reservations;

const toAPI = (item) => {
  if (!item) return null;
  return {
    id: item.reservationId,
    reservationId: item.reservationId,
    user_id: item.userId,
    product_id: item.productId,
    store_id: item.storeId,
    quantity: item.quantity || 1,
    slot: item.slotTime || item.slot || null,
    status: (item.status || 'pending').toLowerCase(),
    qr_code: item.qrToken || null,
    price: item.price,
    productImage: item.productImage,
    productName: item.productName,
    expires_at: item.expiresAt || null,
    createdAt: item.createdAt,
  };
};

const create = async ({ userId, productId, storeId, quantity, slot, status = 'pending', price, productImage, productName, expiresAt }) => {
  const reservationId = `res_${uuidv4()}`;
  const now = new Date().toISOString();
  const item = {
    reservationId,
    userId,
    productId,
    storeId,
    quantity,
    slotTime: slot,
    status,
    price: price || null,
    productImage: productImage || null,
    productName: productName || null,
    expiresAt: expiresAt || null,
    createdAt: now,
  };
  await putItem(table, item);
  return toAPI(item);
};

const findById = async (reservationId) => {
  const item = await getItem(table, { reservationId });
  return toAPI(item);
};

const findByUser = async (userId) => {
  const { items } = await query({
    TableName: table,
    IndexName: INDEXES.reservationUserIndex,
    KeyConditionExpression: 'userId = :uid',
    ExpressionAttributeValues: { ':uid': userId },
    ScanIndexForward: false,
  });
  return items.map(toAPI).filter(Boolean);
};

const findByStore = async (storeId) => {
  const { items } = await query({
    TableName: table,
    IndexName: INDEXES.reservationStoreSlotIndex,
    KeyConditionExpression: 'storeId = :sid',
    ExpressionAttributeValues: { ':sid': storeId },
    ScanIndexForward: false,
  });
  return items.map(toAPI).filter(Boolean);
};

const update = async (reservationId, updates) => {
  const item = await updateItem(table, { reservationId }, { ...updates, updatedAt: new Date().toISOString() });
  return toAPI(item);
};

const findAll = async () => {
  const items = await scanAll({ TableName: table });
  return items.map(toAPI).filter(Boolean);
};

const count = async () => {
  const items = await scanAll({ TableName: table, ProjectionExpression: 'reservationId' });
  return items.length;
};

module.exports = { table, toAPI, create, findById, findByUser, findByStore, update, findAll, count };