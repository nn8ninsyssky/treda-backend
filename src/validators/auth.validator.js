const Joi = require('joi');

exports.emailOtpSchema = Joi.object({
  email: Joi.string().email().required(),
});

exports.verifyOtpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
});

exports.forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  page: Joi.string().optional(),
});

exports.resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  token: Joi.string().required(),
  new_password: Joi.string().min(6).required(),
});

exports.changePasswordSchema = Joi.object({
  old_password: Joi.string().required(),
  new_password: Joi.string().min(6).required(),
});

exports.refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

exports.registerPanchayatSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),

  // Do not allow frontend to decide role.
  // Backend/SP should set role as panchayat/customer.
  role: Joi.string().valid('customer', 'panchayat').optional(),

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

  // Do not allow customer here.
  role: Joi.string().valid('vendor').optional(),

  contact_person: Joi.string().required(),
  vendor_phone: Joi.string().required(),

  lat: Joi.number().required(),
  long: Joi.number().required(),

  district: Joi.string().optional(),
  state: Joi.string().optional(),
  country: Joi.string().optional(),

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

  // Do not allow customer/vendor here.
  role: Joi.string().valid('technician').optional(),

  phone: Joi.string().optional(),
  village: Joi.string().optional(),
  district: Joi.string().optional(),
  state: Joi.string().optional(),
  country: Joi.string().optional(),
  latitude: Joi.number().optional(),
  longitude: Joi.number().optional(),
  pincode: Joi.string().optional(),
  specialization: Joi.string().optional(),
});

exports.loginTechnicianSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

exports.loginTredaOfficerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});