const { callMutation, callQuery } = require("../config/convex");

const nowISO = () => new Date().toISOString();

async function getItem(table, key) {
  const modelMap = {
    users: "findById",
    products: "findById",
    stores: "findById",
    inventory: "findOne",
    carts: "findOne",
    orders: "findById",
    reservations: "findById",
    sessions: "findByToken",
    categories: "findById",
  };
  
  const queryName = modelMap[table];
  if (!queryName) return null;
  
  const keyField = table === "carts" ? { userId: key.userId, productId: key.productId } : key;
  return await callQuery(`${table}:${queryName}`, keyField);
}

async function putItem(table, item) {
  return await callMutation(`${table}:create`, item);
}

async function deleteItem(table, key) {
  const item = await getItem(table, key);
  if (item && item._id) {
    return await callMutation(`${table}:delete`, { id: item._id });
  }
}

async function updateItem(table, key, updates) {
  const item = await getItem(table, key);
  if (!item) return null;
  return await callMutation(`${table}:update`, { ...key, updates });
}

async function query({ TableName, IndexName, KeyConditionExpression, ExpressionAttributeValues, Limit, ScanIndexForward }) {
  if (TableName === "orders" && KeyConditionExpression?.includes("userId")) {
    const items = await callQuery("orders:findByUser", { userId: ExpressionAttributeValues[":uid"] });
    return { items: items || [], lastKey: null };
  }
  if (TableName === "reservations" && KeyConditionExpression?.includes("userId")) {
    const items = await callQuery("reservations:findByUser", { userId: ExpressionAttributeValues[":uid"] });
    return { items: items || [], lastKey: null };
  }
  if (TableName === "reservations" && KeyConditionExpression?.includes("storeId")) {
    const items = await callQuery("reservations:findByStore", { storeId: ExpressionAttributeValues[":sid"] });
    return { items: items || [], lastKey: null };
  }
  if (TableName === "sessions" && KeyConditionExpression?.includes("userId")) {
    const items = await callQuery("sessions:findByUser", { userId: ExpressionAttributeValues[":uid"] });
    return { items: items || [], lastKey: null };
  }
  if (TableName === "carts" && KeyConditionExpression?.includes("userId")) {
    const items = await callQuery("carts:findByUser", { userId: ExpressionAttributeValues[":uid"] });
    return { items: items || [], lastKey: null };
  }
  if (TableName === "aiLogs" && KeyConditionExpression?.includes("userId")) {
    const items = await callQuery("aiLogs:findByUser", { userId: ExpressionAttributeValues[":uid"] });
    return { items: items || [], lastKey: null };
  }
  return { items: [], lastKey: null };
}

async function scanAll({ TableName, ProjectionExpression, FilterExpression, ExpressionAttributeNames, ExpressionAttributeValues, limit = 100000 }) {
  if (TableName === "products") {
    return await callQuery("products:scanAllRaw", {});
  }
  if (TableName === "orders") {
    return await callQuery("orders:findAll", {});
  }
  if (TableName === "reservations") {
    return await callQuery("reservations:findAll", {});
  }
  if (TableName === "categories") {
    return await callQuery("categories:findAll", {});
  }
  if (TableName === "inventory") {
    const items = await callQuery("inventory:availableProductIds", {});
    return items.map(pid => ({ productId: pid }));
  }
  if (TableName === "stores") {
    return await callQuery("stores:findAll", {});
  }
  if (TableName === "users") {
    return await callQuery("users:count", {}).then(count => Array(count).fill({}));
  }
  return [];
}

async function batchGet(TableName, keys) {
  if (TableName === "products") {
    const ids = keys.map(k => k.productId);
    return await callQuery("products:listByIds", { ids });
  }
  return [];
}

module.exports = {
  nowISO,
  getItem,
  putItem,
  deleteItem,
  updateItem,
  query,
  scanAll,
  batchGet,
};