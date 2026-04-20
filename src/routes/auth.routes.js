const express = require('express');
const router = express.Router();

const controller = require('../controllers/auth.controller');
const validate = require('../middlewares/validate');

const {
  registerSchema,
  loginSchema,
  refreshSchema
} = require('../validators/auth.validator');

// REGISTER
router.post(
  '/register',
  validate(registerSchema),
  controller.register
);

// LOGIN
router.post(
  '/login',
  validate(loginSchema),
  controller.login
);

// REFRESH
router.post(
  '/refresh',
  validate(refreshSchema),
  controller.refresh
);

// LOGOUT
router.post('/logout', controller.logout);

module.exports = router;