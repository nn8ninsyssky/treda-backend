const express = require('express');
const router = express.Router();

const controller = require('../controllers/technician.controller');
const authenticate = require('../middlewares/auth');

const { updateTechnicianSchema } = require('../validators/technician.validator');

const validate = require('../middlewares/validate');

const { allowRoles,ROLES } = require('../middlewares/roleCheck');

router.put(
  '/me',
  authenticate,
  allowRoles(ROLES.VENDOR),
  validate(updateTechnicianSchema),
  controller.updateMyTechnician
);

module.exports = router;