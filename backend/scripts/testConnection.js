require('dotenv').config();
const { connectDB, CONVEX_URL } = require('../config/convex');

const testConnection = async () => {
  try {
    console.log('🔄 Testing Convex connection...');
    console.log(`   URL: ${CONVEX_URL}`);

    await connectDB();
    console.log('✅ Connection successful!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
};

testConnection();