const { v4: uuidv4 } = require('uuid');
const { TABLES, INDEXES } = require('../config/db');
const { putItem, query } = require('./base');

const table = TABLES.AILogs;

const create = async ({ userId = 'anonymous', query, responseSnippet, latencyMs, intent }) => {
  const item = {
    logId: uuidv4(),
    userId,
    createdAt: new Date().toISOString(),
    query: query || null,
    responseSnippet: responseSnippet || null,
    latencyMs: latencyMs || null,
    intent: intent || null,
  };
  await putItem(table, item);
  return item;
};

const findByUser = async (userId) => {
  const { items } = await query({
    TableName: table,
    IndexName: INDEXES.aiLogUserIndex,
    KeyConditionExpression: 'userId = :uid',
    ExpressionAttributeValues: { ':uid': userId },
    ScanIndexForward: false,
  });
  return items;
};

module.exports = { table, create, findByUser };