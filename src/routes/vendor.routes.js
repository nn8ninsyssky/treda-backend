const express = require('express');
const router = express.Router();

const validate = require('../middlewares/validate');
const { updateVendorSchema } = require('../validators/vendor.validator');


const authenticate = require('../middlewares/auth');
const { allowRoles,ROLES } = require('../middlewares/roleCheck');
const controller = require('../controllers/vendor.controller');

router.post(
  '/',
  authenticate,
  allowRoles('treda_officer'),
  controller.createVendor
);
router.get(
  "/",
  authenticate,
  allowRoles(ROLES.ADMIN, ROLES.TREDA_OFFICER),
  controller.getAll
);
router.get("/:id", authenticate, controller.getOne);

router.put(
  '/me',
  authenticate,
  allowRoles(ROLES.VENDOR),
  validate(updateVendorSchema),
  controller.updateMyVendor
);



module.exports = router;