'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FiShoppingBag, FiTrendingUp, FiMapPin, FiZap, FiArrowRight } from 'react-icons/fi';
import api from '../../lib/api';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get('/products?limit=8&sort=rating&order=DESC'),
          api.get('/products/meta/categories'),
        ]);
        setFeaturedProducts(productsRes.data.products || []);
        setCategories(categoriesRes.data || []);
      } catch (err) {
        console.error('Failed to fetch homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const features = [
    { icon: <FiZap className="w-8 h-8" />, title: 'AI Shopping Assistant', desc: 'Get personalized recommendations powered by AI' },
    { icon: <FiMapPin className="w-8 h-8" />, title: 'Click & Collect', desc: 'Reserve online, pick up at your nearest store' },
    { icon: <FiTrendingUp className="w-8 h-8" />, title: 'Real-Time Inventory', desc: 'Live stock updates across all stores' },
    { icon: <FiShoppingBag className="w-8 h-8" />, title: 'AR Try-On', desc: 'Try products virtually before you buy' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-vikas-dark via-vikas-blue to-vikas-dark text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-30"></div>
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 pulse-live"></span>
              <span className="text-sm">AI-Powered Event Commerce Platform</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              Smart Shopping with <span className="gradient-text bg-gradient-to-r from-vikas-orange to-yellow-400 text-transparent bg-clip-text">VIKAS</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl">
              Virtually Intelligent Knowledge Assisted Shopping — AI recommendations, real-time inventory, AR try-on, and click & collect. All in one platform.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/products" className="inline-flex items-center bg-vikas-orange hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-all hover:scale-105">
                Shop Now <FiArrowRight className="ml-2" />
              </Link>
              <Link href="/stores" className="inline-flex items-center bg-white/10 hover:bg-white/20 backdrop-blur text-white px-8 py-3 rounded-lg font-semibold transition-all border border-white/20">
                Find Stores <FiMapPin className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100">
              <div className="text-vikas-blue mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
        <div className="flex flex-wrap gap-3">
          {categories.slice(0, 12).map((cat) => (
            <Link key={cat} href={`/products?category=${encodeURIComponent(cat)}`}
              className="px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium hover:bg-vikas-blue hover:text-white hover:border-vikas-blue transition-all">
              {cat}
            </Link>
          ))}
        </div>
      </section>

      {/* Shop by Gender */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Shop by Gender</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {['Men', 'Women', 'Boys', 'Girls', 'Unisex'].map((g) => (
            <Link key={g} href={`/products?gender=${g}`}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-md hover:border-vikas-orange transition-all">
              <p className="text-lg font-semibold">{g}</p>
              <p className="text-xs text-gray-400 mt-1">View Collection</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Shop by Type */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Popular Styles</h2>
        <div className="flex flex-wrap gap-3">
          {['Topwear', 'Bottomwear', 'Shoes', 'Dress', 'Flip Flops', 'Sandal', 'Socks', 'Innerwear'].map((sub) => (
            <Link key={sub} href={`/products?sub_category=${encodeURIComponent(sub)}`}
              className="px-5 py-2.5 bg-gradient-to-r from-vikas-orange/10 to-vikas-blue/10 border border-gray-200 rounded-full text-sm font-medium hover:from-vikas-orange hover:to-vikas-orange hover:text-white transition-all">
              {sub}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Top Rated Products</h2>
          <Link href="/products" className="text-vikas-blue hover:underline font-medium flex items-center">
            View All <FiArrowRight className="ml-1" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-3"></div>
                <div className="bg-gray-200 h-4 w-3/4 rounded mb-2"></div>
                <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredProducts.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`}
                className="product-card bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all border border-gray-100">
                <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                  <img src={product.image_url || `https://picsum.photos/seed/${product.id}/400/400`}
                    alt={product.title} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-sm font-medium line-clamp-2 mb-1">{product.title}</h3>
                <div className="flex items-center gap-1 text-xs text-yellow-500 mb-1">
                  {'★'.repeat(Math.round(product.rating))} <span className="text-gray-400">({product.rating_count})</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-vikas-dark">₹{parseFloat(product.price).toLocaleString()}</span>
                  {product.original_price && (
                    <span className="text-xs text-gray-400 line-through">₹{parseFloat(product.original_price).toLocaleString()}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-vikas-blue to-vikas-dark text-white py-16 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience Smart Shopping?</h2>
          <p className="text-gray-300 mb-8">Join VIKAS and get AI-powered recommendations, real-time inventory tracking, and seamless click & collect.</p>
          <Link href="/auth" className="inline-flex items-center bg-vikas-orange hover:bg-orange-600 px-8 py-3 rounded-lg font-semibold transition-all hover:scale-105">
            Get Started Free <FiArrowRight className="ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
}
