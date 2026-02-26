'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FiClock, FiMapPin, FiCheckCircle, FiPackage } from 'react-icons/fi';
import api from '../../../lib/api';
import { useAuth } from '../../../lib/authContext';

const statusSteps = ['pending', 'confirmed', 'ready', 'picked_up'];
const statusLabels = { pending: 'Pending', confirmed: 'Confirmed', ready: 'Ready for Pickup', picked_up: 'Picked Up', expired: 'Expired', cancelled: 'Cancelled' };
const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  ready: 'bg-green-100 text-green-800',
  picked_up: 'bg-green-100 text-green-800',
  expired: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

export default function ReservationPage() {
  const { token } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const fetch = async () => {
      try {
        const res = await api.get('/reservations', { headers: { Authorization: `Bearer ${token}` } });
        setReservations(res.data || []);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetch();
  }, [token]);

  if (!token) return <div className="max-w-4xl mx-auto px-4 py-16 text-center"><p>Please login to view reservations</p></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Reservations</h1>

      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="bg-gray-200 h-40 rounded-xl animate-pulse"></div>)}</div>
      ) : reservations.length === 0 ? (
        <div className="text-center py-16">
          <FiPackage className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No reservations yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((r) => (
            <div key={r.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold">{r.product?.title || 'Product'}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <FiMapPin className="w-3 h-3" /> {r.store?.name || 'Store'}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[r.status]}`}>
                  {statusLabels[r.status]}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <span className="flex items-center gap-1"><FiClock className="w-3 h-3" /> Slot: {r.slot}</span>
                <span>Qty: {r.quantity}</span>
              </div>

              {/* Progress Bar */}
              {!['expired', 'cancelled'].includes(r.status) && (
                <div className="flex items-center gap-1 mb-4">
                  {statusSteps.map((step, i) => {
                    const currentIdx = statusSteps.indexOf(r.status);
                    const isCompleted = i <= currentIdx;
                    return (
                      <div key={step} className="flex items-center flex-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${isCompleted ? 'bg-vikas-green text-white' : 'bg-gray-200 text-gray-400'}`}>
                          {isCompleted ? <FiCheckCircle className="w-3 h-3" /> : i + 1}
                        </div>
                        {i < statusSteps.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${i < currentIdx ? 'bg-vikas-green' : 'bg-gray-200'}`}></div>}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* QR Code */}
              {r.qr_code && r.status !== 'expired' && r.status !== 'cancelled' && (
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500 mb-2">Show this QR at the store</p>
                  <img src={r.qr_code} alt="Reservation QR" className="w-32 h-32 mx-auto" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
