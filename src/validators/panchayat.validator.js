const Joi = require("joi");

exports.updatePanchayatSchema = Joi.object({
  panchayat_name: Joi.string().trim().allow("", null).optional(),

  panchayat_phone: Joi.string().trim().allow("", null).optional(),

  panchayat_alt_phone: Joi.string().trim().allow("", null).optional(),

  panchayat_village: Joi.string().trim().allow("", null).optional(),

  panchayat_block: Joi.string().trim().allow("", null).optional(),

  panchayat_district: Joi.string().trim().allow("", null).optional(),

  panchayat_state: Joi.string().trim().allow("", null).optional(),

  panchayat_country: Joi.string().trim().allow("", null).optional(),

  panchayat_pincode: Joi.string().trim().allow("", null).optional(),

  panchayat_latitude: Joi.alternatives()
    .try(Joi.number(), Joi.string().trim().allow("", null))
    .optional(),

  panchayat_longitude: Joi.alternatives()
    .try(Joi.number(), Joi.string().trim().allow("", null))
    .optional(),
});