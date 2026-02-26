const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Inventory = sequelize.define('Inventory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  store_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: { min: 0 },
  },
  reserved_quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: { min: 0 },
  },
  size: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: 'Clothing size: XS, S, M, L, XL, XXL, XXXL, or shoe size like 6-12',
  },
}, {
  tableName: 'VIKAS-inventory',
  timestamps: true,
  underscored: true,
  indexes: [
    { unique: true, fields: ['store_id', 'product_id', 'size'] },
  ],
});

module.exports = Inventory;
