const { Reservation, Order, Store } = require('../models');

/**
 * Analytics Engine Agent
 * Provides advanced analytics insights for the admin dashboard
 */

/**
 * Get peak hour distribution for reservations
 */
const getPeakHours = async (days = 7) => {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const reservations = await Reservation.findAll();
  const recent = reservations.filter((r) => new Date(r.createdAt) >= startDate);

  const hourCounts = new Array(24).fill(0);
  recent.forEach((r) => {
    const hour = new Date(r.createdAt).getHours();
    hourCounts[hour]++;
  });

  return hourCounts.map((count, hour) => ({
    hour: `${hour.toString().padStart(2, '0')}:00`,
    count,
  }));
};

/**
 * Get category-wise sales distribution
 */
const getCategorySales = async (days = 30) => {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const orders = await Order.findAll();
  const recent = orders.filter((o) => new Date(o.createdAt) >= startDate);

  const categorySales = {};
  recent.forEach((order) => {
    (order.items || []).forEach((item) => {
      const cat = item.category || 'Unknown';
      if (!categorySales[cat]) {
        categorySales[cat] = { count: 0, revenue: 0 };
      }
      categorySales[cat].count += item.quantity;
      categorySales[cat].revenue += item.price * item.quantity;
    });
  });

  return Object.entries(categorySales)
    .map(([category, data]) => ({ category, ...data }))
    .sort((a, b) => b.revenue - a.revenue);
};

/**
 * Get store performance metrics
 */
const getStorePerformance = async () => {
  const stores = await Store.findAll();
  const reservations = await Reservation.findAll();

  const storeMetrics = stores.map((store) => {
    const storeReservations = reservations.filter((r) => r.store_id === store.id);
    const pendingReservations = storeReservations.filter((r) => r.status === 'pending').length;
    const completedReservations = storeReservations.filter((r) => r.status === 'picked_up').length;
    const totalReservations = storeReservations.length;

    return {
      storeId: store.id,
      storeName: store.name,
      location: store.location,
      totalReservations,
      pendingReservations,
      completedReservations,
      completionRate: totalReservations > 0
        ? ((completedReservations / totalReservations) * 100).toFixed(1)
        : '0.0',
    };
  });

  return storeMetrics;
};

module.exports = { getPeakHours, getCategorySales, getStorePerformance };