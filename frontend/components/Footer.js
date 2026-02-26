'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FiInstagram, FiTwitter, FiLinkedin } from 'react-icons/fi';

export default function Footer() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer className="bg-gray-950 rounded-t-[3rem] overflow-hidden relative mt-0">

      <div className="max-w-[1440px] mx-auto px-6 xl:px-12 pt-16 pb-10 relative">

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">

          {/* Brand Column */}
          <div className="col-span-2">
            <div className="flex items-center gap-1.5 mb-5">
              <span className="text-3xl font-extrabold tracking-tighter text-white">
                <span className="text-red-500">●</span> VIKAS
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs mb-6">
              Where fashion meets intelligence. AI-powered omnichannel retail — discover, try, reserve, and own.
            </p>

            {/* Live Status */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5">
              <span className="w-2 h-2 rounded-full bg-green-400" style={{ animation: 'footer-pulse 2s infinite' }} />
              <span className="text-xs text-gray-400 font-mono tracking-widest uppercase">System operational</span>
              <span className="text-xs text-gray-600 font-mono">{time}</span>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-4 mt-8">
              {[FiTwitter, FiInstagram, FiLinkedin].map((Icon, i) => (
                <button key={i} className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:border-white/30 transition-colors">
                  <Icon size={15} />
                </button>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-5">Explore</h4>
            <ul className="space-y-3">
              {[['Products', '/products'], ['Store Locator', '/stores'], ['AR Try-On', '/ar'], ['Reservations', '/reservation']].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-5">Support</h4>
            <ul className="space-y-3">
              {[['Track Order', '/orders'], ['My Account', '/auth'], ['Admin Panel', '/admin'], ['Help Center', '#']].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600 font-mono">© 2026 VIKAS — AI for Society</p>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span>Privacy</span>
            <span>·</span>
            <span>Terms</span>
            <span>·</span>
            <span className="font-mono">Next.js · PostgreSQL · Groq AI</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes footer-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </footer>
  );
}
