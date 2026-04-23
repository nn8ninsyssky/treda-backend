const Joi = require('joi');

exports.updatecustomerSchema = Joi.object({
  customer_name: Joi.string().optional(),
  customer_phone: Joi.string().optional(),
  customer_alt_phone: Joi.string().optional(),
  customer_aadhaar_no: Joi.string().optional(),
  customer_village: Joi.string().optional(),
  customer_block: Joi.string().optional(),
  customer_district: Joi.string().optional(),
  customer_state: Joi.string().optional(),
  customer_country: Joi.string().optional(),
  customer_pincode: Joi.string().optional(), // IMPORTANT
  customer_latitude: Joi.number().optional(),
  customer_longitude: Joi.number().optional(),
});