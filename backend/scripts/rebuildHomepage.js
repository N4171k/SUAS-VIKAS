/**
 * Rebuild homepage-data.json from the products.csv catalog.
 *
 *   node scripts/rebuildHomepage.js
 *
 * The homepage payload ships with the backend, so it must reference real
 * product ids that exist in products.csv.
 */
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');

const OUT = path.join(__dirname, '..', 'homepage-data.json');

async function main() {
  const products = (await Product.topRated(50)).filter((p) => p.is_active);
  const categories = await Product.getCategories();

  const featuredProducts = products.slice(0, 12).map((p) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    original_price: p.original_price || Math.round(p.price * 1.5),
    category: p.category,
    image_url: p.image_url,
    brand: p.brand,
    rating: p.rating,
  }));

  const data = { featuredProducts, categories };
  fs.writeFileSync(OUT, JSON.stringify(data, null, 2) + '\n');
  console.log(`✅ homepage-data.json rebuilt (${featuredProducts.length} featured, ${categories.length} categories)`);
}

main().catch((err) => {
  console.error('❌ Rebuild failed:', err.message);
  process.exit(1);
});