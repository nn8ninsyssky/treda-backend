const express = require('express');
const router = express.Router();

const controller = require('../controllers/complaint.controller') ;
const authenticate = require('../middlewares/auth');

router.post(
  "/complaints",
//   optionalAuthenticate, // important (not strict auth)
  controller.registerComplaint
);
module.exports = router;
