const  {sequelize}  = require('../../config/db.postgres');

const Vendor       = require('./Vendor');
const Customer     = require('./Customer');
const Device       = require('./Device');
const Technician   = require('./Technician');
const Enquiry      = require('./Enquiry');
const Complaint    = require('./Complaint');
const TredaOfficer = require('./TredaOfficer');
const AiCallLog    = require('./AiCallLog');

const User = require('./User');

// ── Vendor associations ───────────────────────────────
Vendor.hasMany(Device,      { foreignKey: 'vendor_id', as: 'devices' });
Vendor.hasMany(Technician,  { foreignKey: 'vendor_id', as: 'technicians' });
Vendor.hasMany(Complaint,   { foreignKey: 'assigned_vendor_id', as: 'complaints' });

// ── Customer associations ─────────────────────────────
Customer.hasMany(Device,    { foreignKey: 'customer_id', as: 'devices' });
Customer.hasMany(Enquiry,   { foreignKey: 'customer_id', as: 'enquiries' });
Customer.hasMany(Complaint, { foreignKey: 'customer_id', as: 'complaints' });
Customer.hasMany(AiCallLog, { foreignKey: 'customer_id', as: 'aiCallLogs' });
// 🔗 Relationship
User.hasOne(Customer, { foreignKey: 'user_id' });
Customer.belongsTo(User, { foreignKey: 'user_id' });

// ── Device associations ───────────────────────────────
Device.belongsTo(Vendor,   { foreignKey: 'vendor_id',   as: 'vendor' });
Device.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
Device.hasMany(Complaint,  { foreignKey: 'device_id',   as: 'complaints' });

// ── Technician associations ───────────────────────────
Technician.belongsTo(Vendor,  { foreignKey: 'vendor_id', as: 'vendor' });
Technician.hasMany(Complaint, { foreignKey: 'technician_id', as: 'complaints' });

// ── Enquiry associations ──────────────────────────────
Enquiry.belongsTo(Customer,  { foreignKey: 'customer_id', as: 'customer' });
Enquiry.hasMany(AiCallLog,   { foreignKey: 'enquiry_id',  as: 'aiCallLogs' });

// ── Complaint associations ────────────────────────────
Complaint.belongsTo(Customer,     { foreignKey: 'customer_id',        as: 'customer' });
Complaint.belongsTo(Vendor,       { foreignKey: 'assigned_vendor_id', as: 'assignedVendor' });
Complaint.belongsTo(Technician,   { foreignKey: 'technician_id',      as: 'technician' });
Complaint.belongsTo(TredaOfficer, { foreignKey: 'treda_officer_id',   as: 'tredaOfficer' });
Complaint.belongsTo(Device,        { foreignKey: 'device_id',          as: 'device' });
Complaint.hasMany(AiCallLog,       { foreignKey: 'complaint_id',       as: 'aiCallLogs' });

// ── TredaOfficer associations ─────────────────────────
TredaOfficer.hasMany(Complaint, { foreignKey: 'treda_officer_id', as: 'complaints' });

// ── AiCallLog associations ────────────────────────────
AiCallLog.belongsTo(Customer,  { foreignKey: 'customer_id',  as: 'customer' });
AiCallLog.belongsTo(Complaint, { foreignKey: 'complaint_id', as: 'complaint' });
AiCallLog.belongsTo(Enquiry,   { foreignKey: 'enquiry_id',   as: 'enquiry' });

module.exports = {
  sequelize,
  Vendor, Customer, Device, Technician,
  Enquiry, Complaint, TredaOfficer, AiCallLog,
  User
};
