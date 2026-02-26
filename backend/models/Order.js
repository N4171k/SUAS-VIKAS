const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  items: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
  },
  shipping_address: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  payment_method: {
    type: DataTypes.STRING,
    defaultValue: 'cod',
  },
}, {
  tableName: 'VIKAS-orders',
  timestamps: true,
  underscored: true,
});

module.exports = Order;
