const { TABLES, nowISO, insert, updateRow } = require('../config/mysql');
const { selectOne, selectAll } = require('./baseMysql');

const TABLE = TABLES.Sessions;

const hashToken = (token) => {
  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    const char = token.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(64, '0');
};

const toAPI = (item) => {
  if (!item) return null;
  return {
    id: item.session_id,
    user_id: item.user_id,
    token: item.token,
    expires_at: item.expires_at,
    ip_address: item.ip_address || null,
    user_agent: item.user_agent || null,
    is_active: item.is_active !== null && item.is_active !== undefined ? !!Number(item.is_active) : true,
    createdAt: item.created_at,
  };
};

const create = async ({ userId, token, expiresAt, ipAddress, userAgent }) => {
  const sessionId = hashToken(token);
  const now = nowISO();
  const row = {
    session_id: sessionId,
    user_id: userId,
    token,
    expires_at: expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    ip_address: ipAddress || null,
    user_agent: userAgent || null,
    is_active: 1,
    created_at: now,
  };
  await insert(TABLE, row);
  return toAPI(row);
};

const findByToken = async (token) => {
  const row = await selectOne(TABLE, { session_id: hashToken(token) });
  return toAPI(row);
};

const findActiveByUserAndToken = async (userId, token) => {
  const now = nowISO();
  const rows = await selectAll(TABLE, {
    where: { user_id: userId, session_id: hashToken(token), is_active: 1 },
    orderBy: { field: 'created_at', dir: 'DESC' },
    limit: 1,
  });
  const row = rows[0] || null;
  if (!row) return null;
  if (row.expires_at && String(row.expires_at) < now) return null;
  return toAPI(row);
};

const deactivateByUserAndToken = async (userId, token) => {
  const sessionId = hashToken(token);
  await updateRow(TABLE, { session_id: sessionId, user_id: userId, is_active: 0 }, ['session_id']);
  const row = await selectOne(TABLE, { session_id: sessionId });
  return toAPI(row);
};

const findByUser = async (userId) => {
  const rows = await selectAll(TABLE, { where: { user_id: userId }, orderBy: { field: 'created_at', dir: 'DESC' } });
  return rows.map(toAPI).filter(Boolean);
};

module.exports = { toAPI, create, findByToken, findActiveByUserAndToken, deactivateByUserAndToken, findByUser };