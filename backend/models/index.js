const User = require('./User');
const Product = require('./Product');
const Inventory = require('./Inventory');
const Cart = require('./Cart');
const Order = require('./Order');
const Reservation = require('./Reservation');
const Store = require('./Store');
const Session = require('./Session');

// ============ ASSOCIATIONS ============

// User -> Orders
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User -> Cart
User.hasMany(Cart, { foreignKey: 'user_id', as: 'cartItems' });
Cart.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User -> Reservations
User.hasMany(Reservation, { foreignKey: 'user_id', as: 'reservations' });
Reservation.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User -> Sessions
User.hasMany(Session, { foreignKey: 'user_id', as: 'sessions' });
Session.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Product -> Cart
Product.hasMany(Cart, { foreignKey: 'product_id', as: 'cartEntries' });
Cart.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Product -> Inventory
Product.hasMany(Inventory, { foreignKey: 'product_id', as: 'inventory' });
Inventory.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Product -> Reservations
Product.hasMany(Reservation, { foreignKey: 'product_id', as: 'reservations' });
Reservation.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Store -> Inventory
Store.hasMany(Inventory, { foreignKey: 'store_id', as: 'inventory' });
Inventory.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });

// Store -> Reservations
Store.hasMany(Reservation, { foreignKey: 'store_id', as: 'reservations' });
Reservation.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });

module.exports = {
  User,
  Product,
  Inventory,
  Cart,
  Order,
  Reservation,
  Store,
  Session,
};
