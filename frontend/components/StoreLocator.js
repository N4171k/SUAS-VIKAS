'use client';
import { useState } from 'react';
import { FiMapPin, FiSearch, FiPhone, FiClock, FiNavigation } from 'react-icons/fi';

const defaultStores = [
  { id: 1, name: 'VIKAS Flagship - Mumbai', address: 'Phoenix Palladium, Lower Parel, Mumbai 400013', phone: '+91 22 4000 1111', lat: 18.9952, lng: 72.8258, hours: '10:00 AM – 10:00 PM' },
  { id: 2, name: 'VIKAS Premium - Delhi', address: 'Select Citywalk, Saket, New Delhi 110017', phone: '+91 11 4000 2222', lat: 28.5286, lng: 77.2183, hours: '10:00 AM – 9:30 PM' },
  { id: 3, name: 'VIKAS Experience - Bangalore', address: 'Orion Mall, Rajajinagar, Bangalore 560055', phone: '+91 80 4000 3333', lat: 13.0112, lng: 77.5556, hours: '10:00 AM – 10:00 PM' },
  { id: 4, name: 'VIKAS Hub - Hyderabad', address: 'Inorbit Mall, Madhapur, Hyderabad 500081', phone: '+91 40 4000 4444', lat: 17.4353, lng: 78.3846, hours: '10:30 AM – 9:30 PM' },
  { id: 5, name: 'VIKAS Mall Store - Pune', address: 'Phoenix Marketcity, Viman Nagar, Pune 411014', phone: '+91 20 4000 5555', lat: 18.5621, lng: 73.9179, hours: '10:00 AM – 10:00 PM' },
];

export default function StoreLocator({ stores: propStores, onSelectStore }) {
  const storeList = propStores || defaultStores;
  const [search, setSearch] = useState('');

  const filtered = storeList.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Search */}
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search stores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-vikas-blue"
          />
        </div>
      </div>

      {/* Store List */}
      <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No stores found</div>
        ) : (
          filtered.map((store) => (
            <div key={store.id} className="p-4 hover:bg-gray-50 transition cursor-pointer group"
              onClick={() => onSelectStore?.(store)}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-vikas-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiMapPin className="text-vikas-blue" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm group-hover:text-vikas-blue transition">{store.name}</h4>
                  <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{store.address}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><FiPhone className="w-3 h-3" />{store.phone}</span>
                    <span className="flex items-center gap-1"><FiClock className="w-3 h-3" />{store.hours}</span>
                  </div>
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 rounded-lg hover:bg-vikas-blue/10 text-vikas-blue transition"
                  title="Get Directions"
                >
                  <FiNavigation className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
