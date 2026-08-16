const QRCode = require('qrcode');
const { Reservation, Product, Store } = require('../models');
const inventoryService = require('./inventoryService');

/**
 * Create a new reservation with stock locking
 */
const createReservation = async ({ userId, productId, storeId, slot, quantity = 1 }) => {
  // Verify product exists
  const product = await Product.findById(productId);
  if (!product) throw new Error('Product not found.');

  // Verify store exists
  const store = await Store.findById(storeId);
  if (!store) throw new Error('Store not found.');

  // Check and lock inventory (atomic conditional update in DynamoDB)
  await inventoryService.reserveStock(productId, storeId, quantity);

  // Set expiry (24 hours from now)
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Create reservation with product snapshot for cheap listing
  const reservation = await Reservation.create({
    userId,
    productId,
    storeId,
    quantity,
    slot,
    status: 'pending',
    price: product.price,
    productImage: product.image_url,
    productName: product.title,
    expiresAt: expiresAt.toISOString(),
  });

  // Generate QR code token (JWT-like signed payload)
  const qrData = JSON.stringify({
    reservationId: reservation.id,
    productId,
    storeId,
    slot,
    quantity,
  });

  const qrCode = await QRCode.toDataURL(qrData);
  await Reservation.update(reservation.id, { qrToken: qrCode });

  return {
    reservation: { ...reservation, qr_code: qrCode },
    product,
    store,
    qr_code: qrCode,
  };
};

/**
 * Cancel a reservation and release stock
 */
const cancelReservation = async (reservationId, userId) => {
  const reservation = await Reservation.findById(reservationId);
  if (!reservation || reservation.user_id !== userId) throw new Error('Reservation not found.');
  if (['picked_up', 'cancelled', 'expired'].includes(reservation.status)) {
    throw new Error('Reservation cannot be cancelled.');
  }

  // Release the reserved stock
  await inventoryService.releaseStock(
    reservation.product_id,
    reservation.store_id,
    reservation.quantity
  );

  await Reservation.update(reservationId, { status: 'cancelled' });
  return { ...reservation, status: 'cancelled' };
};

/**
 * Mark reservation as picked up
 */
const markPickedUp = async (reservationId) => {
  const reservation = await Reservation.findById(reservationId);
  if (!reservation) throw new Error('Reservation not found.');

  // Fulfill the stock (decrement actual inventory)
  await inventoryService.fulfillStock(
    reservation.product_id,
    reservation.store_id,
    reservation.quantity
  );

  await Reservation.update(reservationId, { status: 'picked_up' });
  return { ...reservation, status: 'picked_up' };
};

/**
 * Expire overdue reservations (run as scheduled task)
 */
const expireOverdueReservations = async () => {
  const all = await Reservation.findAll();
  const now = new Date();
  const overdue = all.filter(
    (r) => r.status === 'pending' && r.expires_at && new Date(r.expires_at) < now
  );

  for (const reservation of overdue) {
    await inventoryService.releaseStock(
      reservation.product_id,
      reservation.store_id,
      reservation.quantity
    );
    await Reservation.update(reservation.id, { status: 'expired' });
  }

  return overdue.length;
};

module.exports = {
  createReservation,
  cancelReservation,
  markPickedUp,
  expireOverdueReservations,
};