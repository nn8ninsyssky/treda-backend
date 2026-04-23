const Joi = require('joi');

exports.updateVendorSchema = Joi.object({
  vendor_name: Joi.string().optional(),
  company_reg_no: Joi.string().optional(),
  vendor_gst_no: Joi.string().optional(),
  vendor_contact_person_name: Joi.string().optional(),
  vendor_phone: Joi.string().optional(),
  vendor_district: Joi.string().optional(),
  vendor_state: Joi.string().optional(),
  vendor_country: Joi.string().optional(),
  vendor_status: Joi.string().valid('active', 'inactive', 'suspended').optional(),
  vendor_latitude: Joi.number().optional(),
  vendor_longitude: Joi.number().optional(),
});