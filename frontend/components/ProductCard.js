'use client';
import Link from 'next/link';
import { FiStar, FiHeart } from 'react-icons/fi';

export default function ProductCard({ product, viewMode = 'grid' }) {
  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <Link href={`/product/${product.id}`}
      className={`relative group clay-card overflow-hidden block ${viewMode === 'list' ? 'flex flex-row p-4 gap-6' : 'flex flex-col p-3'}`}>
      
      {/* Image Container with Airbnb-style aspect ratio and rounded corners */}
      <div className={`${viewMode === 'list' ? 'w-48 h-48' : 'aspect-[3/4]'} bg-gray-100 rounded-xl overflow-hidden relative`}>
        <img
          src={product.image_url || `https://picsum.photos/seed/${product.id}/400/600`}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Glassmorphism Favorite Button */}
        <button className="absolute top-3 right-3 p-2 rounded-full glass-panel hover:bg-white/90 transition-colors z-10 text-gray-700 hover:text-red-500">
          <FiHeart className="w-5 h-5" />
        </button>

        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold shadow-sm uppercase tracking-wide">
            -{discount}%
          </span>
        )}
      </div>

      {/* Content */}
      <div className={`mt-3 ${viewMode === 'list' ? 'flex-1 py-2' : ''}`}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-[16px] font-semibold text-gray-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
              {product.title}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">{product.brand || 'Luxury Brand'}</p>
          </div>
          <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
            <FiStar className="w-3.5 h-3.5 fill-current text-black" />
            <span>{product.rating || '4.8'}</span>
          </div>
        </div>
        
        <div className="mt-2 flex items-baseline gap-2">
           <span className="text-[15px] text-gray-900 font-semibold">
             ₹{parseFloat(product.price).toLocaleString()}
             <span className="font-normal text-gray-500 text-sm ml-1">night</span>
           </span>
           {product.original_price && (
             <span className="text-xs text-gray-400 line-through decoration-gray-400">
               ₹{parseFloat(product.original_price).toLocaleString()}
             </span>
           )}
        </div>
        
        {/* Claymorphism Tags - only show in list or spacious view */}
        {viewMode === 'list' && (
           <div className="mt-4 flex gap-2">
             <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">Free cancellation</span>
             <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">Instant Book</span>
           </div>
        )}
      </div>
    </Link>
  );
}
