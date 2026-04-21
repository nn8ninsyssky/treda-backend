const Joi = require('joi');

exports.updatecustomerSchema = Joi.object({
  customer_name: Joi.string().optional(),
  customer_phone: Joi.string().optional(),
  customer_district: Joi.string().optional(),
  customer_state: Joi.string().optional(),
  customer_country: Joi.string().optional(),
  customer_latitude: Joi.number().optional(),
  customer_longitude: Joi.number().optional(),
});