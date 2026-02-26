import Link from 'next/link';
import { FiGithub, FiMail, FiMapPin } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-vikas-dark text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="text-2xl font-extrabold">
              <span className="text-white">VI</span><span className="text-vikas-orange">KAS</span>
            </span>
            <p className="mt-3 text-sm leading-relaxed">Virtually Intelligent Knowledge Assisted Shopping — AI-powered omnichannel retail platform.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="hover:text-white transition">Products</Link></li>
              <li><Link href="/stores" className="hover:text-white transition">Store Locator</Link></li>
              <li><Link href="/ar" className="hover:text-white transition">AR Try-On</Link></li>
              <li><Link href="/reservation" className="hover:text-white transition">Reservations</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/orders" className="hover:text-white transition">Track Order</Link></li>
              <li><Link href="/auth" className="hover:text-white transition">My Account</Link></li>
              <li><Link href="/admin" className="hover:text-white transition">Admin Panel</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><FiMail className="w-3 h-3" /> support@vikas.com</li>
              <li className="flex items-center gap-2"><FiMapPin className="w-3 h-3" /> Mumbai, India</li>
            </ul>
          </div>
        </div>

        <hr className="border-gray-800 my-8" />

        <div className="flex flex-col md:flex-row items-center justify-between text-xs">
          <p>© 2026 VIKAS. AI for Society — EventFlex Marketplace Platform.</p>
          <p className="mt-2 md:mt-0">Built with Next.js, Node.js, PostgreSQL & Groq AI</p>
        </div>
      </div>
    </footer>
  );
}
