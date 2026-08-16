const { v4: uuidv4 } = require('uuid');
const { TABLES } = require('../config/db');
const { getItem, putItem, updateItem, scanAll } = require('./base');

const table = TABLES.Categories;

const toAPI = (item) => {
  if (!item) return null;
  return {
    id: item.categoryId,
    categoryId: item.categoryId,
    name: item.name,
    subCategories: item.subCategories || [],
    type: item.type || 'CATEGORY',
    updatedAt: item.updatedAt,
  };
};

const findById = async (categoryId) => {
  const item = await getItem(table, { categoryId });
  return toAPI(item);
};

const findByName = async (name) => {
  const items = await scanAll({ TableName: table });
  const found = items.find((it) => (it.name || '').toLowerCase() === String(name).toLowerCase());
  return found ? toAPI(found) : null;
};

const findAll = async () => {
  const items = await scanAll({ TableName: table });
  return items.map(toAPI).filter(Boolean);
};

const create = async ({ name, subCategories = [], type = 'CATEGORY' }) => {
  const item = {
    categoryId: `cat_${uuidv4().replace(/-/g, '')}`,
    name,
    subCategories,
    type,
    updatedAt: new Date().toISOString(),
  };
  await putItem(table, item);
  return toAPI(item);
};

const update = async (categoryId, updates) => {
  const item = await updateItem(table, { categoryId }, { ...updates, updatedAt: new Date().toISOString() });
  return toAPI(item);
};

module.exports = { table, toAPI, findById, findByName, findAll, create, update };