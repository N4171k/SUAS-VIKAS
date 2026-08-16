const { Order, Reservation, Product, User, Store } = require('../models');

/**
 * Get dashboard analytics overview
 */
const getDashboardAnalytics = async () => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

  // Total counts
  const [totalUsers, totalProducts, totalOrders, totalReservations] = await Promise.all([
    User.count(),
    Product.count(),
    Order.count(),
    Reservation.count(),
  ]);

  // All orders & reservations (needed for date-based aggregations)
  const [allOrders, allReservations] = await Promise.all([
    Order.findAll(),
    Reservation.findAll(),
  ]);

  // Today's metrics
  const todayOrders = allOrders.filter((o) => new Date(o.createdAt) >= todayStart).length;
  const todayReservations = allReservations.filter((r) => new Date(r.createdAt) >= todayStart).length;

  // Revenue
  const totalRevenue = allOrders.reduce((s, o) => s + parseFloat(o.total || 0), 0);
  const weekOrders = allOrders.filter((o) => new Date(o.createdAt) >= weekAgo);
  const weekRevenue = weekOrders.reduce((s, o) => s + parseFloat(o.total || 0), 0);

  // Reservation status breakdown
  const reservationsByStatusMap = {};
  allReservations.forEach((r) => {
    const s = r.status || 'unknown';
    reservationsByStatusMap[s] = (reservationsByStatusMap[s] || 0) + 1;
  });
  const reservationsByStatus = Object.entries(reservationsByStatusMap).map(([status, count]) => ({ status, count }));

  // Top categories
  const products = await Product.scanAllForAnalytics();
  const categoryCounts = {};
  products.forEach((p) => {
    if (!p.category) return;
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  });
  const topCategories = Object.entries(categoryCounts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Active reservations per store
  const activeReservations = allReservations.filter((r) => ['pending', 'confirmed', 'ready'].includes(r.status));
  const perStoreMap = {};
  for (const r of activeReservations) {
    if (!perStoreMap[r.store_id]) {
      const store = await Store.findById(r.store_id);
      perStoreMap[r.store_id] = { storeId: r.store_id, storeName: store?.name || r.store_id, count: 0 };
    }
    perStoreMap[r.store_id].count++;
  }
  const activeReservationsPerStore = Object.values(perStoreMap);

  return {
    overview: {
      totalUsers,
      totalProducts,
      totalOrders,
      totalReservations,
      todayOrders,
      todayReservations,
      totalRevenue: totalRevenue.toFixed(2),
      weekRevenue: weekRevenue.toFixed(2),
    },
    reservationsByStatus,
    topCategories,
    activeReservationsPerStore,
  };
};

/**
 * Get sales data for a period
 */
const getSalesData = async (period = '7d') => {
  const days = parseInt(period) || 7;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const orders = await Order.findAll();
  const recent = orders
    .filter((o) => new Date(o.createdAt) >= startDate)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const byDate = {};
  recent.forEach((o) => {
    const date = new Date(o.createdAt).toISOString().slice(0, 10);
    if (!byDate[date]) byDate[date] = { orderCount: 0, revenue: 0 };
    byDate[date].orderCount++;
    byDate[date].revenue += parseFloat(o.total || 0);
  });

  return {
    period: `${days} days`,
    data: Object.entries(byDate).map(([date, d]) => ({
      date,
      orderCount: d.orderCount,
      revenue: d.revenue.toFixed(2),
    })),
  };
};

module.exports = { getDashboardAnalytics, getSalesData };