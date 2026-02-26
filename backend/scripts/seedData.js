require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { sequelize } = require('../config/db');
const { User, Product, Store, Inventory } = require('../models');
const bcrypt = require('bcryptjs');

const sampleStores = [
  { name: 'VIKAS Flagship - Mumbai', location: 'Mumbai', address: 'Phoenix Marketcity, LBS Road, Kurla West', city: 'Mumbai', state: 'Maharashtra', pincode: '400070', latitude: 19.0860, longitude: 72.8890, phone: '+91 22 4000 1001' },
  { name: 'VIKAS Store - Delhi', location: 'Delhi', address: 'Select Citywalk, Saket', city: 'New Delhi', state: 'Delhi', pincode: '110017', latitude: 28.5283, longitude: 77.2190, phone: '+91 11 4000 1002' },
  { name: 'VIKAS Store - Bangalore', location: 'Bangalore', address: 'UB City Mall, Vittal Mallya Road', city: 'Bangalore', state: 'Karnataka', pincode: '560001', latitude: 12.9716, longitude: 77.5946, phone: '+91 80 4000 1003' },
  { name: 'VIKAS Store - Hyderabad', location: 'Hyderabad', address: 'Inorbit Mall, Hitech City', city: 'Hyderabad', state: 'Telangana', pincode: '500081', latitude: 17.4375, longitude: 78.3853, phone: '+91 40 4000 1004' },
  { name: 'VIKAS Store - Pune', location: 'Pune', address: 'Seasons Mall, Magarpatta', city: 'Pune', state: 'Maharashtra', pincode: '411028', latitude: 18.5146, longitude: 73.9260, phone: '+91 20 4000 1005' },
];

/**
 * Parse fashion.csv and return product objects
 */
const parseFashionCSV = () => {
  const csvPath = path.join(__dirname, '..', '..', 'fashion.csv');
  if (!fs.existsSync(csvPath)) {
    console.error('❌ fashion.csv not found at:', csvPath);
    process.exit(1);
  }

  const raw = fs.readFileSync(csvPath, 'utf-8');
  const lines = raw.split('\n').filter((l) => l.trim());
  const headers = lines[0].split(',').map((h) => h.trim());

  console.log(`📄 CSV columns: ${headers.join(', ')}`);

  const products = [];
  for (let i = 1; i < lines.length; i++) {
    // Handle potential commas inside values by simple split (CSV has no quoted fields)
    const vals = lines[i].split(',').map((v) => v.trim());
    if (vals.length < headers.length) continue;

    const row = {};
    headers.forEach((h, idx) => { row[h] = vals[idx] || ''; });

    // Extract brand from title (first word(s) before "Men/Women/Boys/Girls/Unisex")
    const titleParts = (row.ProductTitle || '').split(' ');
    let brand = titleParts[0] || 'Fashion';
    // Try to get multi-word brand names (e.g., "Gini and Jony")
    const genderWords = ['men', 'women', 'boys', 'girls', 'unisex', "men's", "women's"];
    for (let j = 1; j < Math.min(titleParts.length, 5); j++) {
      if (genderWords.includes(titleParts[j].toLowerCase())) break;
      brand += ' ' + titleParts[j];
    }

    // Generate a realistic price based on category
    const categoryPrices = {
      'Apparel': { min: 299, max: 4999 },
      'Footwear': { min: 499, max: 7999 },
    };
    const priceRange = categoryPrices[row.Category] || { min: 299, max: 3999 };
    const price = (Math.random() * (priceRange.max - priceRange.min) + priceRange.min).toFixed(2);
    const discount = 0.1 + Math.random() * 0.4; // 10-50% discount
    const originalPrice = (parseFloat(price) / (1 - discount)).toFixed(2);

    products.push({
      product_id: row.ProductId,
      title: row.ProductTitle || `Fashion Product ${i}`,
      description: `${row.ProductTitle}. ${row.Gender ? row.Gender + "'s" : ''} ${row.SubCategory || row.Category || 'Fashion'} in ${row.Colour || 'classic'} color. Perfect for ${row.Usage || 'casual'} wear.`,
      category: row.Category || 'Fashion',
      sub_category: row.SubCategory || null,
      product_type: row.ProductType || null,
      gender: row.Gender || null,
      colour: row.Colour || null,
      usage: row.Usage || null,
      price,
      original_price: originalPrice,
      rating: (3 + Math.random() * 2).toFixed(1),
      rating_count: Math.floor(Math.random() * 5000) + 10,
      brand: brand.trim(),
      image_url: row.ImageURL || `https://picsum.photos/seed/${row.ProductId || i}/400/400`,
      features: `${row.Colour || ''} color, ${row.Usage || 'Casual'} wear, ${row.Gender || 'Unisex'}, ${row.ProductType || row.SubCategory || 'Fashion'}`,
      is_active: true,
    });
  }

  return products;
};

const seed = async () => {
  try {
    console.log('🌱 Starting seed with fashion.csv data...');
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    console.log('✅ Database synced (tables recreated)');

    // Create admin user
    const adminHash = await bcrypt.hash('admin123', 12);
    await User.create({
      name: 'Super Admin',
      email: 'admin@vikas.com',
      password_hash: adminHash,
      role: 'super_admin',
    });

    // Create store admin
    const storeAdminHash = await bcrypt.hash('store123', 12);
    await User.create({
      name: 'Store Manager',
      email: 'store@vikas.com',
      password_hash: storeAdminHash,
      role: 'store_admin',
    });

    // Create customer
    const customerHash = await bcrypt.hash('customer123', 12);
    await User.create({
      name: 'Test Customer',
      email: 'customer@vikas.com',
      password_hash: customerHash,
      role: 'customer',
    });

    console.log('✅ Users created');

    // Create stores
    const stores = await Store.bulkCreate(sampleStores);
    console.log(`✅ ${stores.length} stores created`);

    // Parse and import fashion.csv products
    const products = parseFashionCSV();
    console.log(`📦 Parsed ${products.length} products from fashion.csv`);

    // Bulk create in batches of 500
    const batchSize = 500;
    let createdCount = 0;
    const allCreated = [];
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      const created = await Product.bulkCreate(batch);
      allCreated.push(...created);
      createdCount += created.length;
      console.log(`   ✅ Batch ${Math.floor(i / batchSize) + 1}: ${created.length} products`);
    }
    console.log(`✅ ${createdCount} total products created from fashion.csv`);

    // Create inventory (each store gets random stock for each product)
    const inventoryRecords = [];
    for (const store of stores) {
      for (const product of allCreated) {
        inventoryRecords.push({
          store_id: store.id,
          product_id: product.id,
          quantity: Math.floor(Math.random() * 50) + 5,
          reserved_quantity: 0,
        });
      }
    }

    // Bulk insert inventory in batches
    for (let i = 0; i < inventoryRecords.length; i += 2000) {
      const batch = inventoryRecords.slice(i, i + 2000);
      await Inventory.bulkCreate(batch);
    }
    console.log(`✅ ${inventoryRecords.length} inventory records created`);

    console.log('\n🎉 Seed completed successfully!');
    console.log(`📊 Total: ${createdCount} fashion products across ${stores.length} stores`);
    console.log('\n📋 Test Accounts:');
    console.log('   Admin:    admin@vikas.com / admin123');
    console.log('   Store:    store@vikas.com / store123');
    console.log('   Customer: customer@vikas.com / customer123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seed();
