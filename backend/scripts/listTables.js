require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { ListTablesCommand } = require('@aws-sdk/client-dynamodb');
const { client } = require('../config/db');

(async () => {
  try {
    const result = await client.send(new ListTablesCommand({}));
    console.log('DynamoDB tables:');
    console.log(JSON.stringify(result.TableNames || [], null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();