const express = require('express');
const router = express.Router();

const controller = require('../controllers/device.controller');
const authenticate = require('../middlewares/auth');
const { allowRoles, ROLES } = require('../middlewares/roleCheck');

router.post(
  '/vendor/device/register',
  authenticate,
  allowRoles(ROLES.VENDOR,ROLES.TECHNICIAN), 
  controller.registerDevice
);

// Fetch device, vendor, customer details for complaint raisers
router.get(
  "/device/:device_qr_id",
  controller.getDeviceFullDetails
);
module.exports = router;