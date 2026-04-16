const { DataTypes } = require('sequelize');
const {sequelize}  = require('../../config/db.postgres');

const Complaint = sequelize.define('Complaint', {
  complaint_id: {
    type: DataTypes.UUID,
    primaryKey: true,
  },
  customer_id: DataTypes.UUID,
  complaint_type: DataTypes.STRING,
  complaint_priority: DataTypes.STRING,
  complaint_status: DataTypes.STRING,
}, { tableName: 'complaints' });

module.exports = Complaint;