require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const { Product, Store, Inventory } = require('../models');

const seedFlipkart = async () => {
  try {
    console.log('Connecting to DynamoDB...');

    const jsonPath = path.join(__dirname, '..', '..', 'flipkart_fashion_products_dataset.json');
    console.log(`Reading JSON from ${jsonPath}...`);
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const data = JSON.parse(rawData);

    console.log(`Parsed ${data.length} products. Processing in batches...`);

    const productsToInsert = [];

    for (const item of data) {
      if (!item.title || !item.selling_price) continue;

      let price = 0;
      if (item.selling_price) {
        price = parseFloat(String(item.selling_price).replace(/,/g, '')) || 0;
      }

      let originalPrice = price;
      if (item.actual_price) {
        originalPrice = parseFloat(String(item.actual_price).replace(/,/g, '')) || price;
      }

      let rating = parseFloat(item.average_rating) || 0;

      // Extract gender from title or category if possible
      let gender = null;
      const titleLower = item.title.toLowerCase();
      if (titleLower.includes('men') && !titleLower.includes('women')) gender = 'Men';
      else if (titleLower.includes('women') || titleLower.includes('woman')) gender = 'Women';
      else if (titleLower.includes('boy')) gender = 'Boys';
      else if (titleLower.includes('girl')) gender = 'Girls';

      // Extract color from product details
      let colour = null;
      if (Array.isArray(item.product_details)) {
        const colorDetail = item.product_details.find(d => Object.keys(d)[0].toLowerCase() === 'color');
        if (colorDetail) colour = Object.values(colorDetail)[0];
      }

      // Filter out unwanted items
      const subCatSearch = (item.sub_category || '').toLowerCase();
      if (
        subCatSearch.includes('innerwear') ||
        subCatSearch.includes('swimwear') ||
        titleLower.includes('brief') ||
        titleLower.includes(' bra ') ||
        titleLower.startsWith('bra ') ||
        titleLower.endsWith(' bra') ||
        titleLower.includes('bras ') ||
        titleLower.includes(' panty ') ||
        titleLower.includes(' panties ') ||
        titleLower.includes('lingerie') ||
        titleLower.includes('bikini')
      ) {
        continue;
      }

      // Map category
      let mappedCategory = item.category;
      if (mappedCategory === 'Clothing and Accessories') {
        mappedCategory = 'Apparel';
      }

      productsToInsert.push({
        productId: item.pid || item._id,
        naturalKey: item.pid || item._id,
        title: item.title.substring(0, 500),
        description: item.description ? item.description.substring(0, 10000) : null,
        category: mappedCategory,
        sub_category: item.sub_category,
        gender,
        colour,
        price,
        original_price: originalPrice,
        rating,
        brand: item.brand,
        image_url: (item.images && item.images.length > 0) ? item.images[0] : null,
        features: Array.isArray(item.product_details) ? JSON.stringify(item.product_details).substring(0, 10000) : null,
        is_active: !item.out_of_stock,
        attributes: item,
        source: 'flipkart_fashion_products_dataset.json',
      });
    }

    console.log(`Prepared ${productsToInsert.length} products for insertion.`);

    // Batch insert
    const BATCH_SIZE = 25;
    let insertedCount = 0;

    for (let i = 0; i < productsToInsert.length; i += BATCH_SIZE) {
      const batch = productsToInsert.slice(i, i + BATCH_SIZE);
      try {
        await Promise.all(batch.map(async (p) => {
          const existing = await Product.findById(p.productId);
          if (existing) return; // skip duplicates
          await Product.create(p);
          insertedCount++;
        }));
        console.log(`Inserted batch ${i / BATCH_SIZE + 1}... Total inserted: ${insertedCount}`);
      } catch (err) {
        console.error(`Error in batch ${i / BATCH_SIZE + 1}:`, err.message);
      }
    }

    console.log(`Successfully added ${insertedCount} products to the database!`);

    // Optionally add inventory for stores
    console.log('Fetching stores to add inventory...');
    const stores = await Store.findAll();
    if (stores.length > 0) {
      console.log(`Adding inventory for ${stores.length} stores...`);
      let invCount = 0;
      const allProducts = await Product.scanAllRaw();
      for (const product of allProducts.slice(0, 2000)) {
        for (const store of stores) {
          await Inventory.upsert({
            storeId: store.id,
            productId: product.productId,
            quantity: Math.floor(Math.random() * 50) + 5,
            reserved: 0,
          });
          invCount++;
        }
      }
      console.log(`Inventory added successfully (${invCount} records)`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

seedFlipkart();