const express = require('express');
const router = express.Router();

const controller = require('../controllers/customer.controller') ;
const authenticate = require('../middlewares/auth');


const validate = require('../middlewares/validate');
const { updatecustomerSchema } = require('../validators/customer.validator');


const { allowRoles,ROLES } = require('../middlewares/roleCheck');

router.get(
  '/me',
  authenticate,
  allowRoles(ROLES.CUSTOMER),
  controller.getMyCustomer
);

router.put(
  '/me',
  authenticate,
  allowRoles(ROLES.CUSTOMER),
  validate(updatecustomerSchema),
  controller.updateMyCustomer
);

router.delete(
  '/:id',
  authenticate,
  allowRoles(ROLES.ADMIN, ROLES.TREDA_OFFICER),
  controller.delete
);
module.exports = router;