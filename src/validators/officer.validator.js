const Joi = require('joi');

exports.updateOfficerSchema = Joi.object({
  officer_name: Joi.string().optional(),
  officer_phone: Joi.string().optional(),
  officer_office_district: Joi.string().optional(),
  officer_office_city: Joi.string().optional(),
  officer_office_state: Joi.string().optional(),
  officer_office_country: Joi.string().optional(),

});