const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/auth');

const controller = require('../controllers/auth.controller');
const validate = require('../middlewares/validate');
const { allowRoles, ROLES } = require('../middlewares/roleCheck');

const {
  registerCustomerSchema,
  loginCustomerSchema,
  registerVendorSchema,
  loginVendorSchema,
  registerTechnicianSchema,
  loginTechnicianSchema,
  loginTredaOfficerSchema,
  refreshSchema
} = require('../validators/auth.validator');
// routes that are common for all roles...
router.post('/vendor-send-otp', controller.sendVendorEmailOtp);
router.post('/vendor-verify-otp', controller.verifyVendorEmailOtp);
router.post('/forgot-password', controller.forgotPassword);
router.post('/reset-password', controller.resetPassword);
// REGISTER Customer
router.post(
  '/register/customer',

  validate(registerCustomerSchema),
  controller.registerCustomer
);

// LOGIN Customer
router.post(
  '/login/customer',

  validate(loginCustomerSchema),
  controller.loginCustomer
);
// REGISTER Vendor
router.post(
  '/register/vendor',
authenticate,
  allowRoles(ROLES.TREDA_OFFICER,ROLES.ADMIN),
  validate(registerVendorSchema),
  controller.registerVendor
);

// LOGIN Vendor
router.post(
  '/login/vendor',

  validate(loginVendorSchema),
  controller.loginVendor
);

// register Technician
router.post(
  '/register/technician',
authenticate,
  allowRoles(ROLES.VENDOR),
  validate(registerTechnicianSchema),
  controller.registerTechnician
)

// Login Technician
router.post(
  '/login/technician',

  validate(loginTechnicianSchema),
  controller.loginTechnician
);

// LOGIN Treda Officer
router.post(
  '/login/treda/admin',
//allowRoles(ROLES.TREDA_OFFICER,ROLES.ADMIN),
  validate(loginTredaOfficerSchema),
  controller.loginTredaAdmin
);
// REFRESH
router.post(
  '/refresh',
  validate(refreshSchema),
  controller.refresh
);

// LOGOUT
router.post('/logout', controller.logout);

module.exports = router;