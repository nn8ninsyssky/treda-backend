const { Customer } = require('../models/pg');
const { User } = require('../models/pg');
const bcrypt = require('bcrypt');
exports.createCustomer = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ where: { email } });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Customer already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'customer',
    });

    res.status(201).json({
      success: true,
      message: 'Customer created by self',
      data: customer,
    });

  } catch (err) {
    next(err);
  }
};

exports.getMyCustomer = async (req, res, next) => {
  try {
    const userId = req.user.id; // coming from JWT

    const customer = await Customer.findOne({
      where: { user_id: userId }
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    res.json({
      success: true,
      message: "Customer profile fetched",
      data: customer
    });

  } catch (err) {
    next(err);
  }
};



exports.getAll = async (req, res, next) => {
  try {
    const { district, state, search, page = 1, limit = 10 } = req.query;

    const where = {};

    if (district) where.customer_district = district;
    if (state) where.customer_state = state;

    if (search) {
      const { Op } = require("sequelize");
      where.customer_name = {
        [Op.iLike]: `%${search}%`
      };
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Customer.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      data: rows
    });

  } catch (err) {
    next(err);
  }
};

// exports.getOne = async (req, res, next) => {
//   try {
//     const customer = await Customer.findOne({
//       where: { id: req.params.id }
//     });

//     if (!customer) {
//       return res.status(404).json({
//         success: false,
//         message: "Customer not found"
//       });
//     }

//     res.json({
//       success: true,
//       data: customer
//     });

//   } catch (err) {
//     next(err);
//   }
// };

exports.updateMyCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({
      where: { user_id: req.user.id }
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    const allowedFields = [
      "customer_name",
      "customer_phone",
      "customer_alt_phone",
      "customer_aadhaar_no",
      "customer_village",
      "customer_block",
      "customer_district",
      "customer_state",
      "customer_country",
      "customer_latitude",
      "customer_longitude",
      "customer_pincode"
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        customer[field] = req.body[field];
      }
    });

    await customer.save();

    res.json({
      success: true,
      message: "Customer updated successfully",
      data: customer
    });

  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findOne({
      where: { id }
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    // 🔥 delete linked user also
    await User.destroy({
      where: { id: customer.user_id }
    });

    // delete customer
    await customer.destroy();

    res.json({
      success: true,
      message: "Customer and user deleted successfully"
    });

  } catch (err) {
    next(err);
  }
};