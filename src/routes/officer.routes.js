const express = require('express');
const router = express.Router();

const validate = require('../middlewares/validate');
const { updateOfficerSchema } = require('../validators/officer.validator');


const authenticate = require('../middlewares/auth');
const { allowRoles,ROLES } = require('../middlewares/roleCheck');
const controller = require('../controllers/officer.controller');

router.get(
  "/me",
  authenticate,
  allowRoles(ROLES.ADMIN,ROLES.TREDA_OFFICER),
  controller.getMyAdmin
);


router.put(
  '/me',
  authenticate,
  allowRoles(ROLES.ADMIN,ROLES.TREDA_OFFICER),
  validate(updateOfficerSchema),
  controller.updateMyAdmin
);

router.delete(
  '/:id',
  authenticate,
  allowRoles(ROLES.ADMIN, ROLES.TREDA_OFFICER),
  controller.delete
);

module.exports = router;