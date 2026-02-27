'use client';
import { useState, useEffect } from 'react';
import { FiPackage, FiClock, FiCheck, FiTruck } from 'react-icons/fi';
import api from '../../../lib/api';
import { useAuth } from '../../../lib/authContext';
import Loader from '../../../components/Loader';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function OrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders', { headers: { Authorization: `Bearer ${token}` } });
        setOrders(res.data || []);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchOrders();
  }, [token]);

  if (!token) {
    return <div className="max-w-4xl mx-auto px-4 py-16 text-center"><p>Please login to view orders</p></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {loading ? (
        <Loader label="Loading orders…" />
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <FiPackage className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-500">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColors[order.status] || 'bg-gray-100'}`}>
                  {order.status}
                </span>
              </div>
              <div className="space-y-2">
                {(order.items || []).map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={item.image_url || `https://picsum.photos/seed/${item.productId}/100/100`}
                        alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <span className="flex-1 line-clamp-1">{item.title}</span>
                    <span className="text-gray-500">×{item.quantity}</span>
                    <span className="font-medium">₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <hr className="my-3" />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>₹{parseFloat(order.total).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
