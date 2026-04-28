const express = require('express');
const router = express.Router();

const controller = require('../controllers/aiCallLog.controller') ;
const authenticate = require('../middlewares/auth');

// ➜ Insert AI Call Log
router.post(
  '/c',
  //allowRoles(ROLES.TREDA_OFFICER, ROLES.VENDOR, ROLES.TECHNICIAN),
  controller.insertAiCallLog
);
module.exports = router;

// update ai call log details
router.put(
  '/update',
  controller.updateAiCallLog
);