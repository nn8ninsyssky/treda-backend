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
  "/getAllVendorsForAdmin",
  authenticate,
  allowRoles(ROLES.ADMIN,ROLES.TREDA_OFFICER),
  controller.getAllVendorsForAdmin
);

// Fetch all Technicians for admin
router.get("/getAllTechniciansForAdmin",
  authenticate,
  allowRoles(ROLES.ADMIN,ROLES.TREDA_OFFICER),
  controller.getAllTechniciansForAdmin
)

// Fetch All Registered Customer Details

router.get(
  "/getAllPanchayatsForAdmin",
  authenticate,
  allowRoles(ROLES.ADMIN,ROLES.TREDA_OFFICER),
  controller.getAllPanchayatsForAdmin
);


// Fetch all Deices for Admin
router.get(
  "/getalldevicesforadmin",
  authenticate,
  allowRoles(ROLES.ADMIN,ROLES.TREDA_OFFICER),
  controller.getAllDevicesforAdmin
);
module.exports = router;