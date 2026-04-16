const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db.postgres');

const Vendor = sequelize.define('Vendor', {
  vendor_id: {
    type:         DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey:   true,
  },
  vendor_name:              { type: DataTypes.STRING, allowNull: false },
  company_reg_no:           { type: DataTypes.STRING },
  vendor_gst_no:            { type: DataTypes.STRING },
  vendor_contact_person_name: { type: DataTypes.STRING },
  vendor_phone:             { type: DataTypes.STRING },
  vendor_email:             { type: DataTypes.STRING },
  vendor_district:          { type: DataTypes.STRING },
  vendor_state:             { type: DataTypes.STRING },
  vendor_country:           { type: DataTypes.STRING },
  vendor_latitude:          { type: DataTypes.DOUBLE },
  vendor_longitude:         { type: DataTypes.DOUBLE },
  vendor_device_categories: { type: DataTypes.ARRAY(DataTypes.TEXT) },
  
  vendor_status: {
  type: DataTypes.ENUM({
    values: ['active', 'inactive', 'suspended'],
    name: 'vendor_status_enum', // ✅ MATCH DB EXACTLY
  }),
  defaultValue: 'active',
},
  onboarded_at: {
    type:         DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, { tableName: 'vendors' });

module.exports = Vendor;