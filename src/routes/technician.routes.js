const express = require('express');
const router = express.Router();

const controller = require('../controllers/technician.controller');
const authenticate = require('../middlewares/auth');

const { updateTechnicianSchema } = require('../validators/technician.validator');

const validate = require('../middlewares/validate');

const { allowRoles,ROLES } = require('../middlewares/roleCheck');


router.get(
  "/me",
  authenticate,
  allowRoles(ROLES.TECHNICIAN),
  controller.getMyTechnician
);

router.put(
  '/me',
  authenticate,
  allowRoles(ROLES.TECHNICIAN),
  validate(updateTechnicianSchema),
  controller.updateMyTechnician
);


// Fetch All Registered Vendors Details 
router.get(
  "/getallvendors",
  authenticate,
  allowRoles(ROLES.TECHNICIAN),
  controller.getAllVendors
);
module.exports = router;