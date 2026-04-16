const { DataTypes } = require('sequelize');
const  {sequelize}  = require('../../config/db.postgres');

const Enquiry = sequelize.define('Enquiry', {
  enquiry_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  customer_id: DataTypes.UUID,
}, { tableName: 'enquiries' });

module.exports = Enquiry;