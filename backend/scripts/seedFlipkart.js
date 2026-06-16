const fs = require('fs');
const path = require('path');
const { sequelize } = require('../config/db');
const { Product, Store, Inventory } = require('../models');

const seedFlipkart = async () => {
  try {
    console.log('Connecting to DB...');
    await sequelize.authenticate();
    console.log('DB connected.');

    const jsonPath = path.join(__dirname, '..', '..', 'flipkart_fashion_products_dataset.json');
    console.log(`Reading JSON from ${jsonPath}...`);
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const data = JSON.parse(rawData);
    
    console.log(`Parsed ${data.length} products. Processing in batches...`);
    
    const productsToInsert = [];
    
    // Process only first 5000 to keep it manageable, or process all? Let's do a reasonable amount like 5000 or 10000.
    // Wait, the user said "add these to db also", maybe they mean all of them. Let's do all of them, but we must handle memory/batching.
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
      const titleSearch = titleLower;
      const subCatSearch = (item.sub_category || '').toLowerCase();
      if (
        subCatSearch.includes('innerwear') ||
        subCatSearch.includes('swimwear') ||
        titleSearch.includes('brief') ||
        titleSearch.includes(' bra ') ||
        titleSearch.startsWith('bra ') ||
        titleSearch.endsWith(' bra') ||
        titleSearch.includes('bras ') ||
        titleSearch.includes(' panty ') ||
        titleSearch.includes(' panties ') ||
        titleSearch.includes('lingerie') ||
        titleSearch.includes('bikini')
      ) {
        continue;
      }
      
      // Map category
      let mappedCategory = item.category;
      if (mappedCategory === 'Clothing and Accessories') {
        mappedCategory = 'Apparel';
      }
      
      productsToInsert.push({
        product_id: item.pid || item._id,
        title: item.title.substring(0, 500),
        description: item.description ? item.description.substring(0, 10000) : null,
        category: mappedCategory,
        sub_category: item.sub_category,
        gender: gender,
        colour: colour,
        price: price,
        original_price: originalPrice,
        rating: rating,
        brand: item.brand,
        image_url: (item.images && item.images.length > 0) ? item.images[0] : null,
        features: Array.isArray(item.product_details) ? JSON.stringify(item.product_details).substring(0, 10000) : null,
        is_active: !item.out_of_stock,
      });
    }

    console.log(`Prepared ${productsToInsert.length} products for insertion.`);

    // Batch insert
    const BATCH_SIZE = 500;
    let insertedCount = 0;
    const allCreatedProducts = [];

    // Let's drop existing products if we want, or just append? The user said "add these to db also" so we should append!
    
    for (let i = 0; i < productsToInsert.length; i += BATCH_SIZE) {
      const batch = productsToInsert.slice(i, i + BATCH_SIZE);
      try {
        const created = await Product.bulkCreate(batch, { ignoreDuplicates: true });
        allCreatedProducts.push(...created);
        insertedCount += created.length;
        console.log(`Inserted batch ${i/BATCH_SIZE + 1}... Total inserted: ${insertedCount}`);
      } catch (err) {
        console.error(`Error in batch ${i/BATCH_SIZE + 1}:`, err.message);
      }
    }

    console.log(`Successfully added ${insertedCount} products to the database!`);
    
    // Optionally add inventory for stores
    console.log('Fetching stores to add inventory...');
    const stores = await Store.findAll();
    if (stores.length > 0) {
      console.log(`Adding inventory for ${stores.length} stores...`);
      const inventoryRecords = [];
      for (const product of allCreatedProducts) {
        if (!product || !product.id) continue;
        for (const store of stores) {
          inventoryRecords.push({
            store_id: store.id,
            product_id: product.id,
            quantity: Math.floor(Math.random() * 50) + 5,
            reserved_quantity: 0
          });
        }
      }
      
      const INV_BATCH_SIZE = 2000;
      for (let i = 0; i < inventoryRecords.length; i += INV_BATCH_SIZE) {
        const batch = inventoryRecords.slice(i, i + INV_BATCH_SIZE);
        await Inventory.bulkCreate(batch, { ignoreDuplicates: true });
        console.log(`Inserted inventory batch ${Math.floor(i/INV_BATCH_SIZE) + 1}...`);
      }
      console.log('Inventory added successfully!');
    }

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

seedFlipkart();
