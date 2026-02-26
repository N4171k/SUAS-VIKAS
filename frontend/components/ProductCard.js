'use client';
import Link from 'next/link';
import { FiStar } from 'react-icons/fi';

export default function ProductCard({ product, viewMode = 'grid' }) {
  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <Link href={`/product/${product.id}`}
      className={`product-card bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 ${viewMode === 'list' ? 'flex gap-4 p-4' : 'p-4'}`}>
      <div className={`${viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : 'aspect-square mb-3'} bg-gray-100 rounded-lg overflow-hidden relative`}>
        <img
          src={product.image_url || `https://picsum.photos/seed/${product.id}/400/400`}
          alt={product.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
            -{discount}%
          </span>
        )}
      </div>
      <div className="flex-1">
        {product.brand && (
          <p className="text-xs text-vikas-blue font-medium mb-0.5">{product.brand}</p>
        )}
        <h3 className="text-sm font-medium line-clamp-2 mb-1 text-gray-800">{product.title}</h3>
        <div className="flex items-center gap-1 text-xs mb-1">
          <div className="flex items-center bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs font-medium">
            <FiStar className="w-3 h-3 mr-0.5 fill-current" /> {product.rating || '0'}
          </div>
          <span className="text-gray-400">({product.rating_count || 0})</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-vikas-dark">₹{parseFloat(product.price).toLocaleString()}</span>
          {product.original_price && (
            <span className="text-xs text-gray-400 line-through">₹{parseFloat(product.original_price).toLocaleString()}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
