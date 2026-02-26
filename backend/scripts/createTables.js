require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { sequelize, connectDB } = require('../config/db');
require('../models');

(async () => {
  try {
    await connectDB();
    await sequelize.sync({ force: true });
    console.log('All VIKAS- tables created!');

    const [tables] = await sequelize.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`
    );
    console.log('Tables created:');
    tables.forEach(t => console.log('  -', t.table_name));
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
