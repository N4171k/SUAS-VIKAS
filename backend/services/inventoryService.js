const { Inventory, Product, Store } = require('../models');
const { Op } = require('sequelize');

/**
 * Check stock availability at a store
 */
const checkAvailability = async (productId, storeId) => {
  const inventory = await Inventory.findOne({
    where: { product_id: productId, store_id: storeId },
  });

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
 * Reserve stock (decrement available, increment reserved)
 */
const reserveStock = async (productId, storeId, quantity = 1) => {
  const inventory = await Inventory.findOne({
    where: { product_id: productId, store_id: storeId },
  });

  if (!inventory) {
    throw new Error('Product not found at this store.');
  }

  const available = inventory.quantity - inventory.reserved_quantity;
  if (available < quantity) {
    throw new Error(`Not enough stock. Available: ${available}, Requested: ${quantity}`);
  }

  inventory.reserved_quantity += quantity;
  await inventory.save();

  return inventory;
};

/**
 * Release reserved stock (e.g., on cancellation/expiry)
 */
const releaseStock = async (productId, storeId, quantity = 1) => {
  const inventory = await Inventory.findOne({
    where: { product_id: productId, store_id: storeId },
  });

  if (inventory) {
    inventory.reserved_quantity = Math.max(0, inventory.reserved_quantity - quantity);
    await inventory.save();
  }

  return inventory;
};

/**
 * Fulfill stock (decrement both quantity and reserved on pickup)
 */
const fulfillStock = async (productId, storeId, quantity = 1) => {
  const inventory = await Inventory.findOne({
    where: { product_id: productId, store_id: storeId },
  });

  if (inventory) {
    inventory.quantity = Math.max(0, inventory.quantity - quantity);
    inventory.reserved_quantity = Math.max(0, inventory.reserved_quantity - quantity);
    await inventory.save();
  }

  return inventory;
};

/**
 * Get stores with product in stock
 */
const getStoresWithStock = async (productId) => {
  const inventories = await Inventory.findAll({
    where: {
      product_id: productId,
      quantity: { [Op.gt]: 0 },
    },
    include: [{ model: Store, as: 'store' }],
  });

  return inventories.map((inv) => ({
    store: inv.store,
    available: inv.quantity - inv.reserved_quantity,
    total: inv.quantity,
  }));
};

module.exports = {
  checkAvailability,
  reserveStock,
  releaseStock,
  fulfillStock,
  getStoresWithStock,
};
