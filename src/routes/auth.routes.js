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
  loginTredaOfficerSchema,
  refreshSchema
} = require('../validators/auth.validator');

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

// LOGIN Treda Officer
router.post(
  '/login/treda/admin',

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