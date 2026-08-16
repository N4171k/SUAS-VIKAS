require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const { scanAll } = require('../models/base');
const { toAPI, table } = require('../models/Product');

/**
 * One-time build of backend/catalog.json.
 *
 * The Products table (28k items × 16KB with embeddings) is provisioned at
 * 25 RCU, so a full scan takes ~1 hour under adaptive pacing. This script
 * runs that scan once and writes the formatted catalog to disk; the server
 * loads the file at boot instead of scanning on every request.
 *
 * Resumable: pass LAST_KEY (the productId of the last scanned item) to
 * continue from where a previous run stopped, and the script appends.
 */
const OUT = path.join(__dirname, '..', 'catalog.json');

(async () => {
  const resumeFrom = process.argv[2];
  const append = resumeFrom && fs.existsSync(OUT);

  let existing = [];
  if (append) {
    existing = JSON.parse(fs.readFileSync(OUT, 'utf8'));
    console.log(`↪️  Resuming — ${existing.length} items already in catalog.json`);
  }

  let lastProductId = resumeFrom || null;
  let scanned = 0;

  // If resuming, we still have to rescan pages before the checkpoint to find
  // where we left off; we skip formatting items up to the checkpoint.
  const raw = await scanAll({
    TableName: table,
    ProjectionExpression: 'productId, title, attributes',
    onProgress: (n) => console.log(`   ...${n} items scanned, ${scanned} formatted`),
  });

  let items;
  if (lastProductId) {
    const idx = raw.findIndex((it) => it.productId === lastProductId);
    if (idx === -1) {
      console.error('❌ Checkpoint productId not found — restarting from scratch.');
      items = raw;
    } else {
      items = raw.slice(idx + 1);
    }
  } else {
    items = raw;
  }

  const formatted = items.map((it) => toAPI(it)).filter((p) => p && p.id);
  scanned += formatted.length;

  const merged = append ? [...existing, ...formatted] : formatted;
  fs.writeFileSync(OUT, JSON.stringify(merged));
  console.log(`✅ catalog.json written: ${merged.length} products (${scanned} new this run)`);
  console.log(`   Size: ${(fs.statSync(OUT).size / 1024 / 1024).toFixed(1)} MB`);
  process.exit(0);
})().catch((err) => {
  console.error('❌ Build failed:', err.message);
  process.exit(1);
});