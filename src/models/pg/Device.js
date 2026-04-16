const { DataTypes } = require('sequelize');
const  {sequelize}  = require('../../config/db.postgres');

const Device = sequelize.define('Device', {
  device_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  device_name: DataTypes.STRING,
  vendor_id: DataTypes.UUID,
  customer_id: DataTypes.UUID,
}, { tableName: 'devices' });

module.exports = Device;