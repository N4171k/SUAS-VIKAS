const { v4: uuidv4 } = require('uuid');
const { TABLES, INDEXES } = require('../config/db');
const { getItem, putItem, updateItem, query, scanAll } = require('./base');

const table = TABLES.Users;

const toAPI = (item) => {
  if (!item) return null;
  return {
    id: item.userId,
    userId: item.userId,
    name: item.name,
    email: item.email,
    role: (item.role || 'customer').toLowerCase(),
    avatar: item.avatar || null,
    gender: item.gender || null,
    clothing_size: item.clothing_size || null,
    footwear_size: item.footwear_size || null,
    favourite_colors: item.favourite_colors || [],
    style_preferences: item.style_preferences || [],
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
};

const findById = async (userId) => {
  const item = await getItem(table, { userId });
  return toAPI(item);
};

const findByEmail = async (email) => {
  const { items } = await query({
    TableName: table,
    IndexName: INDEXES.emailIndex,
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: { ':email': email },
    Limit: 1,
  });
  return items.length ? toAPI(items[0]) : null;
};

const create = async ({ name, email, password_hash, role = 'customer', avatar, gender, clothing_size, footwear_size, favourite_colors, style_preferences }) => {
  const userId = uuidv4();
  const now = new Date().toISOString();
  const item = {
    userId,
    name,
    email,
    password_hash,
    role,
    avatar: avatar || null,
    gender: gender || null,
    clothing_size: clothing_size || null,
    footwear_size: footwear_size || null,
    favourite_colors: favourite_colors || [],
    style_preferences: style_preferences || [],
    createdAt: now,
    updatedAt: now,
  };
  await putItem(table, item);
  return toAPI(item);
};

const update = async (userId, updates) => {
  const item = await updateItem(table, { userId }, { ...updates, updatedAt: new Date().toISOString() });
  return toAPI(item);
};

const count = async () => {
  const items = await scanAll({ TableName: table, ProjectionExpression: 'userId' });
  return items.length;
};

module.exports = { table, findById, findByEmail, create, update, count, toAPI };