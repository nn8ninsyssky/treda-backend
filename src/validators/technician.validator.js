const Joi = require('joi');

exports.updateTechnicianSchema = Joi.object({
  vendor_id: Joi.string().uuid().optional(), 
  technician_name: Joi.string().optional(),
  technician_phone: Joi.string().optional(),
  technician_village:Joi.string().optional(),
  technician_district: Joi.string().optional(),
  technician_state: Joi.string().optional(),
  technician_country: Joi.string().optional(),
  technician_pincode:Joi.string().optional(),
  technician_status: Joi.string().valid('active', 'inactive', 'suspended').optional(),
  technician_latitude: Joi.number().optional(),
  technician_longitude: Joi.number().optional(),
  technician_specialization:Joi.string().optional()
});