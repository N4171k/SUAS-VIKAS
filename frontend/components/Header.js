'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiSearch, FiMapPin, FiPackage, FiMessageCircle } from 'react-icons/fi';
import { useAuth } from '../lib/authContext';

export default function Header() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const { user, token, logout } = useAuth();

  const navLinks = [
    { href: '/products', label: 'Products' },
    { href: '/stores', label: 'Stores' },
    { href: '/ar', label: 'AR Try-On' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
      setSearchOpen(false);
    }
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-vikas-dark text-white text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <p>🎉 Festival Sale Live — Up to 50% Off on Selected Items!</p>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/stores" className="flex items-center gap-1 hover:text-vikas-orange"><FiMapPin className="w-3 h-3" /> Find Store</Link>
            <Link href="/orders" className="flex items-center gap-1 hover:text-vikas-orange"><FiPackage className="w-3 h-3" /> Track Order</Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-extrabold">
              <span className="text-vikas-blue">VI</span><span className="text-vikas-orange">KAS</span>
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="flex w-full">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands, categories..."
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-l-lg focus:ring-2 focus:ring-vikas-blue focus:border-transparent outline-none text-sm" />
              <button type="submit" className="bg-vikas-blue text-white px-5 py-2.5 rounded-r-lg hover:bg-blue-800 transition">
                <FiSearch className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Nav Links - Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${pathname === link.href ? 'text-vikas-blue bg-blue-50' : 'text-gray-600 hover:text-vikas-blue hover:bg-gray-50'}`}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button onClick={() => setSearchOpen(!searchOpen)} className="md:hidden p-2 text-gray-600 hover:text-vikas-blue">
              <FiSearch className="w-5 h-5" />
            </button>

            <Link href="/cart" className="relative p-2 text-gray-600 hover:text-vikas-blue">
              <FiShoppingCart className="w-5 h-5" />
            </Link>

            {token ? (
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                  <FiUser className="w-4 h-4" />
                  <span className="hidden md:inline">{user?.name?.split(' ')[0]}</span>
                </button>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link href="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Orders</Link>
                  <Link href="/reservation" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Reservations</Link>
                  {(user?.role === 'store_admin' || user?.role === 'super_admin') && (
                    <Link href="/admin" className="block px-4 py-2 text-sm text-vikas-blue font-medium hover:bg-blue-50">Admin Dashboard</Link>
                  )}
                  <hr className="my-1" />
                  <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Logout</button>
                </div>
              </div>
            ) : (
              <Link href="/auth" className="bg-vikas-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition">
                Login
              </Link>
            )}

            <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2">
              {mobileMenu ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {searchOpen && (
          <form onSubmit={handleSearch} className="md:hidden pb-3">
            <div className="flex">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..." autoFocus
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-l-lg outline-none text-sm" />
              <button type="submit" className="bg-vikas-blue text-white px-5 rounded-r-lg">
                <FiSearch className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Mobile Menu */}
        {mobileMenu && (
          <nav className="md:hidden pb-4 border-t border-gray-100 pt-3">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setMobileMenu(false)}
                  className={`block px-4 py-2.5 rounded-lg text-sm font-medium ${pathname === link.href ? 'text-vikas-blue bg-blue-50' : 'text-gray-600 hover:bg-gray-50'}`}>
                  {link.label}
                </Link>
              ))}
              <Link href="/reservation" onClick={() => setMobileMenu(false)} className="block px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Reservations</Link>
              <Link href="/orders" onClick={() => setMobileMenu(false)} className="block px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Orders</Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
