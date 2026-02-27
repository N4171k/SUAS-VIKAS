'use client';
import { useState, useEffect } from 'react';
import { FiUsers, FiPackage, FiShoppingCart, FiMapPin, FiTrendingUp, FiCalendar, FiDollarSign, FiBarChart2 } from 'react-icons/fi';
import api from '../../../lib/api';
import { useAuth } from '../../../lib/authContext';
import Loader from '../../../components/Loader';

export default function AdminPage() {
  const { token, user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!token) return;
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/admin/analytics', { headers: { Authorization: `Bearer ${token}` } });
        setAnalytics(res.data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchAnalytics();
  }, [token]);

  if (!token || (user?.role !== 'store_admin' && user?.role !== 'super_admin')) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 text-lg">Admin access required</p>
        <p className="text-sm text-gray-400 mt-2">Login with an admin account to access the dashboard</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FiBarChart2 /> },
    { id: 'reservations', label: 'Reservations', icon: <FiCalendar /> },
    { id: 'sales', label: 'Sales', icon: <FiDollarSign /> },
  ];

  const stats = analytics?.overview ? [
    { label: 'Total Users', value: analytics.overview.totalUsers, icon: <FiUsers />, color: 'bg-blue-500' },
    { label: 'Total Products', value: analytics.overview.totalProducts, icon: <FiPackage />, color: 'bg-purple-500' },
    { label: 'Total Orders', value: analytics.overview.totalOrders, icon: <FiShoppingCart />, color: 'bg-green-500' },
    { label: 'Reservations', value: analytics.overview.totalReservations, icon: <FiMapPin />, color: 'bg-orange-500' },
    { label: 'Today Orders', value: analytics.overview.todayOrders, icon: <FiTrendingUp />, color: 'bg-indigo-500' },
    { label: 'Total Revenue', value: `₹${parseFloat(analytics.overview.totalRevenue || 0).toLocaleString()}`, icon: <FiDollarSign />, color: 'bg-emerald-500' },
  ] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm">VIKAS Analytics & Management</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full pulse-live"></span>
          <span className="text-sm text-gray-500">Live</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-8 w-fit">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === tab.id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader label="Loading dashboard…" />
      ) : (
        <>
          {activeTab === 'overview' && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`${stat.color} text-white p-2. rounded-lg`}>{stat.icon}</div>
                      <span className="text-sm text-gray-500">{stat.label}</span>
                    </div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Charts Area */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Reservation Status */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="font-semibold mb-4">Reservations by Status</h3>
                  <div className="space-y-3">
                    {(analytics?.reservationsByStatus || []).map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm capitalize text-gray-600">{item.status}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gray-900 rounded-full" style={{ width: `${Math.min(100, (item.count / Math.max(...(analytics?.reservationsByStatus || []).map(r => r.count), 1)) * 100)}%` }}></div>
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Categories */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="font-semibold mb-4">Top Categories</h3>
                  <div className="space-y-3">
                    {(analytics?.topCategories || []).slice(0, 8).map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{item.category}</span>
                        <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Reservations per Store */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm md:col-span-2">
                  <h3 className="font-semibold mb-4">Active Reservations per Store</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {(analytics?.activeReservationsPerStore || []).map((item, i) => (
                      <div key={i} className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-500">{item.count}</p>
                        <p className="text-xs text-gray-500 mt-1">{item.storeName}</p>
                      </div>
                    ))}
                    {(analytics?.activeReservationsPerStore || []).length === 0 && (
                      <p className="text-gray-400 text-sm col-span-full text-center py-4">No active reservations</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'reservations' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold mb-4">Recent Reservations</h3>
              <p className="text-gray-500 text-sm">Reservation management coming soon. View analytics in the Overview tab.</p>
            </div>
          )}

          {activeTab === 'sales' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold mb-4">Sales Analytics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-700">₹{parseFloat(analytics?.overview?.totalRevenue || 0).toLocaleString()}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-500">This Week</p>
                  <p className="text-2xl font-bold text-red-500">₹{parseFloat(analytics?.overview?.weekRevenue || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
