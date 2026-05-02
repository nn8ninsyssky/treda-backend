const Joi = require('joi');

exports.registerPanchayatSchema = Joi.object({
  name: Joi.string().required(),

  email: Joi.string().email().required(),

  password: Joi.string().min(6).required(),
  role: Joi.string().valid('customer', 'vendor').required(),
  // REMOVE role from request

  //  Customer profile fields
  phone: Joi.string().optional(),
  alt_phone: Joi.string().optional(),
  aadhaar: Joi.string().optional(),
  village: Joi.string().optional(),
  block: Joi.string().optional(),
  district: Joi.string().optional(),
  state: Joi.string().optional(),
  country: Joi.string().optional(),
  latitude: Joi.number().optional(),
  longitude: Joi.number().optional(),
  pincode: Joi.string().optional(),



});

exports.loginPanchayatSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
exports.registerVendorSchema = Joi.object({
  name: Joi.string().required(),

  email: Joi.string().email().required(),

  password: Joi.string().min(6).required(),
  role: Joi.string().valid('customer', 'vendor').required(),
  // REMOVE role from request
  contact_person: Joi.string().required(),
  vendor_phone: Joi.string().required(),

  lat: Joi.number().required(),
  long: Joi.number().required(),
  //  Customer profile fields
  //phone: Joi.string().optional(),
  district: Joi.string().optional(),
  state: Joi.string().optional(),
  country: Joi.string().optional(),
  //latitude: Joi.number().optional(),
  //longitude: Joi.number().optional(),


  //  ADD THESE
  company_reg_no: Joi.string().optional(),
  vendor_gst_no: Joi.string().optional(),
});

exports.loginVendorSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

exports.registerTechnicianSchema = Joi.object({
  name: Joi.string().required(),

  email: Joi.string().email().required(),

  password: Joi.string().min(6).required(),
  role: Joi.string().valid('customer', 'vendor','technician').required(),


  //  technician profile fields
  phone: Joi.string().optional(),
  village: Joi.string().optional(),
  district: Joi.string().optional(),
  state: Joi.string().optional(),
  country: Joi.string().optional(),
  latitude: Joi.number().optional(),
  longitude: Joi.number().optional(),
  pincode: Joi.string().optional(),
  specialization: Joi.string().optional()


});
exports.loginTechnicianSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
exports.loginTredaOfficerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});