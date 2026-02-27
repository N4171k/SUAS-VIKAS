// Server component -- holds generateStaticParams so output:'export' build succeeds.
// All interactive UI lives in ProductDetailClient ('use client').
import ProductDetailClient from './ProductDetailClient';

// Fetch all product IDs for static export
export async function generateStaticParams() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://suas-vikas.vercel.app/api';
    
    // Fetch all products with a high limit to avoid pagination
    const res = await fetch(`${baseUrl}/products?limit=10000`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    
    if (!res.ok) {
      console.warn('Failed to fetch products for static generation');
      return [{ id: 'loading' }]; // Fallback
    }
    
    const data = await res.json();
    const products = data.products || data || [];
    
    // Map product IDs to params, ensuring they're strings
    const params = products.map((product) => ({
      id: String(product.id),
    }));
    
    // Always include fallback
    if (!params.length) params.push({ id: 'loading' });
    
    console.log(`✅ Generated static params for ${params.length} products`);
    return params;
  } catch (error) {
    console.error('❌ Error in generateStaticParams:', error);
    return [{ id: 'loading' }]; // Fallback on error
  }
}

export default function ProductDetailPage() {
  return <ProductDetailClient />;
}