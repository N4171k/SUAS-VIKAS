require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const { User, Product, Store, Inventory } = require('../models');
const bcrypt = require('bcryptjs');

const sampleStores = [
  { storeId: 'store-01', name: 'VIKAS Flagship - Mumbai', city: 'Mumbai', address: 'Phoenix Marketcity, LBS Road, Kurla West', latitude: 19.0860, longitude: 72.8890 },
  { storeId: 'store-02', name: 'VIKAS Store - Delhi', city: 'New Delhi', address: 'Select Citywalk, Saket', latitude: 28.5283, longitude: 77.2190 },
  { storeId: 'store-03', name: 'VIKAS Store - Bangalore', city: 'Bangalore', address: 'UB City Mall, Vittal Mallya Road', latitude: 12.9716, longitude: 77.5946 },
  { storeId: 'store-04', name: 'VIKAS Store - Hyderabad', city: 'Hyderabad', address: 'Inorbit Mall, Hitech City', latitude: 17.4375, longitude: 78.3853 },
  { storeId: 'store-05', name: 'VIKAS Store - Pune', city: 'Pune', address: 'Seasons Mall, Magarpatta', latitude: 18.5146, longitude: 73.9260 },
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
    const vals = lines[i].split(',').map((v) => v.trim());
    if (vals.length < headers.length) continue;

    const row = {};
    headers.forEach((h, idx) => { row[h] = vals[idx] || ''; });

    const titleParts = (row.ProductTitle || '').split(' ');
    let brand = titleParts[0] || 'Fashion';
    const genderWords = ['men', 'women', 'boys', 'girls', 'unisex', "men's", "women's"];
    for (let j = 1; j < Math.min(titleParts.length, 5); j++) {
      if (genderWords.includes(titleParts[j].toLowerCase())) break;
      brand += ' ' + titleParts[j];
    }

    const categoryPrices = {
      'Apparel': { min: 299, max: 4999 },
      'Footwear': { min: 499, max: 7999 },
    };
    const priceRange = categoryPrices[row.Category] || { min: 299, max: 3999 };
    const price = (Math.random() * (priceRange.max - priceRange.min) + priceRange.min).toFixed(2);
    const discount = 0.1 + Math.random() * 0.4;
    const originalPrice = (parseFloat(price) / (1 - discount)).toFixed(2);

    products.push({
      productId: row.ProductId || `csv_${i}`,
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
    console.log('🌱 Starting DynamoDB seed...');

    // Create admin user
    const adminHash = await bcrypt.hash('admin123', 12);
    const admin = await User.create({ name: 'Super Admin', email: 'admin@vikas.com', password_hash: adminHash, role: 'super_admin' });
    console.log('✅ Admin user:', admin.id);

    const storeAdminHash = await bcrypt.hash('store123', 12);
    const storeAdmin = await User.create({ name: 'Store Manager', email: 'store@vikas.com', password_hash: storeAdminHash, role: 'store_admin' });
    console.log('✅ Store admin user:', storeAdmin.id);

    const customerHash = await bcrypt.hash('customer123', 12);
    const customer = await User.create({ name: 'Test Customer', email: 'customer@vikas.com', password_hash: customerHash, role: 'customer' });
    console.log('✅ Customer user:', customer.id);

    // Create stores
    for (const store of sampleStores) {
      await Store.create(store);
    }
    console.log(`✅ ${sampleStores.length} stores created`);

    // Parse and import fashion.csv products
    const products = parseFashionCSV();
    console.log(`📦 Parsed ${products.length} products from fashion.csv`);

    // Create in batches of 500 (DynamoDB BatchWrite limit is 25, so loop individually with concurrency)
    const BATCH = 25;
    let createdCount = 0;
    const createdProducts = [];
    for (let i = 0; i < products.length; i += BATCH) {
      const batch = products.slice(i, i + BATCH);
      await Promise.all(batch.map(async (p) => {
        try {
          const created = await Product.create(p);
          createdProducts.push(created);
          createdCount++;
        } catch (err) {
          if (err.name !== 'ConditionalCheckFailedException') console.error('   ⚠️', err.message);
        }
      }));
      console.log(`   ✅ Batch ${Math.floor(i / BATCH) + 1}: ${batch.length} products`);
    }
    console.log(`✅ ${createdCount} total products created from fashion.csv`);

    // Create inventory (each store gets random stock for each product)
    const stores = await Store.findAll();
    let invCount = 0;
    for (const store of stores) {
      for (const product of createdProducts.slice(0, 500)) {
        await Inventory.upsert({
          storeId: store.id,
          productId: product.id,
          quantity: Math.floor(Math.random() * 30) + 5,
          reserved: 0,
        });
        invCount++;
      }
    }
    console.log(`✅ ${invCount} inventory records created`);

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