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
  controller.updateMyPanchayat
);

router.delete(
  '/:id',
  authenticate,
  allowRoles(ROLES.ADMIN, ROLES.TREDA_OFFICER),
  controller.delete
);

//Fecth all devices for customer
router.get(
  '/devicesforpanchayat',
  authenticate,
  allowRoles(ROLES.PANCHAYAT),
  controller.getDevicesByPanchayat
);

//Fecth all vendors from which customer had taken devices
router.get(
  '/getallvendorsforpanchayat',
  authenticate,
  allowRoles(ROLES.PANCHAYAT),
  controller.getLinkedVendorsByPanchayat
);
module.exports = router;