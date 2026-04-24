const express = require('express');
const router = express.Router();

const controller = require('../controllers/device.controller');
const authenticate = require('../middlewares/auth');
const { allowRoles, ROLES } = require('../middlewares/roleCheck');

router.post(
  '/vendor/device/register',
  authenticate,
  allowRoles(ROLES.VENDOR), 
  controller.registerDevice
);

module.exports = router;