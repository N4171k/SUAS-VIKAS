'use client';
import { useState, useEffect } from 'react';
import { FiMapPin, FiPhone, FiClock } from 'react-icons/fi';
import api from '../../../lib/api';

const defaultStores = [
  { id: 1, name: 'VIKAS Flagship - Mumbai', location: 'Mumbai', address: 'Phoenix Marketcity, LBS Road, Kurla West', city: 'Mumbai', phone: '+91 22 4000 1001', latitude: 19.0860, longitude: 72.8890 },
  { id: 2, name: 'VIKAS Store - Delhi', location: 'Delhi', address: 'Select Citywalk, Saket', city: 'New Delhi', phone: '+91 11 4000 1002', latitude: 28.5283, longitude: 77.2190 },
  { id: 3, name: 'VIKAS Store - Bangalore', location: 'Bangalore', address: 'UB City Mall, Vittal Mallya Road', city: 'Bangalore', phone: '+91 80 4000 1003', latitude: 12.9716, longitude: 77.5946 },
  { id: 4, name: 'VIKAS Store - Hyderabad', location: 'Hyderabad', address: 'Inorbit Mall, Hitech City', city: 'Hyderabad', phone: '+91 40 4000 1004', latitude: 17.4375, longitude: 78.3853 },
  { id: 5, name: 'VIKAS Store - Pune', location: 'Pune', address: 'Seasons Mall, Magarpatta', city: 'Pune', phone: '+91 20 4000 1005', latitude: 18.5146, longitude: 73.9260 },
];

export default function StoresPage() {
  const [stores, setStores] = useState(defaultStores);
  const [selectedStore, setSelectedStore] = useState(null);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Our Stores</h1>
      <p className="text-gray-500 mb-8">Find a VIKAS store near you for Click & Collect and in-store shopping.</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map((store) => (
          <div key={store.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold">{store.name}</h3>
              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">Open</span>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p className="flex items-start gap-2"><FiMapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-vikas-blue" /> {store.address}</p>
              <p className="flex items-center gap-2"><FiPhone className="w-4 h-4 flex-shrink-0 text-vikas-blue" /> {store.phone}</p>
              <p className="flex items-center gap-2"><FiClock className="w-4 h-4 flex-shrink-0 text-vikas-blue" /> 09:00 AM – 09:00 PM</p>
            </div>
            <div className="mt-4 flex gap-2">
              <a href={`https://maps.google.com/?q=${store.latitude},${store.longitude}`} target="_blank" rel="noopener noreferrer"
                className="flex-1 text-center bg-vikas-blue text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition">
                Get Directions
              </a>
              <button className="flex-1 text-center border border-vikas-blue text-vikas-blue py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition">
                View Products
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
