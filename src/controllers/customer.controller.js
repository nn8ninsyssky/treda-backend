const { Customer } = require('../models/pg');
const { User } = require('../models/pg');
const bcrypt = require('bcrypt');
// exports.createCustomer = async (req, res, next) => {
//   try {
//     const { name, email, password } = req.body;

//     const existing = await User.findOne({ where: { email } });

//     if (existing) {
//       return res.status(400).json({
//         success: false,
//         message: 'Customer already exists',
//       });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const customer = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       role: 'customer',
//     });

//     res.status(201).json({
//       success: true,
//       message: 'Customer created by self',
//       data: customer,
//     });

//   } catch (err) {
//     next(err);
//   }
// };
const { callSP } = require('../config/db.postgres');

exports.getMyCustomer = async (req, res, next) => {
  try {
    const result = await callSP(
      `SELECT sp_get_customer_by_user_id(:user_id)`,
      { user_id: req.user.id }
    );

    res.json(result[0].sp_get_customer_by_user_id);

  } catch (err) {
    next(err);
  }
};

exports.updateMyCustomer = async (req, res, next) => {
  console.log("BODY",req.body)
  try {
    const result = await callSP(
      `SELECT sp_update_customer(:user_id, :data)`,
      {
        user_id: req.user.id,
        data: JSON.stringify(req.body)
        
      }
    );

    res.json(result[0].sp_update_customer);

  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const result = await callSP(
      `SELECT sp_delete_customer(:id)`,
      { id: req.params.id }
    );

    res.json(result[0].sp_delete_customer);

  } catch (err) {
    next(err);
  }
};