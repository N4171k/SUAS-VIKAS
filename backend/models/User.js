const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('customer', 'store_admin', 'super_admin'),
    defaultValue: 'customer',
  },
  avatar: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
}, {
  tableName: 'VIKAS-users',
  timestamps: true,
  underscored: true,
});

module.exports = User;
