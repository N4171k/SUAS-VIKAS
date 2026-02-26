// Server component -- holds generateStaticParams so output:'export' build succeeds.
// All interactive UI lives in ProductDetailClient ('use client').
import ProductDetailClient from './ProductDetailClient';

// Must return at least one entry for static export.
// All real product data is fetched client-side at runtime via useParams() + api.
// Client-side navigation (next/link) works for all real product IDs.
export async function generateStaticParams() {
  return [{ id: 'loading' }];
}

export default function ProductDetailPage() {
  return <ProductDetailClient />;
}