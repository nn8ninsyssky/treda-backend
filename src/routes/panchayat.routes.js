const express = require('express');
const router = express.Router();

const controller = require('../controllers/panchayat.controller') ;
const authenticate = require('../middlewares/auth');


const validate = require('../middlewares/validate');
const { updatePanchayatSchema } = require('../validators/panchayat.validator');


const { allowRoles,ROLES } = require('../middlewares/roleCheck');

router.get(
  '/me',
  authenticate,
  allowRoles(ROLES.PANCHAYAT),
  controller.getMyPanchayat
);

router.put(
  '/me',
  authenticate,
  allowRoles(ROLES.PANCHAYAT),
  validate(updatePanchayatSchema),
  controller.updateMyCustomer
);

router.delete(
  '/:id',
  authenticate,
  allowRoles(ROLES.ADMIN, ROLES.TREDA_OFFICER),
  controller.delete
);

//Fecth all devices for customer
router.get(
  '/devicesforcustomer',
  authenticate,
  allowRoles(ROLES.PANCHAYAT),
  controller.getMyDevices
);

//Fecth all vendors from which customer had taken devices
router.get(
  '/getallvendorsforcustomer',
  authenticate,
  allowRoles(ROLES.PANCHAYAT),
  controller.getMyVendorsForCustomer
);
module.exports = router;