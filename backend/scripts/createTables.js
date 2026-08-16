require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
const { client, TABLES } = require('../config/db');

/**
 * Create any missing VIKAS DynamoDB tables (idempotent — existing tables are skipped).
 * All tables use PAY_PER_REQUEST billing and match the schemas already live in AWS.
 */
const TABLE_DEFINITIONS = [
  {
    name: TABLES.Users,
    keys: [{ AttributeName: 'userId', KeyType: 'HASH' }],
    attrs: [
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'email', AttributeType: 'S' },
    ],
    gsis: [{
      IndexName: 'email-index',
      KeySchema: [{ AttributeName: 'email', KeyType: 'HASH' }],
      Projection: { ProjectionType: 'ALL' },
    }],
  },
  {
    name: TABLES.Products,
    keys: [{ AttributeName: 'productId', KeyType: 'HASH' }],
    attrs: [
      { AttributeName: 'productId', AttributeType: 'S' },
      { AttributeName: 'brand', AttributeType: 'S' },
      { AttributeName: 'category', AttributeType: 'S' },
    ],
    gsis: [
      {
        IndexName: 'brand-index',
        KeySchema: [
          { AttributeName: 'brand', KeyType: 'HASH' },
          { AttributeName: 'productId', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
      {
        IndexName: 'category-index',
        KeySchema: [
          { AttributeName: 'category', KeyType: 'HASH' },
          { AttributeName: 'productId', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
    ],
  },
  {
    name: TABLES.Stores,
    keys: [{ AttributeName: 'storeId', KeyType: 'HASH' }],
    attrs: [{ AttributeName: 'storeId', AttributeType: 'S' }],
    gsis: [],
  },
  {
    name: TABLES.Carts,
    keys: [
      { AttributeName: 'userId', KeyType: 'HASH' },
      { AttributeName: 'productId', KeyType: 'RANGE' },
    ],
    attrs: [
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'productId', AttributeType: 'S' },
    ],
    gsis: [],
  },
  {
    name: TABLES.Orders,
    keys: [
      { AttributeName: 'userId', KeyType: 'HASH' },
      { AttributeName: 'orderId', KeyType: 'RANGE' },
    ],
    attrs: [
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'orderId', AttributeType: 'S' },
    ],
    gsis: [{
      IndexName: 'orderId-index',
      KeySchema: [{ AttributeName: 'orderId', KeyType: 'HASH' }],
      Projection: { ProjectionType: 'ALL' },
    }],
  },
  {
    name: TABLES.Reservations,
    keys: [{ AttributeName: 'reservationId', KeyType: 'HASH' }],
    attrs: [
      { AttributeName: 'reservationId', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'createdAt', AttributeType: 'S' },
      { AttributeName: 'storeId', AttributeType: 'S' },
      { AttributeName: 'slotTime', AttributeType: 'S' },
    ],
    gsis: [
      {
        IndexName: 'user-index',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' },
          { AttributeName: 'createdAt', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
      {
        IndexName: 'store-slot-index',
        KeySchema: [
          { AttributeName: 'storeId', KeyType: 'HASH' },
          { AttributeName: 'slotTime', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
    ],
  },
  {
    name: TABLES.Inventory,
    keys: [
      { AttributeName: 'storeId', KeyType: 'HASH' },
      { AttributeName: 'productId', KeyType: 'RANGE' },
    ],
    attrs: [
      { AttributeName: 'storeId', AttributeType: 'S' },
      { AttributeName: 'productId', AttributeType: 'S' },
    ],
    gsis: [{
      IndexName: 'product-index',
      KeySchema: [
        { AttributeName: 'productId', KeyType: 'HASH' },
        { AttributeName: 'storeId', KeyType: 'RANGE' },
      ],
      Projection: { ProjectionType: 'ALL' },
    }],
  },
  {
    name: TABLES.Sessions,
    keys: [{ AttributeName: 'sessionId', KeyType: 'HASH' }],
    attrs: [
      { AttributeName: 'sessionId', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' },
    ],
    gsis: [{
      IndexName: 'user-index',
      KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
      Projection: { ProjectionType: 'ALL' },
    }],
  },
  {
    name: TABLES.Categories,
    keys: [{ AttributeName: 'categoryId', KeyType: 'HASH' }],
    attrs: [{ AttributeName: 'categoryId', AttributeType: 'S' }],
    gsis: [],
  },
  {
    name: TABLES.AILogs,
    keys: [{ AttributeName: 'logId', KeyType: 'HASH' }],
    attrs: [
      { AttributeName: 'logId', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'createdAt', AttributeType: 'S' },
    ],
    gsis: [{
      IndexName: 'user-index',
      KeySchema: [
        { AttributeName: 'userId', KeyType: 'HASH' },
        { AttributeName: 'createdAt', KeyType: 'RANGE' },
      ],
      Projection: { ProjectionType: 'ALL' },
    }],
  },
];

const tableExists = async (name) => {
  try {
    await client.send(new DescribeTableCommand({ TableName: name }));
    return true;
  } catch (err) {
    if (err.name === 'ResourceNotFoundException') return false;
    throw err;
  }
};

(async () => {
  try {
    let created = 0;
    for (const def of TABLE_DEFINITIONS) {
      if (await tableExists(def.name)) {
        console.log(`⏭️  Skipping (exists): ${def.name}`);
        continue;
      }
      await client.send(new CreateTableCommand({
        TableName: def.name,
        KeySchema: def.keys,
        AttributeDefinitions: def.attrs,
        GlobalSecondaryIndexes: def.gsis.length ? def.gsis : undefined,
        BillingMode: 'PAY_PER_REQUEST',
      }));
      console.log(`✅ Created: ${def.name}`);
      created++;
    }
    console.log(`\nDone — ${created} tables created, rest already exist.`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();