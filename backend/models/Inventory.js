const { TABLES, INDEXES } = require('../config/db');
const { getItem, putItem, deleteItem, query, scanAll } = require('./base');

const table = TABLES.Inventory;

const toAPI = (item) => {
  if (!item) return null;
  return {
    id: `${item.storeId}#${item.productId}`,
    store_id: item.storeId,
    product_id: item.productId,
    quantity: item.quantity || 0,
    reserved_quantity: item.reserved || 0,
    version: item.version || 0,
    updatedAt: item.updatedAt,
  };
};

const findOne = async (storeId, productId) => {
  const item = await getItem(table, { storeId, productId });
  return toAPI(item);
};

const findByProduct = async (productId) => {
  const { items } = await query({
    TableName: table,
    IndexName: INDEXES.productIndex,
    KeyConditionExpression: 'productId = :pid',
    ExpressionAttributeValues: { ':pid': productId },
  });
  return items.map(toAPI).filter(Boolean);
};

const findByStore = async (storeId) => {
  const { items } = await query({
    TableName: table,
    KeyConditionExpression: 'storeId = :sid',
    ExpressionAttributeValues: { ':sid': storeId },
  });
  return items.map(toAPI).filter(Boolean);
};

const upsert = async ({ storeId, productId, quantity = 0, reserved = 0 }) => {
  const item = {
    storeId,
    productId,
    quantity,
    reserved,
    version: 0,
    updatedAt: new Date().toISOString(),
  };
  await putItem(table, item);
  invalidateAvailability();
  return toAPI(item);
};

/**
 * Atomically reserve stock: quantity - reserved must stay >= requested.
 * Uses DynamoDB conditional update so concurrent reservations cannot overbook.
 */
const reserveStock = async (storeId, productId, quantity = 1) => {
  const { UpdateCommand } = require('@aws-sdk/lib-dynamodb');
  const { docClient } = require('../config/db');
  const now = new Date().toISOString();
  try {
    await docClient.send(new UpdateCommand({
      TableName: table,
      Key: { storeId, productId },
      UpdateExpression: 'SET reserved = reserved + :q, #v = #v + :one, updatedAt = :now',
      ConditionExpression: 'attribute_exists(storeId) AND (quantity - reserved) >= :q',
      ExpressionAttributeNames: { '#v': 'version' },
      ExpressionAttributeValues: { ':q': quantity, ':one': 1, ':now': now },
      ReturnValues: 'ALL_NEW',
    }));
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      throw new Error('Not enough stock or product not found at this store.');
    }
    throw err;
  }
  invalidateAvailability();
  return findOne(storeId, productId);
};

/** Release reserved stock (cancellation / expiry). */
const releaseStock = async (storeId, productId, quantity = 1) => {
  const { UpdateCommand } = require('@aws-sdk/lib-dynamodb');
  const { docClient } = require('../config/db');
  await docClient.send(new UpdateCommand({
    TableName: table,
    Key: { storeId, productId },
    UpdateExpression: 'SET reserved = reserved - :q, updatedAt = :now',
    ExpressionAttributeValues: { ':q': quantity, ':now': new Date().toISOString() },
    ReturnValues: 'ALL_NEW',
  })).catch(() => {});
  invalidateAvailability();
  return findOne(storeId, productId);
};

/** Fulfill stock on pickup: decrement quantity and reserved. */
const fulfillStock = async (storeId, productId, quantity = 1) => {
  const { UpdateCommand } = require('@aws-sdk/lib-dynamodb');
  const { docClient } = require('../config/db');
  await docClient.send(new UpdateCommand({
    TableName: table,
    Key: { storeId, productId },
    UpdateExpression: 'SET quantity = quantity - :q, reserved = reserved - :q, updatedAt = :now',
    ExpressionAttributeValues: { ':q': quantity, ':now': new Date().toISOString() },
    ReturnValues: 'ALL_NEW',
  })).catch(() => {});
  invalidateAvailability();
  return findOne(storeId, productId);
};

/** Product ids that have available stock somewhere (cached 5 min — scanned on demand). */
const AVAILABILITY_TTL_MS = 5 * 60 * 1000;
let _availableIds = null;
let _availableAt = 0;

const availableProductIds = async () => {
  if (_availableIds && Date.now() - _availableAt < AVAILABILITY_TTL_MS) {
    return _availableIds;
  }
  const items = await scanAll({ TableName: table, ProjectionExpression: 'storeId, productId, quantity, reserved' });
  const set = new Set();
  items.forEach((it) => {
    if ((it.quantity || 0) - (it.reserved || 0) > 0) set.add(it.productId);
  });
  _availableIds = [...set];
  _availableAt = Date.now();
  return _availableIds;
};

const invalidateAvailability = () => {
  _availableIds = null;
  _availableAt = 0;
};

module.exports = {
  table,
  toAPI,
  findOne,
  findByProduct,
  findByStore,
  upsert,
  reserveStock,
  releaseStock,
  fulfillStock,
  availableProductIds,
  invalidateAvailability,
};