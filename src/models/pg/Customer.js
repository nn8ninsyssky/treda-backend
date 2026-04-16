const { DataTypes } = require('sequelize');
const {sequelize} = require('../../config/db.postgres');

const Customer = sequelize.define('Customer', {
  customer_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  customer_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  customer_email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  // customer_password: {   // 🔐 ADD THIS (IMPORTANT)
  //   type: DataTypes.STRING,
  //   allowNull: false,
  // },

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
  customer_registered_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }

}, {
  tableName: 'customers',
  timestamps: false,
});

module.exports = Customer;