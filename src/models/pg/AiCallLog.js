const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db.postgres');

const AiCallLog = sequelize.define('AiCallLog', {
  call_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  customer_id: DataTypes.UUID,
  complaint_id: DataTypes.UUID,
  enquiry_id: DataTypes.UUID,
}, { tableName: 'ai_call_logs' });

module.exports = AiCallLog;