const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Reservation = sequelize.define('Reservation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  store_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  slot: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Pickup time slot e.g. "2026-02-27T10:00-11:00"',
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'ready', 'picked_up', 'expired', 'cancelled'),
    defaultValue: 'pending',
  },
  qr_code: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'VIKAS-reservations',
  timestamps: true,
  underscored: true,
});

module.exports = Reservation;
