'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  FiSearch, FiShoppingCart, FiX, FiPlus, FiMinus, FiChevronRight,
  FiStar, FiMapPin, FiHome, FiRefreshCw, FiPackage, FiCheck,
} from 'react-icons/fi';
import api from '../../../lib/api';
import PaymentGateway from '../../../components/PaymentGateway';

const IDLE_TIMEOUT = 120_000; // 2 minutes of inactivity → reset to welcome

// ── Tiny helpers ──────────────────────────────────────────────────────────
function currency(val) {
  return '₹' + parseFloat(val || 0).toLocaleString('en-IN');
}

// ── Category colours ──────────────────────────────────────────────────────
const CAT_COLORS = [
  'from-pink-500 to-rose-600',
  'from-violet-500 to-purple-600',
  'from-blue-500 to-indigo-600',
  'from-teal-500 to-green-600',
  'from-orange-500 to-red-500',
  'from-yellow-500 to-orange-500',
  'from-cyan-500 to-blue-500',
  'from-fuchsia-500 to-pink-500',
];

export default function KioskPage() {
  // ── Screen state ──────────────────────────────────────────────────────
  // welcome → browse → detail → cart → payment → receipt
  const [screen, setScreen] = useState('welcome');

  // ── Products ──────────────────────────────────────────────────────────
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [search, setSearch]         = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('M');

  // ── Cart ──────────────────────────────────────────────────────────────
  const [cart, setCart] = useState([]); // { product, quantity, size }

  // ── Receipt ──────────────────────────────────────────────────────────
  const [receipt, setReceipt] = useState(null);

  // ── Idle timeout ─────────────────────────────────────────────────────
  const idleTimer = useRef(null);
  const resetIdle = useCallback(() => {
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      setScreen('welcome');
      setCart([]);
      setSearch('');
      setSelectedProduct(null);
      setActiveCategory('All');
    }, IDLE_TIMEOUT);
  }, []);

  useEffect(() => {
    const events = ['touchstart', 'mousemove', 'keydown', 'click'];
    events.forEach((e) => window.addEventListener(e, resetIdle, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, resetIdle));
  }, [resetIdle]);

  // ── Load data ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== 'browse' && screen !== 'detail') return;
    const load = async () => {
      setLoading(true);
      try {
        const [pRes, cRes] = await Promise.all([
          api.get(`/products?limit=40&sort=rating&order=DESC${search ? `&search=${encodeURIComponent(search)}` : ''}${activeCategory !== 'All' ? `&category=${encodeURIComponent(activeCategory)}` : ''}`),
          api.get('/products/meta/categories'),
        ]);
        setProducts(pRes.data.products || []);
        const cats = cRes.data || [];
        setCategories(['All', ...cats.slice(0, 7)]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [screen, search, activeCategory]);

  // ── Cart helpers ──────────────────────────────────────────────────────
  const cartTotal    = cart.reduce((s, i) => s + parseFloat(i.product.price) * i.quantity, 0);
  const cartCount    = cart.reduce((s, i) => s + i.quantity, 0);

  const addToCart = (product, size = selectedSize, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id && i.size === size);
      if (existing) return prev.map((i) => i.product.id === product.id && i.size === size ? { ...i, quantity: i.quantity + qty } : i);
      return [...prev, { product, quantity: qty, size }];
    });
  };

  const updateQty = (productId, size, delta) => {
    setCart((prev) =>
      prev.map((i) => i.product.id === productId && i.size === size ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i)
        .filter((i) => i.quantity > 0)
    );
  };

  const removeFromCart = (productId, size) => {
    setCart((prev) => prev.filter((i) => !(i.product.id === productId && i.size === size)));
  };

  // ── Payment success ───────────────────────────────────────────────────
  const handlePaymentSuccess = ({ transactionId, method, amount }) => {
    setReceipt({ transactionId, method, amount, items: [...cart], total: cartTotal, paidAt: new Date() });
    setCart([]);
    setScreen('receipt');
  };

  const [showPayment, setShowPayment] = useState(false);

  // ── RENDER ────────────────────────────────────────────────────────────
  const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  return (
    <div className="fixed inset-0 bg-[#0f0f0f] text-white overflow-hidden flex flex-col select-none"
      style={{ fontFamily: "'DM Sans', sans-serif", touchAction: 'manipulation' }}>

      {/* ╔══════════════════════════════════════════════════════ WELCOME ══╗ */}
      {screen === 'welcome' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-8 px-8 cursor-pointer bg-gradient-to-br from-gray-950 via-gray-900 to-black"
          onClick={() => { setScreen('browse'); resetIdle(); }}>

          {/* Ambient blobs */}
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-airbnb-red/10 rounded-full blur-[120px] -translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-700/10 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3" />

          <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 mb-6 rounded-3xl shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #FF385C, #E61E4D)' }}>
              <span className="text-4xl font-black">V</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-4">
              <span className="text-white">VIKAS</span>
            </h1>
            <p className="text-gray-400 text-xl md:text-2xl mb-10">In-Store Shopping Kiosk</p>

            <div className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl border-2 border-white/20 bg-white/5 backdrop-blur-md text-xl font-bold hover:bg-white/10 transition-all">
              <span>Tap anywhere to start</span>
              <FiChevronRight size={22} />
            </div>
          </div>

          <div className="absolute bottom-8 text-gray-600 text-sm">
            <FiMapPin className="inline mr-1 mb-0.5" size={12} />
            VIKAS Store · Powered by VIKAS POS
          </div>
        </div>
      )}

      {/* ╔══════════════════════════════════════════════════════ BROWSE ═══╗ */}
      {(screen === 'browse' || screen === 'detail') && (
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Top bar */}
          <div className="flex items-center gap-4 px-6 py-4 bg-gray-950 border-b border-gray-800 flex-shrink-0">
            <button onClick={() => { setScreen('welcome'); setCart([]); }}
              className="p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors">
              <FiHome size={20} />
            </button>

            <div className="flex-1 flex items-center gap-3 bg-gray-800 rounded-2xl px-4 py-3">
              <FiSearch size={18} className="text-gray-400 flex-shrink-0" />
              <input
                type="text" value={search} placeholder="Search for clothes, shoes, accessories…"
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent outline-none text-white placeholder-gray-500 text-base"
              />
              {search && <button onClick={() => setSearch('')}><FiX size={16} className="text-gray-500" /></button>}
            </div>

            <button onClick={() => setScreen('cart')}
              className="relative p-3 bg-airbnb-red rounded-xl hover:bg-red-600 transition-colors flex-shrink-0">
              <FiShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white text-airbnb-red text-xs font-black rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Category strip */}
          <div className="flex gap-3 px-6 py-4 overflow-x-auto no-scrollbar bg-gray-950 flex-shrink-0">
            {categories.map((cat, i) => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all
                  ${activeCategory === cat
                    ? 'bg-white text-gray-900 shadow-lg scale-105'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
                {cat}
              </button>
            ))}
          </div>

          {/* Products grid */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-gray-800 rounded-2xl aspect-[3/4] animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-20 text-gray-500">
                <FiPackage size={48} className="opacity-50" />
                <p className="text-lg">No products found</p>
                <button onClick={() => { setSearch(''); setActiveCategory('All'); }}
                  className="px-5 py-2 bg-gray-800 rounded-xl text-sm hover:bg-gray-700 transition-colors">
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                {products.map((p) => (
                  <div key={p.id} className="bg-gray-900 rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.02] hover:shadow-xl transition-all border border-gray-800 hover:border-gray-600 group"
                    onClick={() => { setSelectedProduct(p); setSelectedSize('M'); setScreen('detail'); }}>
                    <div className="aspect-[3/4] bg-gray-800 relative overflow-hidden">
                      <img src={p.image_url || `https://picsum.photos/seed/${p.id}/400/600`} alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      {p.original_price && (
                        <span className="absolute top-3 left-3 bg-airbnb-red text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          -{Math.round(((p.original_price - p.price) / p.original_price) * 100)}%
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold line-clamp-2 text-gray-100 leading-snug mb-1">{p.title}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-airbnb-red font-bold">{currency(p.price)}</span>
                        <div className="flex items-center gap-1 text-yellow-400 text-xs">
                          <FiStar size={11} className="fill-current" />
                          <span className="text-gray-400">{p.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ╔══════════════════════════════════════════════════ DETAIL ════════╗ */}
      {screen === 'detail' && selectedProduct && (
        <div className="absolute inset-0 bg-gray-950 z-30 flex flex-col">
          {/* Back */}
          <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-800 flex-shrink-0">
            <button onClick={() => setScreen('browse')}
              className="p-2.5 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors">
              <FiX size={20} />
            </button>
            <span className="font-semibold text-lg truncate flex-1">{selectedProduct.title}</span>
            <button onClick={() => { setScreen('cart'); }}
              className="relative p-3 bg-airbnb-red rounded-xl">
              <FiShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-airbnb-red text-xs font-black rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="md:flex gap-8 p-6">
              {/* Image */}
              <div className="md:w-1/2 aspect-[3/4] bg-gray-800 rounded-2xl overflow-hidden mb-6 md:mb-0 flex-shrink-0">
                <img src={selectedProduct.image_url || `https://picsum.photos/seed/${selectedProduct.id}/600/800`}
                  alt={selectedProduct.title} className="w-full h-full object-cover" />
              </div>

              {/* Info */}
              <div className="md:w-1/2 flex flex-col gap-5">
                <div>
                  <p className="text-gray-400 text-sm mb-1">{selectedProduct.brand}</p>
                  <h2 className="text-2xl font-bold text-white leading-tight">{selectedProduct.title}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1 text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <FiStar key={i} size={14} className={i < Math.round(selectedProduct.rating) ? 'fill-current' : 'text-gray-600'} />
                      ))}
                    </div>
                    <span className="text-gray-400 text-sm">({selectedProduct.rating_count} reviews)</span>
                  </div>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-airbnb-red">{currency(selectedProduct.price)}</span>
                  {selectedProduct.original_price && (
                    <span className="text-lg text-gray-500 line-through">{currency(selectedProduct.original_price)}</span>
                  )}
                </div>

                {/* Details pills */}
                <div className="flex flex-wrap gap-2">
                  {[selectedProduct.category, selectedProduct.colour, selectedProduct.usage, selectedProduct.gender].filter(Boolean).map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-xs font-medium">{tag}</span>
                  ))}
                </div>

                {/* Size selection */}
                <div>
                  <p className="text-sm font-semibold text-gray-400 mb-2">Select Size</p>
                  <div className="flex gap-2 flex-wrap">
                    {SIZE_OPTIONS.map((s) => (
                      <button key={s} onClick={() => setSelectedSize(s)}
                        className={`w-12 h-12 rounded-xl font-bold text-sm transition-all border-2
                          ${selectedSize === s
                            ? 'bg-white text-gray-900 border-white shadow-lg scale-110'
                            : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                {selectedProduct.description && (
                  <p className="text-sm text-gray-400 leading-relaxed line-clamp-4">{selectedProduct.description}</p>
                )}

                {/* Add to cart */}
                <button
                  onClick={() => { addToCart(selectedProduct, selectedSize); setScreen('browse'); }}
                  className="w-full py-4 bg-gradient-to-r from-airbnb-red to-red-600 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 hover:from-red-600 hover:to-red-700 transition-all shadow-xl shadow-red-900/30 mt-auto">
                  <FiPlus size={22} /> Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ╔════════════════════════════════════════════════════ CART ════════╗ */}
      {screen === 'cart' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center gap-4 px-6 py-4 bg-gray-950 border-b border-gray-800 flex-shrink-0">
            <button onClick={() => setScreen('browse')} className="p-2.5 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors">
              <FiX size={20} />
            </button>
            <h2 className="text-xl font-bold flex-1">Your Cart <span className="text-gray-500 font-normal text-base">({cartCount} items)</span></h2>
          </div>

          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-500">
              <FiShoppingCart size={56} className="opacity-30" />
              <p className="text-lg">Your cart is empty</p>
              <button onClick={() => setScreen('browse')}
                className="px-6 py-3 bg-airbnb-red rounded-xl font-semibold text-white hover:bg-red-600 transition-colors">
                Browse Products
              </button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {cart.map((item) => (
                  <div key={`${item.product.id}-${item.size}`}
                    className="flex gap-4 bg-gray-900 rounded-2xl p-4 border border-gray-800">
                    <div className="w-20 h-24 bg-gray-800 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={item.product.image_url || `https://picsum.photos/seed/${item.product.id}/200/260`}
                        alt={item.product.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white line-clamp-2 text-sm leading-snug">{item.product.title}</p>
                      <p className="text-gray-500 text-xs mt-1">Size: <span className="text-gray-300 font-semibold">{item.size}</span></p>
                      <p className="text-airbnb-red font-bold mt-1">{currency(item.product.price)}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <button onClick={() => updateQty(item.product.id, item.size, -1)}
                          className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                          <FiMinus size={14} />
                        </button>
                        <span className="font-bold text-lg w-8 text-center">{item.quantity}</span>
                        <button onClick={() => updateQty(item.product.id, item.size, 1)}
                          className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                          <FiPlus size={14} />
                        </button>
                        <button onClick={() => removeFromCart(item.product.id, item.size)}
                          className="ml-auto p-2 text-gray-500 hover:text-red-400 transition-colors">
                          <FiX size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart summary */}
              <div className="flex-shrink-0 px-6 py-5 bg-gray-950 border-t border-gray-800 space-y-3">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Subtotal ({cartCount} items)</span>
                  <span className="text-white font-semibold">{currency(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>GST (18%)</span>
                  <span className="text-white font-semibold">{currency(cartTotal * 0.18)}</span>
                </div>
                <div className="flex justify-between font-bold text-xl text-white border-t border-gray-800 pt-3">
                  <span>Total</span>
                  <span className="text-airbnb-red">{currency(cartTotal * 1.18)}</span>
                </div>
                <button onClick={() => setShowPayment(true)}
                  className="w-full py-4 bg-gradient-to-r from-airbnb-red to-rose-600 rounded-2xl font-bold text-xl flex items-center justify-center gap-2 hover:from-red-600 hover:to-red-700 transition-all shadow-xl shadow-red-900/30">
                  Proceed to Pay {currency(cartTotal * 1.18)} <FiChevronRight size={22} />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ╔═══════════════════════════════════════════════ RECEIPT ══════════╗ */}
      {screen === 'receipt' && receipt && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 bg-gray-950 overflow-y-auto">
          <div className="w-full max-w-sm">
            {/* Success checkmark */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full bg-green-500/20 border-4 border-green-500 flex items-center justify-center">
                <FiCheck size={42} className="text-green-400 stroke-[3]" />
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-white mb-1">Thank You!</h2>
              <p className="text-gray-400">Your purchase is confirmed</p>
            </div>

            {/* Receipt card */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden mb-6">
              <div className="px-5 py-4 border-b border-gray-800 bg-gray-800/50">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Transaction ID</span>
                  <span className="font-mono font-bold text-green-400 text-xs">{receipt.transactionId}</span>
                </div>
                <div className="flex justify-between text-sm mt-1.5">
                  <span className="text-gray-400">Payment Method</span>
                  <span className="capitalize font-semibold text-gray-200">{receipt.method}</span>
                </div>
                <div className="flex justify-between text-sm mt-1.5">
                  <span className="text-gray-400">Date</span>
                  <span className="text-gray-200 text-xs">{receipt.paidAt.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="px-5 py-4 space-y-2">
                {receipt.items.map((item) => (
                  <div key={`${item.product.id}-${item.size}`} className="flex justify-between text-sm">
                    <span className="text-gray-300 flex-1 truncate pr-2">{item.product.title} <span className="text-gray-500">(×{item.quantity}, {item.size})</span></span>
                    <span className="font-semibold text-gray-100 flex-shrink-0">{currency(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="px-5 py-4 border-t border-gray-800 flex justify-between font-bold text-lg">
                <span className="text-white">Total Paid</span>
                <span className="text-airbnb-red">{currency(receipt.total * 1.18)}</span>
              </div>
            </div>

            <p className="text-center text-gray-500 text-sm mb-6">
              Collect your items at the counter with this receipt or show QR code at exit.
            </p>

            <button onClick={() => { setScreen('welcome'); setReceipt(null); }}
              className="w-full py-4 bg-white text-gray-900 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition-all">
              <FiRefreshCw size={18} /> Start New Session
            </button>
          </div>
        </div>
      )}

      {/* ── Payment Gateway overlay ─────────────────────────────────────── */}
      {showPayment && (
        <PaymentGateway
          amount={(cartTotal * 1.18).toFixed(2)}
          description={`${cartCount} item(s) · VIKAS Kiosk`}
          source="kiosk"
          onSuccess={(data) => { setShowPayment(false); handlePaymentSuccess(data); }}
          onClose={() => setShowPayment(false)}
        />
      )}

      {/* ── Permanent kiosk footer ─────────────────────────────────────── */}
      {screen !== 'welcome' && screen !== 'receipt' && (
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-2 bg-black/60 border-t border-gray-800">
          <span className="text-xs text-gray-600 flex items-center gap-1">
            <FiMapPin size={10} /> VIKAS In-Store Kiosk
          </span>
          <span className="text-xs text-gray-600">
            {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button onClick={() => { setScreen('welcome'); setCart([]); }}
            className="text-xs text-gray-600 hover:text-gray-300 transition-colors flex items-center gap-1">
            <FiRefreshCw size={10} /> Reset
          </button>
        </div>
      )}
    </div>
  );
}
