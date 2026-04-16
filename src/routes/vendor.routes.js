const express = require('express');
const router = express.Router();



const authenticate = require('../middlewares/auth');
const { allowRoles } = require('../middlewares/roleCheck');
const controller = require('../controllers/vendor.controller');

router.post(
  '/',
  authenticate,
  allowRoles('treda_officer'),
  controller.createVendor
);
router.get('/', authenticate, controller.getAll);
//router.post('/', authenticate, controller.create);
router.get('/:id', authenticate, controller.getOne);
router.put('/:id', authenticate, controller.update);
router.delete('/:id', authenticate, controller.delete);

module.exports = router;