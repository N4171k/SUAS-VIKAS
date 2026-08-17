import fs from 'fs';
import path from 'path';
import ProductDetailClient from './ProductDetailClient';

const CATALOG_PATH = path.join(process.cwd(), '..', 'backend', 'catalog.json');

// Static export needs all product paths at build time, so we read the local
// catalog snapshot instead of calling the live API during Vercel build.
export async function generateStaticParams() {
  try {
    const rawCatalog = fs.readFileSync(CATALOG_PATH, 'utf8');
    const products = JSON.parse(rawCatalog);

    const params = products
      .filter((product) => product && (product.id || product.productId))
      .map((product) => ({
        id: String(product.id || product.productId),
      }));

    return params.length ? params : [{ id: 'loading' }];
  } catch (error) {
    console.error('❌ Error in generateStaticParams:', error);
    return [{ id: 'loading' }];
  }
}

export default function ProductDetailPage() {
  return <ProductDetailClient />;
}