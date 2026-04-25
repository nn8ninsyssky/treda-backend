const express = require('express');
const router = express.Router();

const validate = require('../middlewares/validate');
const { updateOfficerSchema } = require('../validators/officer.validator');


const authenticate = require('../middlewares/auth');
const { allowRoles,ROLES } = require('../middlewares/roleCheck');
const controller = require('../controllers/officer.controller');


// Fetching Admin Profile
router.get(
  "/me",
  authenticate,
  allowRoles(ROLES.ADMIN,ROLES.TREDA_OFFICER),
  controller.getMyAdmin
);

// Updating Admin Profile
router.put(
  '/me',
  authenticate,
  allowRoles(ROLES.ADMIN,ROLES.TREDA_OFFICER),
  validate(updateOfficerSchema),
  controller.updateMyAdmin
);

//Delete Admin Profile
router.delete(
  '/:id',
  authenticate,
  allowRoles(ROLES.ADMIN, ROLES.TREDA_OFFICER),
  controller.delete
);

// Update Vendor Profile By Admin
router.put(
  "/vendor/:user_id",
  authenticate,
  allowRoles(ROLES.ADMIN,ROLES.TREDA_OFFICER),
  controller.updateMyVendorByAdmin
);

// Fetch All Registered Vendors Details 
router.get(
  "/getallvendors",
  authenticate,
  allowRoles(ROLES.ADMIN,ROLES.TREDA_OFFICER),
  controller.getAllVendors
);

// Fetch al Technicians for admin
router.get("/technicians",
  authenticate,
  allowRoles(ROLES.ADMIN,ROLES.TREDA_OFFICER),
  controller.getAllTechnicians
)

// Fetch All Registered Customer Details

router.get(
  "/getallcustomersforadmin",
  authenticate,
  allowRoles(ROLES.ADMIN,ROLES.TREDA_OFFICER),
  controller.getAllCustomersForAdmin
);


// Fetch all Deices for Admin
router.get(
  "/getalldevicesforadmin",
  authenticate,
  allowRoles(ROLES.ADMIN,ROLES.TREDA_OFFICER),
  controller.getAllDevicesforAdmin
);
module.exports = router;