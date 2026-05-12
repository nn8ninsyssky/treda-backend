const Joi = require("joi");

exports.updateAdminSchema = Joi.object({
  name: Joi.string().trim().allow("", null).optional(),
  email: Joi.string().trim().email().allow("", null).optional(),

  officer_name: Joi.string().trim().allow("", null).optional(),
  officer_phone: Joi.string().trim().allow("", null).optional(),

  officer_office_district: Joi.string().trim().allow("", null).optional(),
  officer_office_city: Joi.string().trim().allow("", null).optional(),
  officer_office_state: Joi.string().trim().allow("", null).optional(),
  officer_office_country: Joi.string().trim().allow("", null).optional(),

  officer_office_latitude: Joi.alternatives()
    .try(Joi.number(), Joi.string().trim().allow("", null))
    .optional(),

  officer_office_longitude: Joi.alternatives()
    .try(Joi.number(), Joi.string().trim().allow("", null))
    .optional(),
});