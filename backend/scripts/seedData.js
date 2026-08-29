require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { User, Product, Store, Inventory } = require('../models');
const bcrypt = require('bcryptjs');

const sampleStores = [
  { storeId: 'store-01', name: 'VIKAS Flagship - Mumbai', city: 'Mumbai', address: 'Phoenix Marketcity, LBS Road, Kurla West', latitude: 19.0860, longitude: 72.8890 },
  { storeId: 'store-02', name: 'VIKAS Store - Delhi', city: 'New Delhi', address: 'Select Citywalk, Saket', latitude: 28.5283, longitude: 77.2190 },
  { storeId: 'store-03', name: 'VIKAS Store - Bangalore', city: 'Bangalore', address: 'UB City Mall, Vittal Mallya Road', latitude: 12.9716, longitude: 77.5946 },
  { storeId: 'store-04', name: 'VIKAS Store - Hyderabad', city: 'Hyderabad', address: 'Inorbit Mall, Hitech City', latitude: 17.4375, longitude: 78.3853 },
  { storeId: 'store-05', name: 'VIKAS Store - Pune', city: 'Pune', address: 'Seasons Mall, Magarpatta', latitude: 18.5146, longitude: 73.9260 },
];

const sampleProducts = [
  { productId: 'prod-001', title: 'Men\'s Cotton T-Shirt', description: 'Comfortable cotton t-shirt for everyday wear', category: 'Apparel', sub_category: 'T-Shirts', brand: 'VIKAS', price: 499, gender: 'Men', colour: 'Blue', usage: 'Casual', rating: 4.5, image_url: 'https://picsum.photos/seed/prod-001/400/400', is_active: true },
  { productId: 'prod-002', title: 'Women\'s Summer Dress', description: 'Light and breezy summer dress', category: 'Apparel', sub_category: 'Dresses', brand: 'VIKAS', price: 1299, gender: 'Women', colour: 'Red', usage: 'Casual', rating: 4.7, image_url: 'https://picsum.photos/seed/prod-002/400/400', is_active: true },
  { productId: 'prod-003', title: 'Men\'s Running Shoes', description: 'Lightweight running shoes with cushioned sole', category: 'Footwear', sub_category: 'Running Shoes', brand: 'VIKAS', price: 2999, gender: 'Men', colour: 'Black', usage: 'Sports', rating: 4.6, image_url: 'https://picsum.photos/seed/prod-003/400/400', is_active: true },
  { productId: 'prod-004', title: 'Women\'s Sneakers', description: 'Trendy sneakers for everyday style', category: 'Footwear', sub_category: 'Sneakers', brand: 'VIKAS', price: 2499, gender: 'Women', colour: 'White', usage: 'Casual', rating: 4.4, image_url: 'https://picsum.photos/seed/prod-004/400/400', is_active: true },
  { productId: 'prod-005', title: 'Men\'s Formal Shirt', description: 'Crisp formal shirt for office wear', category: 'Apparel', sub_category: 'Shirts', brand: 'VIKAS', price: 899, gender: 'Men', colour: 'White', usage: 'Formal', rating: 4.3, image_url: 'https://picsum.photos/seed/prod-005/400/400', is_active: true },
  { productId: 'prod-006', title: 'Women\'s Jeans', description: 'Classic fit jeans with stretch', category: 'Apparel', sub_category: 'Jeans', brand: 'VIKAS', price: 1499, gender: 'Women', colour: 'Blue', usage: 'Casual', rating: 4.5, image_url: 'https://picsum.photos/seed/prod-006/400/400', is_active: true },
  { productId: 'prod-007', title: 'Men\'s Hoodie', description: 'Warm and cozy hoodie for winter', category: 'Apparel', sub_category: 'Hoodies', brand: 'VIKAS', price: 1799, gender: 'Men', colour: 'Grey', usage: 'Casual', rating: 4.6, image_url: 'https://picsum.photos/seed/prod-007/400/400', is_active: true },
  { productId: 'prod-008', title: 'Women\'s Cardigan', description: 'Soft cardigan for layering', category: 'Apparel', sub_category: 'Cardigans', brand: 'VIKAS', price: 1199, gender: 'Women', colour: 'Pink', usage: 'Casual', rating: 4.4, image_url: 'https://picsum.photos/seed/prod-008/400/400', is_active: true },
  { productId: 'prod-009', title: 'Men\'s Loafers', description: 'Classic leather loafers', category: 'Footwear', sub_category: 'Loafers', brand: 'VIKAS', price: 3499, gender: 'Men', colour: 'Brown', usage: 'Formal', rating: 4.5, image_url: 'https://picsum.photos/seed/prod-009/400/400', is_active: true },
  { productId: 'prod-010', title: 'Women\'s Sandals', description: 'Comfortable flat sandals', category: 'Footwear', sub_category: 'Sandals', brand: 'VIKAS', price: 999, gender: 'Women', colour: 'Tan', usage: 'Casual', rating: 4.2, image_url: 'https://picsum.photos/seed/prod-010/400/400', is_active: true },
];

const seed = async () => {
  try {
    console.log('🌱 Starting Convex seed...');

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

    // Create products
    let createdCount = 0;
    const createdProducts = [];
    for (const product of sampleProducts) {
      try {
        const created = await Product.create(product);
        createdProducts.push(created);
        createdCount++;
      } catch (err) {
        console.error('   ⚠️', err.message);
      }
    }
    console.log(`✅ ${createdCount} products created`);

    // Create inventory (each store gets random stock for each product)
    const stores = await Store.findAll();
    let invCount = 0;
    for (const store of stores) {
      for (const product of createdProducts) {
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
    console.log(`📊 Total: ${createdCount} products across ${stores.length} stores`);
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