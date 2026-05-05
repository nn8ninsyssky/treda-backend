const express = require('express');
const router = express.Router();

const controller = require('../controllers/complaint.controller') ;
const authenticate = require('../middlewares/auth');
const { allowRoles,ROLES } = require('../middlewares/roleCheck');

const validate = require('../middlewares/validate');


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


//update complaint status by vendor or technician
router.put(
  '/update-status',
  authenticate,
  allowRoles(ROLES.TECHNICIAN,ROLES.VENDOR,ROLES.TREDA_OFFICER,ROLES.ADMIN),
  validate(updateComplaintStatusSchema),
  controller.updateComplaintStatus
);

// get all complaint by admin vendor and technician
router.get(
  '/getAllComplaintsRolewise',
  authenticate,
  allowRoles(ROLES.ADMIN,ROLES.TREDA_OFFICER,ROLES.VENDOR,ROLES.TECHNICIAN,ROLES.PANCHAYAT),
  controller.getAllComplaintsRolewise
);






module.exports = router;