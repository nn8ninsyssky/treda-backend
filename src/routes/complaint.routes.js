const express = require('express');
const router = express.Router();

const controller = require('../controllers/complaint.controller') ;
const authenticate = require('../middlewares/auth');
const { allowRoles,ROLES } = require('../middlewares/roleCheck');
router.post(
  "/complaints",
//   optionalAuthenticate, // important (not strict auth)
  controller.registerComplaint
);

router.get(
  "/complaints/device/:device_qr_id",
  //authenticate,
  controller.getComplaintByDeviceQR
);
module.exports = router;

//update complaint status by vendor or technician
router.put(
  '/update-status',
  authenticate,
  allowRoles(ROLES.TECHNICIAN,ROLES.VENDOR),
  controller.updateComplaintStatus
);

// get all complaint by admin vendor and technician
router.get(
  '/all',
  authenticate,
  allowRoles(ROLES.ADMIN,ROLES.TREDA_OFFICER,ROLES.VENDOR,ROLES.TECHNICIAN),
  controller.getAllComplaints
);