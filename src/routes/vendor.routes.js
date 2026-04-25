const express = require('express');
const router = express.Router();

const validate = require('../middlewares/validate');
const { updateVendorSchema } = require('../validators/vendor.validator');


const authenticate = require('../middlewares/auth');
const { allowRoles,ROLES } = require('../middlewares/roleCheck');
const controller = require('../controllers/vendor.controller');

router.get(
  "/me",
  authenticate,
  allowRoles(ROLES.VENDOR),
  controller.getMyVendor
);


router.put(
  '/me',
  authenticate,
  allowRoles(ROLES.VENDOR),
  validate(updateVendorSchema),
  controller.updateMyVendor
);

router.delete(
  '/:id',
  authenticate,
  allowRoles(ROLES.ADMIN, ROLES.TREDA_OFFICER),
  controller.delete
);


// for technician update by vendor
router.put(
  "/technician/:user_id",
  authenticate,
  allowRoles(ROLES.VENDOR),
  controller.updateMyTechnicianByAdmin
);

//for all technician fetch by vendor
router.get("/technicians",
  authenticate,
  allowRoles(ROLES.VENDOR),
  controller.getMyTechnicians
)

// For getting all devices under logged in vendor

router.get(
  '/getalldevicesforvendor',
  authenticate,
  allowRoles(ROLES.VENDOR),
  controller.getAllDevicesForVendor
);
module.exports = router;