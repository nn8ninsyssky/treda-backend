const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db.postgres');

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
    validate: {
      isEmail: true,
    },
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  role: {
    type: DataTypes.ENUM(
      'admin',
      'treda_officer',
      'vendor',
      'technician',
      'customer'
    ),
    allowNull: false,
    defaultValue: 'customer'
  },

  createdAt: {
    type: DataTypes.DATE,
    field: "created_at"
  },

  updatedAt: {
    type: DataTypes.DATE,
    field: "updated_at"
  }

}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = User;