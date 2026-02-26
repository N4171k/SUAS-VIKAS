'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FiShoppingBag, FiTrendingUp, FiMapPin, FiZap, FiArrowRight, FiHeart } from 'react-icons/fi';
import api from '../../lib/api';
import { useAuth } from '../../lib/authContext';
import ProductCard from '../../components/ProductCard';

export default function HomePage() {
  const { user } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsMeta, setSuggestionsMeta] = useState(null);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get('/products?limit=8&sort=rating&order=DESC'),
          api.get('/products/meta/categories'),
        ]);
        setFeaturedProducts(productsRes.data.products || []);
        const cats = categoriesRes.data || [];
        setCategories(cats.length > 0 ? cats : ['Apparel', 'Footwear', 'Accessories', 'Sporting Goods']);
      } catch (err) {
        console.error('Failed to fetch homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch RAG-powered personalized recommendations when user is logged in
  useEffect(() => {
    if (!user) { setSuggestions([]); setSuggestionsMeta(null); return; }
    const fetchRecs = async () => {
      setSuggestionsLoading(true);
      setSuggestionsError(null);
      try {
        const res = await api.get('/recommendations?limit=8');
        setSuggestions(res.data.products || []);
        setSuggestionsMeta(res.data.meta || null);
      } catch (err) {
        console.error('Recommendations error:', err.response?.data || err.message);
        setSuggestionsError(err.response?.data?.error || 'Could not load recommendations');
      } finally {
        setSuggestionsLoading(false);
      }
    };
    fetchRecs();
  }, [user]);

  const features = [
    { icon: <FiZap className="w-6 h-6" />, title: 'AI Shopping Assistant', desc: 'Get personalized recommendations powered by AI' },
    { icon: <FiMapPin className="w-6 h-6" />, title: 'Click & Collect', desc: 'Reserve online, pick up at your nearest store' },
    { icon: <FiTrendingUp className="w-6 h-6" />, title: 'Real-Time Inventory', desc: 'Live stock updates across all stores' },
    { icon: <FiShoppingBag className="w-6 h-6" />, title: 'AR Try-On', desc: 'Try products virtually before you buy' },
  ];

  return (
    <div className="bg-[#F7F7F7] min-h-screen pb-20">
      
      {/* Modern Hero Section - Airbnb Style */}
      <section className="relative pt-32 pb-20 px-6 xl:px-12 max-w-[1440px] mx-auto">
        <div className="bg-white rounded-3xl p-8 md:p-16 shadow-xl overflow-hidden relative">
          
          {/* Background Decorative Blob */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-pink-100 to-purple-100 rounded-bl-full opacity-60 -z-10 blur-3xl"></div>
          
          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center bg-gray-100 rounded-full px-4 py-1.5 mb-8 border border-gray-200">
              <span className="w-2 h-2 bg-airbnb-red rounded-full mr-2 animate-pulse"></span>
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-800">New Collection 2026</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-gray-900 leading-[1.1]">
              Discover <br />
              <span className="text-airbnb-red">Future Fashion</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-500 mb-10 leading-relaxed max-w-lg">
              Experience the next generation of retail with AI-powered insights, AR try-ons, and instant store reservations.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link href="/products" className="btn-primary shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all transform">
                Explore Collection
              </Link>
              <Link href="/ar" className="px-8 py-3.5 rounded-xl font-semibold border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-gray-900 bg-white shadow-sm">
                Try AR Experience
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Claymorphism Cards */}
      <section className="px-6 xl:px-12 max-w-[1440px] mx-auto py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="clay-card p-8 flex flex-col items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center text-airbnb-red">
                {f.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories - Horizontal Scroll / Pills */}
      <section className="px-6 xl:px-12 max-w-[1440px] mx-auto py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Explore by Category</h2>
          <div className="hidden md:flex gap-2">
             <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:shadow-md transition-shadow">
               <FiArrowRight className="rotate-180" />
             </button>
             <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:shadow-md transition-shadow">
               <FiArrowRight />
             </button>
          </div>
        </div>
        
        <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
          {categories.slice(0, 10).map((cat, i) => (
            <Link key={cat} href={`/products?category=${encodeURIComponent(cat)}`}
              className="flex-shrink-0 group">
              <div className="w-40 h-40 rounded-2xl bg-gray-100 mb-3 overflow-hidden relative">
                 <img 
                   src={`https://source.unsplash.com/random/300x300/?fashion,${cat}`} 
                   alt={cat}
                   className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                   loading="lazy"
                 />
                 <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-airbnb-red transition-colors">{cat}</h3>
            </Link>
          ))}
        </div>
      </section>
      
      {/* Personalized "For You" Section — RAG-powered, shown only when logged in */}
      {user && (
        <section className="px-6 xl:px-12 max-w-[1440px] mx-auto py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FiHeart className="text-airbnb-red w-5 h-5" />
                <span className="text-sm font-semibold text-airbnb-red uppercase tracking-widest">Picked for You</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                Hi {user.name?.split(' ')[0]}, here&apos;s your personalised picks
              </h2>
              {suggestionsMeta && (
                <p className="text-sm text-gray-500 mt-1.5 flex flex-wrap items-center gap-2">
                  {suggestionsMeta.clothing_sizes?.length > 0 && (
                    <span className="inline-flex items-center gap-1 bg-gray-100 px-2.5 py-0.5 rounded-full text-xs font-medium text-gray-700">
                      👕 Sizes: {suggestionsMeta.clothing_sizes.join(', ')}
                    </span>
                  )}
                  {user.favourite_colors?.slice(0,3).map((c) => (
                    <span key={c} className="inline-flex items-center gap-1 bg-gray-100 px-2.5 py-0.5 rounded-full text-xs font-medium text-gray-700">
                      🎨 {c}
                    </span>
                  ))}
                  {user.style_preferences?.slice(0,2).map((s) => (
                    <span key={s} className="inline-flex items-center gap-1 bg-red-50 px-2.5 py-0.5 rounded-full text-xs font-medium text-airbnb-red border border-red-100">
                      {s}
                    </span>
                  ))}
                </p>
              )}
            </div>
            <div className="hidden md:flex items-center gap-3">
              {!suggestionsLoading && suggestionsMeta && (
                <span className="text-xs text-gray-400">{suggestionsMeta.total} picks</span>
              )}
              <Link href="/products" className="flex items-center gap-1 text-sm font-semibold text-airbnb-red hover:underline">
                See all <FiArrowRight />
              </Link>
            </div>
          </div>

          {suggestionsLoading ? (
            <div className="grid grid-cols-1 sc-sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-xl aspect-[3/4] mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : suggestionsError ? (
            <div className="clay-card p-10 text-center text-gray-500">
              <p className="text-base font-medium mb-2 text-red-500">⚠ Could not load recommendations</p>
              <p className="text-sm mb-4">{suggestionsError}</p>
              <Link href="/profile" className="text-airbnb-red font-semibold hover:underline text-sm">Update preferences →</Link>
            </div>
          ) : suggestions.length > 0 ? (
            <div className="grid grid-cols-1 sc-sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
              {suggestions.map((product) => (
                <div key={product.id} className="relative">
                  <ProductCard product={product} />
                  {product._match_reasons?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 px-1">
                      {product._match_reasons.slice(0, 2).map((r) => (
                        <span key={r} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-airbnb-red border border-red-100 leading-none">
                          ✓ {r}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="clay-card p-10 text-center text-gray-500">
              <p className="text-lg font-medium mb-2">No personalised picks yet</p>
              <p className="text-sm">Set your size, colours &amp; styles so we can curate your feed.</p>
              <Link href="/profile" className="mt-4 inline-block text-airbnb-red font-semibold hover:underline text-sm">
                Update preferences →
              </Link>
            </div>
          )}
        </section>
      )}

      {/* Featured Products Grid */}
      <section className="px-6 xl:px-12 max-w-[1440px] mx-auto py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Top Rated <span className="text-airbnb-red">Experiences</span></h2>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sc-sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-xl aspect-[3/4] mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sc-sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        
        <div className="mt-16 text-center">
          <Link href="/products" className="inline-block px-8 py-4 border border-black rounded-lg text-black font-semibold hover:bg-black hover:text-white transition-all text-lg tracking-wide">
            Show all products
          </Link>
        </div>
      </section>

      {/* Modern Banner CTA */}
      <section className="px-6 xl:px-12 max-w-[1440px] mx-auto py-16">
        <div className="relative rounded-3xl overflow-hidden bg-black text-white p-12 md:p-24 text-center">
            {/* Abstract visual */}
            <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-gradient-to-r from-purple-900 to-pink-900"></div>
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-bold mb-6">Become a Store Partner</h2>
              <p className="text-xl text-gray-300 mb-10">
                Earn extra income and unlock new opportunities by listing your inventory on VIKAS.
              </p>
              <Link href="/auth?mode=signup" className="bg-gradient-to-r from-airbnb-red to-rose-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:scale-105 transition-all inline-block">
                Get Started
              </Link>
            </div>
        </div>
      </section>
    </div>
  );
}
