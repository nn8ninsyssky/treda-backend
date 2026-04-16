const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db.postgres');

const Technician = sequelize.define('Technician', {
  technician_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: DataTypes.STRING,
  vendor_id: DataTypes.UUID,
}, { tableName: 'technicians' });

module.exports = Technician;