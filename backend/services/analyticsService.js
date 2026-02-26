const { Op, fn, col, literal } = require('sequelize');
const { Order, Reservation, Product, User, Store } = require('../models');

/**
 * Get dashboard analytics overview
 */
const getDashboardAnalytics = async () => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

  // Total counts
  const [totalUsers, totalProducts, totalOrders, totalReservations] = await Promise.all([
    User.count(),
    Product.count({ where: { is_active: true } }),
    Order.count(),
    Reservation.count(),
  ]);

  // Today's metrics
  const [todayOrders, todayReservations] = await Promise.all([
    Order.count({ where: { created_at: { [Op.gte]: todayStart } } }),
    Reservation.count({ where: { created_at: { [Op.gte]: todayStart } } }),
  ]);

  // Revenue
  const totalRevenue = await Order.sum('total') || 0;
  const weekRevenue = await Order.sum('total', {
    where: { created_at: { [Op.gte]: weekAgo } },
  }) || 0;

  // Reservation status breakdown
  const reservationsByStatus = await Reservation.findAll({
    attributes: ['status', [fn('COUNT', '*'), 'count']],
    group: ['status'],
  });

  // Top categories
  const topCategories = await Product.findAll({
    attributes: ['category', [fn('COUNT', '*'), 'count']],
    where: { is_active: true, category: { [Op.ne]: null } },
    group: ['category'],
    order: [[literal('count'), 'DESC']],
    limit: 10,
  });

  // Active reservations per store
  const activeReservationsPerStore = await Reservation.findAll({
    attributes: ['store_id', [fn('COUNT', '*'), 'count']],
    where: { status: { [Op.in]: ['pending', 'confirmed', 'ready'] } },
    group: ['store_id'],
    include: [{ model: Store, as: 'store', attributes: ['name'] }],
  });

  return {
    overview: {
      totalUsers,
      totalProducts,
      totalOrders,
      totalReservations,
      todayOrders,
      todayReservations,
      totalRevenue: parseFloat(totalRevenue).toFixed(2),
      weekRevenue: parseFloat(weekRevenue).toFixed(2),
    },
    reservationsByStatus: reservationsByStatus.map((r) => ({
      status: r.status,
      count: parseInt(r.get('count')),
    })),
    topCategories: topCategories.map((c) => ({
      category: c.category,
      count: parseInt(c.get('count')),
    })),
    activeReservationsPerStore: activeReservationsPerStore.map((r) => ({
      storeId: r.store_id,
      storeName: r.store?.name,
      count: parseInt(r.get('count')),
    })),
  };
};

/**
 * Get sales data for a period
 */
const getSalesData = async (period = '7d') => {
  const days = parseInt(period) || 7;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const orders = await Order.findAll({
    where: { created_at: { [Op.gte]: startDate } },
    attributes: [
      [fn('DATE', col('created_at')), 'date'],
      [fn('COUNT', '*'), 'orderCount'],
      [fn('SUM', col('total')), 'revenue'],
    ],
    group: [fn('DATE', col('created_at'))],
    order: [[fn('DATE', col('created_at')), 'ASC']],
  });

  return {
    period: `${days} days`,
    data: orders.map((o) => ({
      date: o.get('date'),
      orderCount: parseInt(o.get('orderCount')),
      revenue: parseFloat(o.get('revenue') || 0).toFixed(2),
    })),
  };
};

module.exports = { getDashboardAnalytics, getSalesData };
