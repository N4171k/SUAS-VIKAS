'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, User, Menu, X, Search, LogOut, Package, BookMarked, Sparkles, Settings } from 'lucide-react';
import { useAuth } from '../lib/authContext';

const NAV_LINKS = [
  { label: 'Products', href: '/products' },
  { label: 'Stores', href: '/stores' },
  { label: 'AR Try-On', href: '/ar' },
];

const CATEGORIES = ['New Arrivals', 'Apparel', 'Footwear', 'Accessories', 'Sportswear', 'Vintage'];

export default function Header() {
  const { user, token, logout } = useAuth();
  const router = useRouter();

  const [scrolled, setScrolled] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  /* â”€â”€ Scroll Effect â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* â”€â”€ Close Dropdowns on Outside Click â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  useEffect(() => {
    const close = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  /* â”€â”€ Handle Search Submit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleNavClick = () => {
    setMobileOpen(false);
    setUserOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-white/80 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-12">

          {/* â”€â”€ Primary Row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="flex items-center justify-between h-16 gap-4">

            {/* Logo */}
            <Link href="/" onClick={handleNavClick} className="flex-shrink-0">
              <span className="text-xl font-extrabold tracking-tighter text-gray-900">
                <span className="text-red-500">â—</span> VIKAS
              </span>
            </Link>

            {/* Center Nav â€” Desktop */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ label, href }) => (
                <Link key={href} href={href}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                  {label}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">

              {/* Search */}
              <div ref={searchRef} className="relative">
                <button onClick={() => setSearchOpen((v) => !v)}
                  className="p-2.5 hover:bg-gray-100 rounded-full transition-colors text-gray-600" aria-label="Search">
                  <Search size={18} />
                </button>
                {searchOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 z-50">
                    <form onSubmit={handleSearch} className="flex items-center gap-2">
                      <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-gray-400 transition-colors">
                        <Search size={14} className="text-gray-400 flex-shrink-0" />
                        <input autoFocus type="text" value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search products, brandsâ€¦"
                          className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder-gray-400" />
                      </div>
                      <button type="submit"
                        className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors">
                        Go
                      </button>
                    </form>
                    <div className="mt-2 flex flex-wrap gap-1.5 pt-2 border-t border-gray-100">
                      {['Tops', 'Shoes', 'Dresses', 'Jackets'].map((q) => (
                        <button key={q} onClick={() => { router.push(`/products?q=${q}`); setSearchOpen(false); }}
                          className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600 hover:bg-gray-200 transition-colors">
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Cart */}
              <Link href="/cart" className="p-2.5 hover:bg-gray-100 rounded-full transition-colors text-gray-600" aria-label="Cart">
                <ShoppingCart size={18} />
              </Link>

              {/* Ask AI shortcut */}
              <button onClick={() => document.getElementById('vikas-chat-btn')?.click()}
                className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white rounded-full text-xs font-bold hover:bg-red-600 transition-colors">
                <Sparkles size={13} /> Ask AI
              </button>

              {/* User Menu */}
              <div ref={userMenuRef} className="relative ml-1">
                <button onClick={() => setUserOpen((v) => !v)}
                  className="flex items-center gap-2 border border-gray-200 rounded-full px-3 py-1.5 hover:shadow-md transition-shadow bg-white">
                  <Menu size={15} className="text-gray-500" />
                  <div className="w-7 h-7 bg-gray-800 text-white rounded-full flex items-center justify-center overflow-hidden">
                    {token && user?.name
                      ? <span className="text-xs font-bold">{user.name[0].toUpperCase()}</span>
                      : <User size={14} fill="white" />}
                  </div>
                </button>

                {userOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-[0_6px_24px_rgba(0,0,0,0.12)] border border-gray-100 py-1.5 z-50">
                    {token ? (
                      <>
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="font-semibold text-sm text-gray-900">{user?.name?.split(' ')[0]}</p>
                          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                        </div>
                        <Link href="/orders" onClick={handleNavClick} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                          <Package size={14} className="text-gray-400" /> My Orders
                        </Link>
                        <Link href="/reservation" onClick={handleNavClick} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                          <BookMarked size={14} className="text-gray-400" /> Reservations
                        </Link>
                        <Link href="/profile" onClick={handleNavClick} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                          <Settings size={14} className="text-gray-400" /> Preferences
                        </Link>
                        {(user?.role === 'store_admin' || user?.role === 'super_admin') && (
                          <Link href="/admin" onClick={handleNavClick} className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50">
                            <Sparkles size={14} /> Admin Panel
                          </Link>
                        )}
                        <div className="h-px bg-gray-100 my-1" />
                        <button onClick={() => { logout(); setUserOpen(false); }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50">
                          <LogOut size={14} className="text-gray-400" /> Log out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link href="/auth?mode=signup" onClick={handleNavClick} className="flex px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50">Sign up</Link>
                        <Link href="/auth?mode=login" onClick={handleNavClick} className="flex px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">Log in</Link>
                        <div className="h-px bg-gray-100 my-1" />
                        <Link href="/stores" onClick={handleNavClick} className="flex px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">Find Stores</Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Burger */}
              <button onClick={() => setMobileOpen((v) => !v)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors ml-1">
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* â”€â”€ Category Strip â€” Desktop â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="hidden md:flex items-center gap-8 pb-3 border-t border-gray-100 pt-2 overflow-x-auto no-scrollbar">
            {CATEGORIES.map((cat) => (
              <Link key={cat} href={`/products?category=${encodeURIComponent(cat)}`}
                className="text-xs font-medium text-gray-500 hover:text-gray-900 whitespace-nowrap pb-1 border-b-2 border-transparent hover:border-gray-800 transition-colors">
                {cat}
              </Link>
            ))}
          </div>
        </div>

        {/* â”€â”€ Mobile Menu â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg px-4 py-4 space-y-1">
            {NAV_LINKS.map(({ label, href }) => (
              <Link key={href} href={href} onClick={handleNavClick}
                className="flex items-center px-3 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-xl">
                {label}
              </Link>
            ))}
            <div className="h-px bg-gray-100 my-2" />
            <Link href="/cart" onClick={handleNavClick}
              className="flex items-center gap-2 px-3 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-xl">
              <ShoppingCart size={16} /> Cart
            </Link>
            {token ? (
              <>
                <Link href="/orders" onClick={handleNavClick}
                  className="flex items-center gap-2 px-3 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-xl">
                  <Package size={16} /> My Orders
                </Link>
                <button onClick={() => { logout(); handleNavClick(); }}
                  className="flex items-center gap-2 px-3 py-3 text-base font-medium text-red-500 hover:bg-red-50 rounded-xl w-full text-left">
                  <LogOut size={16} /> Log out
                </button>
              </>
            ) : (
              <Link href="/auth" onClick={handleNavClick}
                className="flex px-3 py-3 text-base font-semibold text-red-500 hover:bg-red-50 rounded-xl">
                Sign in
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Spacer â€” prevents content hiding under fixed header */}
      <div className="h-[4.75rem] md:h-[6.5rem]" aria-hidden />
    </>
  );
}
