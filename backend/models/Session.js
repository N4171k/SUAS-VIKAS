const crypto = require('crypto');
const { TABLES, INDEXES } = require('../config/db');
const { getItem, putItem, updateItem, query } = require('./base');

const table = TABLES.Sessions;

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const toAPI = (item) => {
  if (!item) return null;
  return {
    id: item.sessionId,
    user_id: item.userId,
    token: item.token,
    expires_at: item.expiresAt,
    ip_address: item.ipAddress || null,
    user_agent: item.userAgent || null,
    is_active: item.isActive !== undefined ? item.isActive : true,
    createdAt: item.createdAt,
  };
};

const create = async ({ userId, token, expiresAt, ipAddress, userAgent }) => {
  const sessionId = hashToken(token);
  const now = new Date().toISOString();
  const item = {
    sessionId,
    userId,
    token,
    expiresAt: expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    ipAddress: ipAddress || null,
    userAgent: userAgent || null,
    isActive: true,
    createdAt: now,
  };
  await putItem(table, item);
  return toAPI(item);
};

const findByToken = async (token) => {
  const item = await getItem(table, { sessionId: hashToken(token) });
  return toAPI(item);
};

const findActiveByUserAndToken = async (userId, token) => {
  const sessionId = hashToken(token);
  const item = await getItem(table, { sessionId });
  if (!item || item.userId !== userId || item.isActive === false) return null;
  if (item.expiresAt && new Date(item.expiresAt) < new Date()) return null;
  return toAPI(item);
};

const deactivateByUserAndToken = async (userId, token) => {
  const sessionId = hashToken(token);
  const item = await getItem(table, { sessionId });
  if (!item || item.userId !== userId) return null;
  return updateItem(table, { sessionId }, { isActive: false, updatedAt: new Date().toISOString() });
};

const findByUser = async (userId) => {
  const { items } = await query({
    TableName: table,
    IndexName: INDEXES.sessionUserIndex,
    KeyConditionExpression: 'userId = :uid',
    ExpressionAttributeValues: { ':uid': userId },
  });
  return items.map(toAPI).filter(Boolean);
};

module.exports = { table, toAPI, create, findByToken, findActiveByUserAndToken, deactivateByUserAndToken, findByUser };