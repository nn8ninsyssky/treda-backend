const Joi = require('joi');

exports.registerSchema = Joi.object({
  name: Joi.string().required(),

  email: Joi.string().email().required(),

  password: Joi.string().min(6).required(),
role: Joi.string().valid('customer','vendor').required(),
  // ❌ REMOVE role from request

  // ✅ Customer profile fields
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


   // 🔥 ADD THESE
  company_reg_no: Joi.string().optional(),
  vendor_gst_no: Joi.string().optional(),
  vendor_contact_person_name: Joi.string().optional(),
});

exports.loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});