const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

/**
 * MySQL API client — talks to the OVH-hosted PHP API at https://naitk.com/api/
 * which is the only way to reach the naitkcodb MySQL database (OVH blocks
 * direct external DB connections).
 *
 * OVH strips the standard Authorization header, so every request sends the
 * custom X-API-Token header instead.
 */

const BASE_URL = (process.env.MYSQL_API_URL || 'https://naitk.com/api/').replace(/\/+$/, '/');
const TOKEN = process.env.MYSQL_API_TOKEN || '5kUc5rQ+ASWV0h8F8iIfbmH5SIIkV3YD';

// Every app table carries the VIKAS_ prefix.
const PREFIX = 'VIKAS_';
const TABLES = {
  Users: `${PREFIX}users`,
  Stores: `${PREFIX}stores`,
  Carts: `${PREFIX}carts`,
  Orders: `${PREFIX}orders`,
  Reservations: `${PREFIX}reservations`,
  Inventory: `${PREFIX}inventory`,
  Sessions: `${PREFIX}sessions`,
  Categories: `${PREFIX}categories`,
  AILogs: `${PREFIX}ai_logs`,
};

const nowISO = () => new Date().toISOString();

/**
 * Low-level HTTP call to the PHP API.
 */
async function request(path, { method = 'GET', body } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);

  let res;
  try {
    res = await fetch(BASE_URL + path, {
      method,
      headers: {
        'X-API-Token': TOKEN,
        'Content-Type': 'application/json',
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    const e = new Error(`MySQL API unreachable (${path}): ${err.message}`);
    e.statusCode = 502;
    throw e;
  }
  clearTimeout(timer);

  let json;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok || (json && json.success === false)) {
    const message = (json && json.message) || `MySQL API error ${res.status} on ${path}`;
    const e = new Error(message);
    e.statusCode = res.status;
    e.api = json || {};
    throw e;
  }

  return json;
}

/**
 * Escape a value for inline use inside a SQL string we build ourselves.
 * Prefer the insert/update endpoints (which escape server-side) for writes.
 */
function esc(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL';
  if (typeof value === 'boolean') return value ? '1' : '0';
  if (typeof value === 'object') return esc(JSON.stringify(value));
  return "'" + String(value)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\0/g, '\\0')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r') + "'";
}

/**
 * Run arbitrary SQL via POST /api/query/execute.
 * Returns the full API response ({ rows, columns, rowCount, affectedRows, ... }).
 */
async function query(sql) {
  return request('query/execute', { method: 'POST', body: { query: sql } });
}

/**
 * Run a SELECT and return just the rows (array of objects).
 */
async function select(sql) {
  const res = await query(sql);
  return res.rows || [];
}

/**
 * List data for one table via POST /api/schema/table-data.
 */
async function tableData(tableName, { page = 1, pageSize = 200, sortField, sortOrder = 'ASC' } = {}) {
  const body = { tableName, page, pageSize, sortOrder };
  if (sortField) body.sortField = sortField;
  return request('schema/table-data', { method: 'POST', body });
}

/**
 * Insert a row via POST /api/data/insert.
 * Returns insertId (0 when the table has a non-auto-increment PK).
 */
async function insert(tableName, data) {
  const res = await request('data/insert', { method: 'POST', body: { tableName, data } });
  return res.insertId;
}

/**
 * Update a row by primary key(s) via POST /api/data/update.
 * data must include the PK column values.
 */
async function updateRow(tableName, data, primaryKeys) {
  return request('data/update', { method: 'POST', body: { tableName, data, primaryKeys } });
}

/**
 * Delete a row by primary key(s) via POST /api/data/delete.
 */
async function deleteRow(tableName, primaryKeys, values) {
  return request('data/delete', { method: 'POST', body: { tableName, primaryKeys, values } });
}

async function connectDB() {
  const res = await request('connections/test');
  console.log(`✅ MySQL connected via ${BASE_URL} (${res.message || 'OK'})`);
  return res;
}

module.exports = {
  BASE_URL,
  TOKEN,
  PREFIX,
  TABLES,
  nowISO,
  request,
  esc,
  query,
  select,
  tableData,
  insert,
  updateRow,
  deleteRow,
  connectDB,
};