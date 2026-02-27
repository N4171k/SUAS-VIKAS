'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FiFilter, FiX, FiChevronDown, FiGrid, FiList } from 'react-icons/fi';
import api from '../../../lib/api';
import Loader from '../../../components/Loader';

export default function ProductsPage() {
  return (
    <Suspense fallback={<Loader fullScreen label="Loading products…" />}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    sub_category: searchParams.get('sub_category') || '',
    gender: searchParams.get('gender') || '',
    colour: searchParams.get('colour') || '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    rating: '',
    sort: 'created_at',
    order: 'DESC',
    page: 1,
  });

  // Re-sync filters whenever the URL search params change (e.g. clicking a
  // category tile on the home page or the desktop category strip in the header).
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      search: searchParams.get('search') || searchParams.get('q') || '',
      category: searchParams.get('category') || '',
      sub_category: searchParams.get('sub_category') || '',
      gender: searchParams.get('gender') || '',
      colour: searchParams.get('colour') || '',
      page: 1,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, val]) => { if (val) params.set(key, val); });
      params.set('limit', '20');

      const res = await api.get(`/products?${params.toString()}`);
      setProducts(res.data.products || []);
      setPagination(res.data.pagination || {});
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          api.get('/products/meta/categories'),
          api.get('/products/meta/brands'),
        ]);
        setCategories(catRes.data || []);
        setBrands(brandRes.data || []);
      } catch (err) { console.error(err); }
    };
    fetchMeta();
  }, []);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', sub_category: '', gender: '', colour: '', brand: '', minPrice: '', maxPrice: '', rating: '', sort: 'created_at', order: 'DESC', page: 1 });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex gap-3">
          <input type="text" value={filters.search} onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Search products..." className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none" />
          <button onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
            <FiFilter /> Filters
          </button>
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button onClick={() => setViewMode('grid')} className={`p-3 ${viewMode === 'grid' ? 'bg-gray-900 text-white' : 'bg-white'}`}><FiGrid /></button>
            <button onClick={() => setViewMode('list')} className={`p-3 ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'bg-white'}`}><FiList /></button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Filters</h3>
            <button onClick={clearFilters} className="text-sm text-red-500 hover:underline">Clear All</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <select value={filters.category} onChange={(e) => updateFilter('category', e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filters.gender} onChange={(e) => updateFilter('gender', e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="">All Genders</option>
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Boys">Boys</option>
              <option value="Girls">Girls</option>
              <option value="Unisex">Unisex</option>
            </select>
            <select value={filters.sub_category} onChange={(e) => updateFilter('sub_category', e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="">All Sub-Categories</option>
              <option value="Topwear">Topwear</option>
              <option value="Bottomwear">Bottomwear</option>
              <option value="Shoes">Shoes</option>
              <option value="Dress">Dress</option>
              <option value="Flip Flops">Flip Flops</option>
              <option value="Sandal">Sandal</option>
              <option value="Socks">Socks</option>
              <option value="Innerwear">Innerwear</option>
            </select>
            <select value={filters.colour} onChange={(e) => updateFilter('colour', e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="">All Colours</option>
              <option value="Black">Black</option>
              <option value="White">White</option>
              <option value="Blue">Blue</option>
              <option value="Red">Red</option>
              <option value="Pink">Pink</option>
              <option value="Green">Green</option>
              <option value="Grey">Grey</option>
              <option value="Brown">Brown</option>
              <option value="Navy Blue">Navy Blue</option>
              <option value="Yellow">Yellow</option>
              <option value="Orange">Orange</option>
              <option value="Purple">Purple</option>
            </select>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <select value={filters.brand} onChange={(e) => updateFilter('brand', e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="">All Brands</option>
              {brands.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            <input type="number" placeholder="Min Price" value={filters.minPrice}
              onChange={(e) => updateFilter('minPrice', e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            <input type="number" placeholder="Max Price" value={filters.maxPrice}
              onChange={(e) => updateFilter('maxPrice', e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            <select value={`${filters.sort}-${filters.order}`}
              onChange={(e) => { const [s, o] = e.target.value.split('-'); updateFilter('sort', s); setFilters((p) => ({ ...p, order: o })); }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="created_at-DESC">Newest</option>
              <option value="price-ASC">Price: Low to High</option>
              <option value="price-DESC">Price: High to Low</option>
              <option value="rating-DESC">Top Rated</option>
              <option value="title-ASC">A-Z</option>
            </select>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{pagination.total || 0} products found</p>
      </div>

      {/* Product Grid */}
      {loading ? (
        <Loader label="Loading products…" />
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg mb-4">No products found</p>
          <button onClick={clearFilters} className="text-red-500 hover:underline">Clear filters</button>
        </div>
      ) : (
        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1'} gap-4`}>
          {products.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`}
              className={`product-card bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 ${viewMode === 'list' ? 'flex gap-4 p-4' : 'p-4'}`}>
              <div className={`${viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : 'aspect-square mb-3'} bg-gray-100 rounded-lg overflow-hidden`}>
                <img src={product.image_url || `https://picsum.photos/seed/${product.id}/400/400`}
                  alt={product.title} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-red-500 font-medium mb-1">{product.brand}</p>
                <h3 className="text-sm font-medium line-clamp-2 mb-1">{product.title}</h3>
                <div className="flex flex-wrap gap-1 mb-1">
                  {product.gender && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{product.gender}</span>}
                  {product.colour && <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{product.colour}</span>}
                  {product.usage && <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded">{product.usage}</span>}
                </div>
                <div className="flex items-center gap-1 text-xs text-yellow-500 mb-1">
                  {'★'.repeat(Math.round(product.rating || 0))} <span className="text-gray-400">({product.rating_count || 0})</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold">₹{parseFloat(product.price).toLocaleString()}</span>
                  {product.original_price && <span className="text-xs text-gray-400 line-through">₹{parseFloat(product.original_price).toLocaleString()}</span>}
                </div>
                {product.original_price && (
                  <span className="text-xs text-green-600 font-medium">
                    {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% off
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: Math.min(pagination.totalPages, 10) }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setFilters((prev) => ({ ...prev, page: p }))}
              className={`w-10 h-10 rounded-lg text-sm font-medium ${p === pagination.page ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 hover:bg-gray-50'}`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
