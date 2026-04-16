const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/auth.controller');
const validate   = require('../middlewares/validate');
const { registerSchema,
        loginSchema,
        refreshSchema } = require('../validators/auth.validator');

// POST /api/auth/register
// router.post('/register',
//   validate(registerSchema),
//   controller.register
// );
router.post('/register', (req, res, next) => {
  console.log("🔥 REGISTER ROUTE HIT");
  next();
}, validate(registerSchema), controller.register);

// POST /api/auth/login
router.post('/login',
  validate(loginSchema),
  controller.login
);

// POST /api/auth/refresh  — get new access token using refresh token
router.post('/refresh',
  validate(refreshSchema),
  controller.refresh
);

// POST /api/auth/logout
router.post('/logout', controller.logout);

console.log('registerSchema:', registerSchema);
console.log('validate:', validate);
console.log('controller.register:', controller.register);

module.exports = router;