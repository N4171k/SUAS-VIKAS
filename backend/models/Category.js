const { v4: uuidv4 } = require('uuid');
const { TABLES, nowISO, insert, updateRow } = require('../config/mysql');
const { selectOne, selectAll } = require('./baseMysql');

const TABLE = TABLES.Categories;

const toAPI = (item) => {
  if (!item) return null;
  return {
    id: item.category_id,
    categoryId: item.category_id,
    name: item.name,
    subCategories: parseJSON(item.sub_categories, []),
    type: item.type || 'CATEGORY',
    updatedAt: item.updated_at,
  };
};

const parseJSON = (value, fallback) => {
  if (value === null || value === undefined) return fallback;
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const findById = async (categoryId) => {
  const row = await selectOne(TABLE, { category_id: categoryId });
  return toAPI(row);
};

const findByName = async (name) => {
  const row = await selectOne(TABLE, { name });
  return toAPI(row);
};

const findAll = async () => {
  const rows = await selectAll(TABLE, { orderBy: { field: 'name', dir: 'ASC' } });
  return rows.map(toAPI).filter(Boolean);
};

const create = async ({ name, subCategories = [], type = 'CATEGORY' }) => {
  const now = nowISO();
  const row = {
    category_id: `cat_${uuidv4().replace(/-/g, '')}`,
    name,
    sub_categories: JSON.stringify(subCategories || []),
    type,
    updated_at: now,
  };
  await insert(TABLE, row);
  return toAPI(row);
};

const update = async (categoryId, updates) => {
  const data = { category_id: categoryId };
  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined) continue;
    const column = key === 'subCategories' ? 'sub_categories' : key;
    data[column] = key === 'subCategories' ? JSON.stringify(value || []) : value;
  }
  data.updated_at = nowISO();
  await updateRow(TABLE, data, ['category_id']);
  return toAPI(await selectOne(TABLE, { category_id: categoryId }));
};

module.exports = { toAPI, findById, findByName, findAll, create, update };