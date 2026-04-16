const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db.postgres');

const TredaOfficer = sequelize.define('TredaOfficer', {
  officer_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: DataTypes.STRING,
}, { tableName: 'treda_officers' });

module.exports = TredaOfficer;