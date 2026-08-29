const { v4: uuidv4 } = require('uuid');
const { TABLES, nowISO, insert, updateRow } = require('../config/mysql');
const { selectOne, selectAll, countRows } = require('./baseMysql');

const TABLE = TABLES.Users;

const toAPI = (item) => {
  if (!item) return null;
  return {
    id: item.id,
    userId: item.id,
    name: item.name,
    email: item.email,
    role: (item.role || 'customer').toLowerCase(),
    avatar: item.avatar || null,
    gender: item.gender || null,
    clothing_size: item.clothing_size || null,
    footwear_size: item.footwear_size || null,
    favourite_colors: parseJSON(item.favourite_colors, []),
    style_preferences: parseJSON(item.style_preferences, []),
    createdAt: item.created_at,
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

const rowToColumns = (item) => ({
  id: item.id,
  name: item.name,
  email: item.email,
  password_hash: item.password_hash,
  role: item.role || 'customer',
  avatar: item.avatar ?? null,
  gender: item.gender ?? null,
  clothing_size: item.clothing_size ?? null,
  footwear_size: item.footwear_size ?? null,
  favourite_colors: item.favourite_colors !== undefined ? JSON.stringify(item.favourite_colors || []) : null,
  style_preferences: item.style_preferences !== undefined ? JSON.stringify(item.style_preferences || []) : null,
  created_at: item.created_at || nowISO(),
  updated_at: item.updated_at || nowISO(),
});

const findById = async (userId) => {
  const row = await selectOne(TABLE, { id: userId });
  return toAPI(row);
};

const findByEmail = async (email) => {
  const row = await selectOne(TABLE, { email });
  return toAPI(row);
};

const findByEmailRaw = async (email) => {
  return selectOne(TABLE, { email });
};

const create = async ({ name, email, password_hash, role = 'customer', avatar, gender, clothing_size, footwear_size, favourite_colors, style_preferences }) => {
  const now = nowISO();
  const row = rowToColumns({
    id: uuidv4(),
    name,
    email,
    password_hash,
    role,
    avatar,
    gender,
    clothing_size,
    footwear_size,
    favourite_colors,
    style_preferences,
    created_at: now,
    updated_at: now,
  });
  await insert(TABLE, row);
  return toAPI(row);
};

const update = async (userId, updates) => {
  const existing = await selectOne(TABLE, { id: userId });
  if (!existing) return null;

  const data = { id: userId };
  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined) continue;
    if (key === 'favourite_colors' || key === 'style_preferences') {
      data[key] = JSON.stringify(value || []);
    } else if (key === 'clothing_size' || key === 'footwear_size' || key === 'gender' || key === 'avatar' || key === 'name' || key === 'email' || key === 'password_hash' || key === 'role') {
      data[key] = value;
    }
  }
  data.updated_at = nowISO();

  await updateRow(TABLE, data, ['id']);
  return toAPI(await selectOne(TABLE, { id: userId }));
};

const count = async () => countRows(TABLE);

module.exports = { toAPI, findById, findByEmail, findByEmailRaw, create, update, count };