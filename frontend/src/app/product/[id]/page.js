import ProductDetailClient from './ProductDetailClient';

// Static export needs all product paths at build time, so we pull the real
// product IDs from the live backend API. These are the exact IDs the listing
// pages link to, so every generated page actually resolves. (The local
// backend/catalog.json snapshot is gitignored and not present at build time,
// and its Flipkart-style IDs don't match the API's product IDs — which is why
// this previously read the file and produced no usable pages → 404s.)
export async function generateStaticParams() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://suas-vikas.vercel.app/api';

    const ids = [];
    let page = 1;
    let totalPages = 1;

    do {
      const res = await fetch(`${baseUrl}/products?limit=100&page=${page}`);
      if (!res.ok) break;
      const data = await res.json();
      const products = data.products || [];
      for (const p of products) {
        if (p && p.id) ids.push(String(p.id));
      }
      totalPages = data.pagination?.totalPages ?? 1;
      page += 1;
    } while (page <= totalPages);

    const params = [...new Set(ids)].map((id) => ({ id }));
    return params.length ? params : [{ id: 'loading' }];
  } catch (error) {
    console.error('❌ Error in generateStaticParams:', error);
    return [{ id: 'loading' }];
  }
}

export default function ProductDetailPage() {
  return <ProductDetailClient />;
}