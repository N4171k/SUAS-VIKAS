require('dotenv').config();
const { ListTablesCommand } = require('@aws-sdk/client-dynamodb');
const { client, REGION } = require('../config/db');

const testConnection = async () => {
  try {
    console.log('🔄 Testing DynamoDB connection...');
    console.log(`   Region: ${REGION}`);
    console.log(`   Table prefix: ${process.env.DYNAMODB_TABLE_PREFIX || 'vikas-dev-'}`);

    const res = await client.send(new ListTablesCommand({ Limit: 25 }));
    console.log('✅ Connection successful!');
    console.log(`   Tables visible: ${(res.TableNames || []).length}`);
    console.log(`   First tables: ${(res.TableNames || []).slice(0, 5).join(', ')}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
};

testConnection();