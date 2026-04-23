const express = require('express');
const router = express.Router();

const controller = require('../controllers/auth.controller');
const validate = require('../middlewares/validate');
const { allowRoles, ROLES } = require('../middlewares/roleCheck');

const {
  registerCustomerSchema,
  loginCustomerSchema,
  registerVendorSchema,
  loginVendorSchema,
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
// router.post(
//   '/register/vendor',
//   authenticate,
//   validate(registerVendorSchema),
//   controller.registerVendor
// );
router.post(
  '/register/vendor',

  allowRoles(ROLES.TREDA_OFFICER),
  validate(registerVendorSchema),
  controller.registerVendor
);

// LOGIN Vendor
router.post(
  '/login/vendor',

  validate(loginVendorSchema),
  controller.loginVendor
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