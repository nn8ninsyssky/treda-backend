const Joi = require("joi");

const updateComplaintStatusSchema = Joi.object({
  complaint_no: Joi.string().required(),

  complaint_status: Joi.string().allow(null, ""),

  vendor_assignment_status: Joi.string().allow(null, ""),

  technician_assignment_status: Joi.string().allow(null, ""),
});