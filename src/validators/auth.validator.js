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
  name: Joi.string().trim().required().messages({
    "string.empty": "Name is required",
    "any.required": "Name is required",
  }),

  email: Joi.string().trim().lowercase().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Valid email is required",
    "any.required": "Email is required",
  }),

  password: Joi.string().min(6).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is required",
  }),

  phone: Joi.string().trim().allow("", null).optional(),
  alt_phone: Joi.string().trim().allow("", null).optional(),

  village: Joi.string().trim().allow("", null).optional(),
  block: Joi.string().trim().allow("", null).optional(),
  district: Joi.string().trim().allow("", null).optional(),
  state: Joi.string().trim().allow("", null).optional(),
  country: Joi.string().trim().allow("", null).optional(),

  latitude: Joi.alternatives()
    .try(Joi.number(), Joi.string().trim().allow("", null))
    .optional(),

  longitude: Joi.alternatives()
    .try(Joi.number(), Joi.string().trim().allow("", null))
    .optional(),

  pincode: Joi.string().trim().allow("", null).optional(),
});

exports.loginPanchayatSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// exports.registerVendorSchema = Joi.object({
//   name: Joi.string().required(),
//   email: Joi.string().email().required(),
//   password: Joi.string().min(6).required(),

//   // Do not allow customer here.
//   role: Joi.string().valid('vendor').optional(),

//   contact_person: Joi.string().required(),
//   vendor_phone: Joi.string().required(),

//   lat: Joi.number().required(),
//   long: Joi.number().required(),

//   district: Joi.string().optional(),
//   state: Joi.string().optional(),
//   country: Joi.string().optional(),

//   company_reg_no: Joi.string().optional(),
//   vendor_gst_no: Joi.string().optional(),
// });
exports.registerVendorSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  vendor_name: Joi.string().required(),
  company_reg_no: Joi.string().allow(null, ""),
  vendor_gst_no: Joi.string().allow(null, ""),
  contact_person: Joi.string().allow(null, ""),
  vendor_phone: Joi.string().allow(null, ""),
  district: Joi.string().allow(null, ""),
  state: Joi.string().allow(null, ""),
  country: Joi.string().allow(null, ""),
  lat: Joi.number().allow(null),
  long: Joi.number().allow(null)
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
// module.exports = {
//   emailOtpSchema,verifyOtpSchema,forgotPasswordSchema,changePasswordSchema,resetPasswordSchema,refreshSchema,registerPanchayatSchema,loginPanchayatSchema,registerVendorSchema,loginVendorSchema,registerTechnicianSchema,loginTechnicianSchema,loginTredaOfficerSchema
// };