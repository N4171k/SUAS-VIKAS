const { TABLES, nowISO, insert } = require('../config/mysql');
const { selectAll } = require('./baseMysql');

const TABLE = TABLES.AILogs;

const create = async ({ userId = 'anonymous', query, responseSnippet, latencyMs, intent }) => {
  const row = {
    user_id: userId,
    query: query || null,
    response_snippet: responseSnippet || null,
    latency_ms: latencyMs || null,
    intent: intent || null,
    created_at: nowISO(),
  };
  await insert(TABLE, row);
  return row;
};

const findByUser = async (userId) => {
  const rows = await selectAll(TABLE, { where: { user_id: userId }, orderBy: { field: 'created_at', dir: 'DESC' } });
  return rows;
};

module.exports = { create, findByUser };