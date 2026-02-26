'use client';
import { useState } from 'react';
import { FiX, FiClock, FiMapPin, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { useAuth } from '../lib/authContext';

const timeSlots = [
  '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00',
  '12:00 - 13:00', '14:00 - 15:00', '15:00 - 16:00',
  '16:00 - 17:00', '17:00 - 18:00', '18:00 - 19:00',
  '19:00 - 20:00', '20:00 - 21:00',
];

export default function ReservationModal({ product, store, onClose }) {
  const { token } = useAuth();
  const [selectedSlot, setSelectedSlot] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split('T')[0];

  const handleReserve = async () => {
    if (!token) { toast.error('Please login to reserve'); return; }
    if (!selectedSlot) { toast.error('Please select a time slot'); return; }

    setLoading(true);
    try {
      const res = await api.post('/reservations/create', {
        productId: product.id,
        storeId: store.store.id,
        slot: `${dateStr} ${selectedSlot}`,
        quantity,
      }, { headers: { Authorization: `Bearer ${token}` } });

      setSuccess(res.data);
      toast.success('Reservation created!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create reservation');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold">Click & Collect Reservation</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><FiX /></button>
        </div>

        {success ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheck className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Reservation Confirmed!</h3>
            <p className="text-gray-500 mb-4">Show the QR code at the store to collect your item.</p>
            {success.qr_code && (
              <img src={success.qr_code} alt="QR Code" className="w-40 h-40 mx-auto mb-4" />
            )}
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-left space-y-1">
              <p><strong>Product:</strong> {product.title}</p>
              <p><strong>Store:</strong> {store.store?.name}</p>
              <p><strong>Slot:</strong> {`${dateStr} ${selectedSlot}`}</p>
              <p><strong>Quantity:</strong> {quantity}</p>
            </div>
            <button onClick={onClose} className="mt-6 bg-vikas-blue text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-800 transition">
              Done
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Product Info */}
            <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                <img src={product.image_url || `https://picsum.photos/seed/${product.id}/200/200`}
                  alt={product.title} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-medium text-sm line-clamp-2">{product.title}</p>
                <p className="text-vikas-blue font-bold">₹{parseFloat(product.price).toLocaleString()}</p>
              </div>
            </div>

            {/* Store */}
            <div className="flex items-center gap-2 text-sm">
              <FiMapPin className="text-vikas-blue" />
              <span className="font-medium">{store.store?.name}</span>
              <span className="text-gray-400">— {store.available} in stock</span>
            </div>

            {/* Date */}
            <div>
              <h4 className="text-sm font-medium mb-2">Pickup Date</h4>
              <div className="px-4 py-2.5 bg-gray-50 rounded-lg text-sm font-medium">
                {tomorrow.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>

            {/* Time Slots */}
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-1"><FiClock className="w-3 h-3" /> Select Time Slot</h4>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((slot) => (
                  <button key={slot} onClick={() => setSelectedSlot(slot)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border transition ${selectedSlot === slot ? 'bg-vikas-blue text-white border-vikas-blue' : 'border-gray-200 hover:border-vikas-blue'}`}>
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center border border-gray-200 rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-1.5 hover:bg-gray-50">−</button>
                <span className="px-3 text-sm">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(store.available, quantity + 1))} className="px-3 py-1.5 hover:bg-gray-50">+</button>
              </div>
            </div>

            {/* Reserve Button */}
            <button onClick={handleReserve} disabled={loading || !selectedSlot}
              className="w-full bg-vikas-orange text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50">
              {loading ? 'Reserving...' : `Reserve — ₹${(parseFloat(product.price) * quantity).toLocaleString()}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
