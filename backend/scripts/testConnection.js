require('dotenv').config();
const { sequelize } = require('../config/db');

const testConnection = async () => {
  try {
    console.log('🔄 Testing database connection...');
    console.log(`   URL: ${process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@')}`);

    await sequelize.authenticate();
    console.log('✅ Connection successful!');

    const [results] = await sequelize.query('SELECT NOW() as current_time, version() as pg_version');
    console.log(`   Server Time: ${results[0].current_time}`);
    console.log(`   PostgreSQL: ${results[0].pg_version.split(' ').slice(0, 2).join(' ')}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
};

testConnection();
