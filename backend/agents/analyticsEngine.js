const { Op, fn, col, literal } = require('sequelize');
const { Reservation, Order, Product, Store } = require('../models');

/**
 * Analytics Engine Agent
 * Provides advanced analytics insights for the admin dashboard
 */

/**
 * Get peak hour distribution for reservations
 */
const getPeakHours = async (days = 7) => {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const reservations = await Reservation.findAll({
    where: { created_at: { [Op.gte]: startDate } },
    attributes: ['created_at'],
  });

  const hourCounts = new Array(24).fill(0);
  reservations.forEach((r) => {
    const hour = new Date(r.created_at).getHours();
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

  const orders = await Order.findAll({
    where: { created_at: { [Op.gte]: startDate } },
  });

  const categorySales = {};
  orders.forEach((order) => {
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

  const storeMetrics = await Promise.all(
    stores.map(async (store) => {
      const [totalReservations, pendingReservations, completedReservations] = await Promise.all([
        Reservation.count({ where: { store_id: store.id } }),
        Reservation.count({ where: { store_id: store.id, status: 'pending' } }),
        Reservation.count({ where: { store_id: store.id, status: 'picked_up' } }),
      ]);

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
    })
  );

  return storeMetrics;
};

module.exports = { getPeakHours, getCategorySales, getStorePerformance };
