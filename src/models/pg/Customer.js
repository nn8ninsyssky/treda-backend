const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db.postgres');

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  customer_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  customer_phone: DataTypes.STRING,
  customer_alt_phone: DataTypes.STRING,
  customer_aadhaar_no: DataTypes.STRING,
  customer_village: DataTypes.STRING,
  customer_block: DataTypes.STRING,
  customer_district: DataTypes.STRING,
  customer_state: DataTypes.STRING,
  customer_country: DataTypes.STRING,
  customer_latitude: DataTypes.DOUBLE,
  customer_longitude: DataTypes.DOUBLE,
  customer_pincode: DataTypes.STRING,

  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },

}, {
  tableName: 'customers',
  timestamps: true,
  underscored: true
});

module.exports = Customer;