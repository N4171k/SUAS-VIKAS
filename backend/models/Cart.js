const { TABLES } = require('../config/db');
const { getItem, putItem, deleteItem, updateItem, query } = require('./base');

const table = TABLES.Carts;

const toAPI = (item, product = null) => {
  if (!item) return null;
  return {
    id: `${item.userId}#${item.productId}`,
    user_id: item.userId,
    product_id: item.productId,
    quantity: item.quantity || 1,
    product: product ? { ...product, id: product.id || product.productId, product_id: product.id || product.productId } : item.product || null,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
};

const findByUser = async (userId) => {
  const { items } = await query({
    TableName: table,
    KeyConditionExpression: 'userId = :uid',
    ExpressionAttributeValues: { ':uid': userId },
  });
  return items;
};

const findOne = async (userId, productId) => {
  const item = await getItem(table, { userId, productId });
  return item;
};

const add = async ({ userId, productId, quantity = 1, product = null }) => {
  const now = new Date().toISOString();
  const item = {
    userId,
    productId,
    quantity,
    product: product ? {
      productId: product.id || product.productId,
      title: product.title,
      price: product.price,
      image_url: product.image_url,
    } : null,
    createdAt: now,
    updatedAt: now,
  };
  await putItem(table, item);
  return item;
};

const setQuantity = async (userId, productId, quantity) => {
  return updateItem(table, { userId, productId }, { quantity, updatedAt: new Date().toISOString() });
};

const remove = async (userId, productId) => {
  await deleteItem(table, { userId, productId });
};

const clear = async (userId) => {
  const { items } = await query({
    TableName: table,
    KeyConditionExpression: 'userId = :uid',
    ExpressionAttributeValues: { ':uid': userId },
  });
  for (const item of items) {
    await deleteItem(table, { userId, productId: item.productId });
  }
};

module.exports = { table, toAPI, findByUser, findOne, add, setQuantity, remove, clear };