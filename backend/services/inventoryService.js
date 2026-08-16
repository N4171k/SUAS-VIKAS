const { Inventory, Store } = require('../models');

/**
 * Check stock availability at a store
 */
const checkAvailability = async (productId, storeId) => {
  const inventory = await Inventory.findOne(storeId, productId);

  if (!inventory) {
    return { available: false, quantity: 0 };
  }

  const available = inventory.quantity - inventory.reserved_quantity;
  return {
    available: available > 0,
    quantity: available,
    total: inventory.quantity,
    reserved: inventory.reserved_quantity,
  };
};

/**
 * Reserve stock (atomic in DynamoDB — cannot overbook)
 */
const reserveStock = async (productId, storeId, quantity = 1) => {
  return Inventory.reserveStock(storeId, productId, quantity);
};

/**
 * Release reserved stock (e.g., on cancellation/expiry)
 */
const releaseStock = async (productId, storeId, quantity = 1) => {
  return Inventory.releaseStock(storeId, productId, quantity);
};

/**
 * Fulfill stock (decrement both quantity and reserved on pickup)
 */
const fulfillStock = async (productId, storeId, quantity = 1) => {
  return Inventory.fulfillStock(storeId, productId, quantity);
};

/**
 * Get stores with product in stock
 */
const getStoresWithStock = async (productId) => {
  const inventories = await Inventory.findByProduct(productId);

  const withStore = [];
  for (const inv of inventories) {
    if (inv.quantity - inv.reserved_quantity <= 0) continue;
    const store = await Store.findById(inv.store_id);
    if (!store) continue;
    withStore.push({
      store,
      available: inv.quantity - inv.reserved_quantity,
      total: inv.quantity,
    });
  }

  return withStore;
};

module.exports = {
  checkAvailability,
  reserveStock,
  releaseStock,
  fulfillStock,
  getStoresWithStock,
};