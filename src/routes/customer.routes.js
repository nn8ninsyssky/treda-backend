const express = require('express');
const router = express.Router();

const controller = require('../controllers/customer.controller') ;
const authenticate = require('../middlewares/auth');


// GET logged-in customer
router.get("/me", authenticate, controller.getProfile);


// router.get('/', authenticate, controller.getAll);
router.post('/', authenticate, controller.create);
router.get('/:id', authenticate, controller.getOne);
router.put('/:id', authenticate, controller.update);
router.delete('/:id', authenticate, controller.delete);

module.exports = router;