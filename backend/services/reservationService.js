const QRCode = require('qrcode');
const { Reservation, Product, Store, Inventory } = require('../models');
const inventoryService = require('./inventoryService');

/**
 * Create a new reservation with stock locking
 */
const createReservation = async ({ userId, productId, storeId, slot, quantity = 1 }) => {
  // Verify product exists
  const product = await Product.findByPk(productId);
  if (!product) throw new Error('Product not found.');

  // Verify store exists
  const store = await Store.findByPk(storeId);
  if (!store) throw new Error('Store not found.');

  // Check and lock inventory
  await inventoryService.reserveStock(productId, storeId, quantity);

  // Set expiry (24 hours from now)
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Create reservation
  const reservation = await Reservation.create({
    user_id: userId,
    product_id: productId,
    store_id: storeId,
    quantity,
    slot,
    status: 'pending',
    expires_at: expiresAt,
  });

  // Generate QR code
  const qrData = JSON.stringify({
    reservationId: reservation.id,
    productId,
    storeId,
    slot,
    quantity,
  });

  const qrCode = await QRCode.toDataURL(qrData);
  reservation.qr_code = qrCode;
  await reservation.save();

  return {
    reservation,
    product,
    store,
    qr_code: qrCode,
  };
};

/**
 * Cancel a reservation and release stock
 */
const cancelReservation = async (reservationId, userId) => {
  const reservation = await Reservation.findOne({
    where: { id: reservationId, user_id: userId },
  });

  if (!reservation) throw new Error('Reservation not found.');
  if (['picked_up', 'cancelled', 'expired'].includes(reservation.status)) {
    throw new Error('Reservation cannot be cancelled.');
  }

  // Release the reserved stock
  await inventoryService.releaseStock(
    reservation.product_id,
    reservation.store_id,
    reservation.quantity
  );

  reservation.status = 'cancelled';
  await reservation.save();

  return reservation;
};

/**
 * Mark reservation as picked up
 */
const markPickedUp = async (reservationId) => {
  const reservation = await Reservation.findByPk(reservationId);
  if (!reservation) throw new Error('Reservation not found.');

  // Fulfill the stock (decrement actual inventory)
  await inventoryService.fulfillStock(
    reservation.product_id,
    reservation.store_id,
    reservation.quantity
  );

  reservation.status = 'picked_up';
  await reservation.save();

  return reservation;
};

/**
 * Expire overdue reservations (run as scheduled task)
 */
const expireOverdueReservations = async () => {
  const { Op } = require('sequelize');
  const overdue = await Reservation.findAll({
    where: {
      status: 'pending',
      expires_at: { [Op.lt]: new Date() },
    },
  });

  for (const reservation of overdue) {
    await inventoryService.releaseStock(
      reservation.product_id,
      reservation.store_id,
      reservation.quantity
    );
    reservation.status = 'expired';
    await reservation.save();
  }

  return overdue.length;
};

module.exports = {
  createReservation,
  cancelReservation,
  markPickedUp,
  expireOverdueReservations,
};
