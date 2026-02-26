const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  product_id: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Original ProductId from fashion.csv',
  },
  title: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  sub_category: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  product_type: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  gender: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  colour: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  usage: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  original_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  rating: {
    type: DataTypes.DECIMAL(2, 1),
    defaultValue: 0,
  },
  rating_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  brand: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  image_url: {
    type: DataTypes.STRING(1000),
    allowNull: true,
  },
  features: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'VIKAS-dataset',
  timestamps: true,
  underscored: true,
});

module.exports = Product;
