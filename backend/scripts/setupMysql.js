/**
 * MySQL setup — creates all VIKAS_* tables on naitkcodb via the PHP API
 * and seeds sample stores + inventory so reservations work out of the box.
 *
 *   node scripts/setupMysql.js
 *
 * Idempotent: CREATE TABLE IF NOT EXISTS, inserts are skipped when tables
 * already have rows.
 */
const mysql = require('../config/mysql');

const DDL = [
  `CREATE TABLE IF NOT EXISTS VIKAS_users (
    id VARCHAR(64) NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'customer',
    avatar VARCHAR(500) NULL,
    gender VARCHAR(20) NULL,
    clothing_size VARCHAR(10) NULL,
    footwear_size VARCHAR(10) NULL,
    favourite_colors TEXT NULL,
    style_preferences TEXT NULL,
    created_at VARCHAR(40) NULL,
    updated_at VARCHAR(40) NULL,
    UNIQUE KEY uq_users_email (email)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS VIKAS_stores (
    store_id VARCHAR(64) NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NULL,
    city VARCHAR(255) NULL,
    address TEXT NULL,
    latitude DECIMAL(10,7) NULL,
    longitude DECIMAL(10,7) NULL,
    hours TEXT NULL,
    capacity_per_slot INT NOT NULL DEFAULT 10,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at VARCHAR(40) NULL,
    updated_at VARCHAR(40) NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS VIKAS_carts (
    user_id VARCHAR(64) NOT NULL,
    product_id VARCHAR(64) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    product TEXT NULL,
    created_at VARCHAR(40) NULL,
    updated_at VARCHAR(40) NULL,
    PRIMARY KEY (user_id, product_id),
    KEY idx_carts_user_id (user_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS VIKAS_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    items TEXT NULL,
    total VARCHAR(20) NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    shipping_address TEXT NULL,
    payment_method VARCHAR(32) NOT NULL DEFAULT 'cod',
    created_at VARCHAR(40) NULL,
    updated_at VARCHAR(40) NULL,
    UNIQUE KEY uq_orders_order_id (order_id),
    KEY idx_orders_user_id (user_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS VIKAS_reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reservation_id VARCHAR(64) NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    product_id VARCHAR(64) NOT NULL,
    store_id VARCHAR(64) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    slot VARCHAR(64) NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    qr_token LONGTEXT NULL,
    price VARCHAR(20) NULL,
    product_image VARCHAR(1000) NULL,
    product_name VARCHAR(500) NULL,
    expires_at VARCHAR(40) NULL,
    created_at VARCHAR(40) NULL,
    updated_at VARCHAR(40) NULL,
    UNIQUE KEY uq_reservations_res_id (reservation_id),
    KEY idx_reservations_user_id (user_id),
    KEY idx_reservations_store_id (store_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS VIKAS_inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    store_id VARCHAR(64) NOT NULL,
    product_id VARCHAR(64) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    reserved INT NOT NULL DEFAULT 0,
    version INT NOT NULL DEFAULT 1,
    updated_at VARCHAR(40) NULL,
    UNIQUE KEY uq_inventory_store_product (store_id, product_id),
    KEY idx_inventory_product_id (product_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS VIKAS_sessions (
    session_id VARCHAR(64) NOT NULL PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    token TEXT NULL,
    expires_at VARCHAR(40) NULL,
    ip_address VARCHAR(64) NULL,
    user_agent TEXT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at VARCHAR(40) NULL,
    KEY idx_sessions_user_id (user_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS VIKAS_categories (
    category_id VARCHAR(64) NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sub_categories TEXT NULL,
    type VARCHAR(32) NOT NULL DEFAULT 'CATEGORY',
    updated_at VARCHAR(40) NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS VIKAS_ai_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL DEFAULT 'anonymous',
    query TEXT NULL,
    response_snippet TEXT NULL,
    latency_ms INT NULL,
    intent VARCHAR(64) NULL,
    created_at VARCHAR(40) NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
];

const DEFAULT_STORES = [
  { store_id: 'store_mumbai', name: 'VIKAS Flagship - Mumbai', location: 'Mumbai', city: 'Mumbai', address: 'Phoenix Marketcity, LBS Road, Kurla West', latitude: 19.086, longitude: 72.889 },
  { store_id: 'store_delhi', name: 'VIKAS Store - Delhi', location: 'Delhi', city: 'New Delhi', address: 'Select Citywalk, Saket', latitude: 28.5283, longitude: 77.219 },
  { store_id: 'store_bangalore', name: 'VIKAS Store - Bangalore', location: 'Bangalore', city: 'Bangalore', address: 'UB City Mall, Vittal Mallya Road', latitude: 12.9716, longitude: 77.5946 },
  { store_id: 'store_hyderabad', name: 'VIKAS Store - Hyderabad', location: 'Hyderabad', city: 'Hyderabad', address: 'Inorbit Mall, Hitech City', latitude: 17.4375, longitude: 78.3853 },
  { store_id: 'store_pune', name: 'VIKAS Store - Pune', location: 'Pune', city: 'Pune', address: 'Seasons Mall, Magarpatta', latitude: 18.5146, longitude: 73.926 },
];

async function count(tableName) {
  const res = await mysql.query(`SELECT COUNT(*) AS c FROM ${tableName}`);
  return Number((res.rows && res.rows[0] && res.rows[0].c) || 0);
}

async function seedStores() {
  const c = await count('VIKAS_stores');
  if (c > 0) {
    console.log(`- VIKAS_stores already has ${c} rows, skipping seed`);
    return;
  }
  const now = new Date().toISOString();
  for (const store of DEFAULT_STORES) {
    await mysql.insert('VIKAS_stores', {
      store_id: store.store_id,
      name: store.name,
      location: store.location,
      city: store.city,
      address: store.address,
      latitude: store.latitude,
      longitude: store.longitude,
      hours: JSON.stringify({ open: '09:00', close: '21:00' }),
      capacity_per_slot: 10,
      is_active: 1,
      created_at: now,
      updated_at: now,
    });
  }
  console.log(`- Seeded ${DEFAULT_STORES.length} stores`);
}

async function seedInventory() {
  const c = await count('VIKAS_inventory');
  if (c > 0) {
    console.log(`- VIKAS_inventory already has ${c} rows, skipping seed`);
    return;
  }
  const Product = require('../models/Product');
  const top = await Product.topRated(30);
  const stores = await count('VIKAS_stores');
  if (stores === 0) return;
  const storeRows = await mysql.select('SELECT store_id FROM VIKAS_stores');

  const now = new Date().toISOString();
  for (const product of top) {
    for (const store of storeRows) {
      await mysql.insert('VIKAS_inventory', {
        store_id: store.store_id,
        product_id: product.id,
        quantity: 25,
        reserved: 0,
        version: 1,
        updated_at: now,
      });
    }
  }
  console.log(`- Seeded inventory for ${top.length} products across ${storeRows.length} stores`);
}

async function main() {
  console.log(`Setting up VIKAS tables on MySQL via ${mysql.BASE_URL}`);

  for (const ddl of DDL) {
    await mysql.query(ddl);
    const match = ddl.match(/CREATE TABLE IF NOT EXISTS (\w+)/);
    console.log(`- ensured ${match ? match[1] : 'table'}`);
  }

  await seedStores();
  await seedInventory();

  console.log('✅ MySQL setup complete');
}

main().catch((err) => {
  console.error('❌ Setup failed:', err.message);
  process.exit(1);
});