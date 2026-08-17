require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { DescribeTableCommand, ListTablesCommand, UpdateTableCommand } = require('@aws-sdk/client-dynamodb');
const { client, REGION } = require('../config/db');

const TABLE_PREFIX = process.env.DYNAMODB_TABLE_PREFIX || 'vikas-dev-';
const READ_CAPACITY_UNITS = Number(process.env.DYNAMODB_READ_CAPACITY_UNITS || 25);
const WRITE_CAPACITY_UNITS = Number(process.env.DYNAMODB_WRITE_CAPACITY_UNITS || 25);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForActive = async (tableName) => {
  for (;;) {
    const res = await client.send(new DescribeTableCommand({ TableName: tableName }));
    const status = res.Table?.TableStatus;
    if (status === 'ACTIVE') return;
    if (status !== 'UPDATING' && status !== 'CREATING') {
      throw new Error(`Unexpected table status for ${tableName}: ${status || 'unknown'}`);
    }
    await sleep(5000);
  }
};

const migrateTable = async (tableName) => {
  const res = await client.send(new DescribeTableCommand({ TableName: tableName }));
  const billingMode = res.Table?.BillingModeSummary?.BillingMode || 'PROVISIONED';

  if (billingMode === 'PROVISIONED') {
    console.log(`⏭️  Already provisioned: ${tableName}`);
    return;
  }

  console.log(`🔁 Switching to provisioned: ${tableName}`);
  await client.send(new UpdateTableCommand({
    TableName: tableName,
    BillingMode: 'PROVISIONED',
    ProvisionedThroughput: {
      ReadCapacityUnits: READ_CAPACITY_UNITS,
      WriteCapacityUnits: WRITE_CAPACITY_UNITS,
    },
  }));
  await waitForActive(tableName);
  console.log(`✅ Migrated: ${tableName}`);
};

(async () => {
  try {
    if (!TABLE_PREFIX.startsWith('vikas-')) {
      throw new Error(`Refusing to touch non-vikas tables: ${TABLE_PREFIX}`);
    }

    console.log(`🔄 Region: ${REGION}`);
    console.log(`🔄 Prefix: ${TABLE_PREFIX}`);
    console.log(`🔄 Provisioned throughput: ${READ_CAPACITY_UNITS} RCU / ${WRITE_CAPACITY_UNITS} WCU`);

    const result = await client.send(new ListTablesCommand({}));
    const tables = (result.TableNames || []).filter((tableName) => tableName.startsWith(TABLE_PREFIX));

    if (tables.length === 0) {
      console.log('No matching vikas tables found.');
      process.exit(0);
    }

    for (const tableName of tables) {
      await migrateTable(tableName);
    }

    console.log('\nDone — all matching vikas tables are provisioned or already provisioned.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();