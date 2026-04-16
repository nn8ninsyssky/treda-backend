const express = require('express');
const router = express.Router();

const controller = require('../controllers/technician.controller');
const authenticate = require('../middlewares/auth');

const { allowRoles } = require('../middlewares/roleCheck');

router.get('/', authenticate, controller.getAll);
//router.post('/', authenticate, controller.create);
router.post(
  '/',
  authenticate,
  allowRoles('vendor'),
  controller.createTechnician
);
router.get('/:id', authenticate, controller.getOne);
router.put('/:id', authenticate, controller.update);
router.delete('/:id', authenticate, controller.delete);

module.exports = router;