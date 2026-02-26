'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '../../../lib/api';
import { useAuth } from '../../../lib/authContext';

export default function CheckoutPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    fullName: '', phone: '', street: '', city: '', state: '', pincode: '',
  });

  useEffect(() => {
    if (!token) return;
    const fetchCart = async () => {
      try {
        const res = await api.get('/cart', { headers: { Authorization: `Bearer ${token}` } });
        setCartItems(res.data.items || []);
        setTotal(parseFloat(res.data.total || 0));
      } catch (err) { console.error(err); }
    };
    fetchCart();
  }, [token]);

  const placeOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/orders', { shippingAddress: address }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Order placed successfully!');
      router.push('/orders');
    } catch (err) {
      toast.error('Failed to place order');
    } finally { setLoading(false); }
  };

  if (!token) {
    return <div className="max-w-4xl mx-auto px-4 py-16 text-center"><p>Please login to checkout</p></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <form onSubmit={placeOrder} className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="font-semibold mb-4">Shipping Address</h3>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Full Name" required value={address.fullName}
                onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                className="col-span-2 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-400 outline-none" />
              <input type="tel" placeholder="Phone" required value={address.phone}
                onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                className="col-span-2 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-400 outline-none" />
              <input type="text" placeholder="Street Address" required value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                className="col-span-2 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-400 outline-none" />
              <input type="text" placeholder="City" required value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-400 outline-none" />
              <input type="text" placeholder="State" required value={address.state}
                onChange={(e) => setAddress({ ...address, state: e.target.value })}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-400 outline-none" />
              <input type="text" placeholder="Pincode" required value={address.pincode}
                onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                className="col-span-2 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-400 outline-none" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="font-semibold mb-4">Payment Method</h3>
            <label className="flex items-center gap-3 p-3 border border-gray-800 rounded-lg bg-blue-50 cursor-pointer">
              <input type="radio" name="payment" defaultChecked className="text-red-500" />
              <div>
                <p className="font-medium">Cash on Delivery</p>
                <p className="text-sm text-gray-500">Pay when you receive your order</p>
              </div>
            </label>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-fit sticky top-20">
          <h3 className="font-semibold mb-4">Order Summary</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="line-clamp-1 flex-1">{item.product?.title} × {item.quantity}</span>
                <span className="font-medium ml-2">₹{(parseFloat(item.product?.price || 0) * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <hr className="my-3" />
          <div className="flex justify-between text-lg font-bold mb-4"><span>Total</span><span>₹{total.toLocaleString()}</span></div>
          <button type="submit" disabled={loading || cartItems.length === 0}
            className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-50">
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </form>
    </div>
  );
}
