const { TABLES } = require('../config/db');
const { getItem, putItem, updateItem, scanAll } = require('./base');

const table = TABLES.Stores;

const toAPI = (item) => {
  if (!item) return null;
  return {
    id: item.storeId,
    storeId: item.storeId,
    name: item.name,
    location: item.city || item.location || null,
    city: item.city || null,
    address: item.address || null,
    latitude: item.latitude,
    longitude: item.longitude,
    hours: item.hours || { open: '09:00', close: '21:00' },
    capacityPerSlot: item.capacityPerSlot || 10,
    is_active: item.is_active !== undefined ? item.is_active : true,
    updatedAt: item.updatedAt,
  };
};

const findById = async (storeId) => {
  const item = await getItem(table, { storeId });
  return toAPI(item);
};

const findAll = async () => {
  const items = await scanAll({ TableName: table });
  return items.map(toAPI).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name));
};

const create = async (data) => {
  const now = new Date().toISOString();
  const item = {
    storeId: data.storeId || data.id,
    name: data.name,
    city: data.city || data.location || null,
    address: data.address || null,
    latitude: data.latitude || null,
    longitude: data.longitude || null,
    hours: data.hours || null,
    capacityPerSlot: data.capacityPerSlot || 10,
    is_active: data.is_active !== undefined ? data.is_active : true,
    updatedAt: now,
  };
  await putItem(table, item);
  return toAPI(item);
};

const update = async (storeId, updates) => {
  const item = await updateItem(table, { storeId }, { ...updates, updatedAt: new Date().toISOString() });
  return toAPI(item);
};

module.exports = { table, findById, findAll, create, update, toAPI };