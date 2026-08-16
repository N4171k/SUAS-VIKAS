const {
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
  BatchGetCommand,
} = require('@aws-sdk/lib-dynamodb');
const { docClient } = require('../config/db');

const nowISO = () => new Date().toISOString();

async function getItem(TableName, Key) {
  const res = await docClient.send(new GetCommand({ TableName, Key }));
  return res.Item || null;
}

async function putItem(TableName, Item) {
  await docClient.send(new PutCommand({ TableName, Item }));
  return Item;
}

async function deleteItem(TableName, Key) {
  await docClient.send(new DeleteCommand({ TableName, Key }));
}

/**
 * Build an UpdateExpression from a plain updates object.
 * Supports top-level and dotted (nested) paths; skips undefined values.
 */
function buildUpdateExpression(updates) {
  const names = {};
  const values = {};
  const sets = [];
  for (const key of Object.keys(updates)) {
    const value = updates[key];
    if (value === undefined) continue;
    const attr = `#u_${key.replace(/[^a-zA-Z0-9_]/g, '_')}`;
    names[attr] = key;
    values[`:v_${key}`] = value;
    sets.push(`${attr} = :v_${key}`);
  }
  if (sets.length === 0) return null;
  return {
    UpdateExpression: `SET ${sets.join(', ')}`,
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: values,
  };
}

async function updateItem(TableName, Key, updates) {
  const expr = buildUpdateExpression(updates);
  if (!expr) return getItem(TableName, Key);
  await docClient.send(new UpdateCommand({
    TableName,
    Key,
    ...expr,
    ReturnValues: 'ALL_NEW',
  }));
  return getItem(TableName, Key);
}

async function query({ TableName, IndexName, KeyConditionExpression, ExpressionAttributeNames, ExpressionAttributeValues, Limit, ScanIndexForward, ExclusiveStartKey, FilterExpression }) {
  const res = await docClient.send(new QueryCommand({
    TableName,
    IndexName,
    KeyConditionExpression,
    ExpressionAttributeNames,
    ExpressionAttributeValues,
    Limit,
    ScanIndexForward,
    ExclusiveStartKey,
    FilterExpression,
  }));
  return { items: res.Items || [], lastKey: res.LastEvaluatedKey || null };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const THROTTLED = ['ProvisionedThroughputExceededException', 'ThrottlingException'];

/**
 * Scan a table (or index) with pagination and adaptive pacing so scans
 * complete even on low provisioned throughput (25 RCU) without tripping over
 * throttling. Use `onProgress` to report items scanned so far.
 */
async function scanAll({
  TableName,
  IndexName,
  FilterExpression,
  ExpressionAttributeNames,
  ExpressionAttributeValues,
  ProjectionExpression,
  limit = 100000,
  maxRetries = 300,
  onProgress,
} = {}) {
  const items = [];
  let ExclusiveStartKey;
  let attempts = 0;
  let lastReport = 0;
  do {
    try {
      const res = await docClient.send(new ScanCommand({
        TableName,
        IndexName,
        FilterExpression,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
        ProjectionExpression,
        ExclusiveStartKey,
        Limit: 500,
      }));
      items.push(...(res.Items || []));
      ExclusiveStartKey = res.LastEvaluatedKey;
      attempts = 0;
      if (onProgress && Date.now() - lastReport > 15000) {
        lastReport = Date.now();
        onProgress(items.length);
      }
      // Small pause so burst capacity isn't exhausted in one go
      await sleep(300);
    } catch (err) {
      if (THROTTLED.includes(err.name) && attempts < maxRetries) {
        const delay = Math.min(90000, 1000 * 2 ** Math.min(attempts, 8));
        attempts++;
        if (onProgress && Date.now() - lastReport > 30000) {
          lastReport = Date.now();
          onProgress(items.length);
        }
        console.warn(`⚠️  Scan throttled on ${TableName} — retry ${attempts}/${maxRetries} in ${(delay / 1000).toFixed(0)}s (${items.length} items so far)`);
        await sleep(delay);
        continue;
      }
      throw err;
    }
    if (items.length >= limit) break;
  } while (ExclusiveStartKey);
  return items;
}

async function batchGet(TableName, keys, limit = 100) {
  const items = [];
  for (let i = 0; i < keys.length; i += limit) {
    const chunk = keys.slice(i, i + limit);
    const res = await docClient.send(new BatchGetCommand({
      RequestItems: {
        [TableName]: { Keys: chunk },
      },
    }));
    items.push(...(res.Responses?.[TableName] || []));
  }
  return items;
}

module.exports = {
  nowISO,
  getItem,
  putItem,
  deleteItem,
  updateItem,
  query,
  scanAll,
  batchGet,
};