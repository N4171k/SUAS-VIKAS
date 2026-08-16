const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const REGION = process.env.AWS_REGION || 'ap-south-1';
const PREFIX = process.env.DYNAMODB_TABLE_PREFIX || 'vikas-dev-';

const client = new DynamoDBClient({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

// Resolve table names with the shared prefix
const TABLES = {
  Users: `${PREFIX}Users`,
  Products: `${PREFIX}Products`,
  Stores: `${PREFIX}Stores`,
  Carts: `${PREFIX}Carts`,
  Orders: `${PREFIX}Orders`,
  Reservations: `${PREFIX}Reservations`,
  Inventory: `${PREFIX}Inventory`,
  Sessions: `${PREFIX}Sessions`,
  Categories: `${PREFIX}Categories`,
  AILogs: `${PREFIX}AILogs`,
};

// Index name → logical alias used across the app
const INDEXES = {
  emailIndex: 'email-index',
  brandIndex: 'brand-index',
  categoryIndex: 'category-index',
  productIndex: 'product-index',
  orderIdIndex: 'orderId-index',
  reservationUserIndex: 'user-index',
  reservationStoreSlotIndex: 'store-slot-index',
  sessionUserIndex: 'user-index',
  aiLogUserIndex: 'user-index',
};

const connectDB = async () => {
  try {
    await client.send(new (require('@aws-sdk/client-dynamodb').ListTablesCommand)({ Limit: 5 }));
    console.log(`✅ DynamoDB connected (${REGION})`);
  } catch (error) {
    console.error('❌ DynamoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { client, docClient, connectDB, TABLES, INDEXES, REGION };