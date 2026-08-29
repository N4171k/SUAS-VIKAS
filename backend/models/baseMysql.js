const { select, esc } = require('../config/mysql');

/**
 * Shared SQL read helpers for the MySQL-backed models.
 * Writes go through config/mysql (insert/updateRow/deleteRow).
 */

/**
 * Build a `WHERE col = val AND ...` clause. Values are escaped inline.
 */
function buildWhere(where) {
  if (!where || Object.keys(where).length === 0) return '';
  const parts = Object.entries(where).map(([col, val]) => `${col} = ${esc(val)}`);
  return 'WHERE ' + parts.join(' AND ');
}

function buildOrderBy(orderBy) {
  if (!orderBy) return '';
  const dir = (orderBy.dir || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  return `ORDER BY ${orderBy.field} ${dir}`;
}

async function selectOne(table, where, orderBy) {
  const sql = `SELECT * FROM ${table} ${buildWhere(where)} ${buildOrderBy(orderBy)} LIMIT 1`;
  const rows = await select(sql);
  return rows[0] || null;
}

async function selectAll(table, { where, orderBy, limit, offset } = {}) {
  let sql = `SELECT * FROM ${table} ${buildWhere(where)} ${buildOrderBy(orderBy)}`;
  if (limit && limit > 0) sql += ` LIMIT ${Math.floor(limit)}`;
  if (offset && offset > 0) sql += ` OFFSET ${Math.floor(offset)}`;
  return select(sql);
}

async function countRows(table, where) {
  const rows = await select(`SELECT COUNT(*) AS c FROM ${table} ${buildWhere(where)}`);
  return Number((rows[0] && rows[0].c) || 0);
}

module.exports = { buildWhere, buildOrderBy, selectOne, selectAll, countRows };