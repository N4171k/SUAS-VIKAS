'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../../lib/api';
import { useAuth } from '../../../lib/authContext';

export default function CartPage() {
  const { token } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    if (!token) { setLoading(false); return; }
    try {
      const res = await api.get('/cart', { headers: { Authorization: `Bearer ${token}` } });
      setCartItems(res.data.items || []);
      setTotal(parseFloat(res.data.total || 0));
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchCart(); }, [token]);

  const updateQuantity = async (itemId, newQty) => {
    try {
      await api.put(`/cart/${itemId}`, { quantity: newQty }, { headers: { Authorization: `Bearer ${token}` } });
      fetchCart();
    } catch (err) { toast.error('Failed to update'); }
  };

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/cart/${itemId}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Removed from cart');
      fetchCart();
    } catch (err) { toast.error('Failed to remove'); }
  };

  if (!token) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <FiShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Please login to view your cart</h2>
        <Link href="/auth" className="text-vikas-blue hover:underline">Login here</Link>
      </div>
    );
  }

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-8"><div className="animate-pulse space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="bg-gray-200 h-24 rounded-xl"></div>)}</div></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart ({cartItems.length} items)</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-16">
          <FiShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <Link href="/products" className="bg-vikas-blue text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={item.product?.image_url || `https://picsum.photos/seed/${item.product_id}/200/200`}
                    alt={item.product?.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <Link href={`/product/${item.product_id}`} className="font-medium text-sm hover:text-vikas-blue line-clamp-2">
                    {item.product?.title}
                  </Link>
                  <p className="text-lg font-bold mt-1">₹{parseFloat(item.product?.price || 0).toLocaleString()}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 hover:bg-gray-50"><FiMinus className="w-3 h-3" /></button>
                      <span className="px-3 text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 hover:bg-gray-50"><FiPlus className="w-3 h-3" /></button>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 p-1"><FiTrash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">₹{(parseFloat(item.product?.price || 0) * item.quantity).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-fit sticky top-20">
            <h3 className="font-semibold mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>₹{total.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span className="text-green-600">Free</span></div>
              <hr className="my-3" />
              <div className="flex justify-between text-lg font-bold"><span>Total</span><span>₹{total.toLocaleString()}</span></div>
            </div>
            <Link href="/checkout" className="block w-full bg-vikas-orange text-white py-3 rounded-lg font-semibold text-center hover:bg-orange-600 transition mt-4">
              Proceed to Checkout
            </Link>
            <Link href="/products" className="block text-center text-sm text-vikas-blue hover:underline mt-3">
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
