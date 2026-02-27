'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FiShoppingCart, FiMapPin, FiClock, FiStar, FiHeart, FiShare2, FiMessageCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../../../lib/api';
import { useAuth } from '../../../../lib/authContext';
import ReservationModal from '../../../../components/ReservationModal';
import ChatBubble from '../../../../components/ChatBubble';
import Loader from '../../../../components/Loader';

export default function ProductDetailClient() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const [product, setProduct] = useState(null);
  const [stores, setStores] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showReservation, setShowReservation] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const [productRes, storesRes, recsRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/products/${id}/stores`),
          api.get(`/ai/recommendations/${id}`).catch(() => ({ data: [] })),
        ]);
        setProduct(productRes.data);
        setStores(storesRes.data || []);
        setRecommendations(recsRes.data || []);
      } catch (err) {
        console.error('Failed to fetch product:', err);
        toast.error('Product not found');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  const addToCart = async () => {
    if (!token) { toast.error('Please login to add to cart'); return; }
    try {
      await api.post('/cart', { productId: product.id, quantity });
      toast.success('Added to cart!');
    } catch (err) {
      toast.error('Failed to add to cart');
    }
  };

  const buyNow = async () => {
    if (!token) { toast.error('Please login to buy'); return; }
    try {
      await api.post('/orders/buy-now', { productId: product.id, quantity });
      toast.success('Order placed!');
    } catch (err) {
      toast.error('Failed to place order');
    }
  };

  if (loading) return <Loader fullScreen label="Loading product…" />;

  if (!product) {
    return <div className="text-center py-16"><p className="text-gray-500 text-lg">Product not found</p></div>;
  }

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-red-500">Home</Link> {' / '}
        <Link href="/products" className="hover:text-red-500">Products</Link> {' / '}
        <span className="text-gray-800">{product.category}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
            <img src={product.image_url || `https://picsum.photos/seed/${product.id}/600/600`}
              alt={product.title} className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm">
              <FiHeart /> Wishlist
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm">
              <FiShare2 /> Share
            </button>
            <Link href={`/ar?productId=${product.id}`}
              className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 text-sm font-medium">
              🥽 AR Try-On
            </Link>
          </div>
        </div>

        {/* Product Info */}
        <div>
          <p className="text-sm text-red-500 font-medium mb-1">{product.brand}</p>
          <h1 className="text-2xl md:text-3xl font-bold mb-3">{product.title}</h1>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
              <FiStar className="w-4 h-4 mr-1 fill-current" /> {product.rating}
            </div>
            <span className="text-gray-500 text-sm">({product.rating_count} reviews)</span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500 text-sm">{product.category}</span>
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-gray-900">₹{parseFloat(product.price).toLocaleString()}</span>
            {product.original_price && (
              <>
                <span className="text-lg text-gray-400 line-through">₹{parseFloat(product.original_price).toLocaleString()}</span>
                <span className="text-green-600 font-semibold">{discount}% off</span>
              </>
            )}
          </div>

          {product.description && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-6">
            <span className="font-medium">Quantity:</span>
            <div className="flex items-center border border-gray-200 rounded-lg">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 hover:bg-gray-50">−</button>
              <span className="px-4 py-2 border-x border-gray-200 min-w-[40px] text-center">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 hover:bg-gray-50">+</button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-8">
            <button onClick={addToCart}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition">
              <FiShoppingCart /> Add to Cart
            </button>
            <button onClick={buyNow}
              className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition">
              Buy Now
            </button>
          </div>

          {/* Store Availability */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><FiMapPin /> Store Availability</h3>
            {stores.length === 0 ? (
              <p className="text-gray-500 text-sm">Not available at stores near you</p>
            ) : (
              <div className="space-y-2">
                {stores.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                    <div>
                      <p className="font-medium text-sm">{s.store.name}</p>
                      <p className="text-xs text-gray-500">{s.store.location}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${s.available > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {s.available > 0 ? `${s.available} in stock` : 'Out of stock'}
                      </span>
                      {s.available > 0 && (
                        <button onClick={() => { setSelectedStore(s); setShowReservation(true); }}
                          className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 font-medium">
                          Reserve
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ask AI */}
      <button onClick={() => setShowChat(!showChat)}
        className="fixed bottom-6 right-6 bg-gray-900 text-white p-4 rounded-full shadow-lg hover:bg-gray-800 transition z-50">
        <FiMessageCircle className="w-6 h-6" />
      </button>
      {showChat && <ChatBubble productId={product.id} onClose={() => setShowChat(false)} />}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-4">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recommendations.slice(0, 4).map((rec) => (
              <Link key={rec.id} href={`/product/${rec.id}`}
                className="product-card bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all border border-gray-100">
                <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                  <img src={rec.image_url || `https://picsum.photos/seed/${rec.id}/400/400`}
                    alt={rec.title} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <h3 className="text-sm font-medium line-clamp-2 mb-1">{rec.title}</h3>
                <span className="text-lg font-bold">₹{parseFloat(rec.price).toLocaleString()}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Reservation Modal */}
      {showReservation && selectedStore && (
        <ReservationModal
          product={product}
          store={selectedStore}
          onClose={() => setShowReservation(false)}
        />
      )}
    </div>
  );
}
