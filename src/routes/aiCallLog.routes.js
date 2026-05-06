const express = require('express');
const router = express.Router();
const { allowRoles,ROLES } = require('../middlewares/roleCheck');
const controller = require('../controllers/aiCallLog.controller') ;
const authenticate = require('../middlewares/auth');

// ➜ Insert AI Call Log
router.post(
  '/insertaicalllog',
  //allowRoles(ROLES.TREDA_OFFICER, ROLES.VENDOR, ROLES.TECHNICIAN),
  controller.insertAICallLog
);
// update ai call log details
router.put(
  '/update',
  controller.updateAiCallLog
);
// for getting all ai_call_logs details for admin
router.get('/getallcalllogs',
  authenticate,
  allowRoles(ROLES.ADMIN,ROLES.TREDA_OFFICER),
  controller.getAllAiCallLogsAdmin);

module.exports = router;



