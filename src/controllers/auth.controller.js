const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const logger = require('../utils/logger');
const { User, Customer,Vendor,sequelize } = require('../models/pg');
const { callSP } = require('../config/db.postgres');


/**
 * Generate tokens
 */
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
};



// Registration //

exports.register = async (req, res, next) => {
  try {
    const {
      name, email, password,
      phone, alt_phone, aadhaar,
      village, block, district, state, country,
      latitude, longitude, pincode
    } = req.body;

    const result = await callSP(
      `SELECT sp_register_customer(
        :name, :email, :password,
        :phone, :alt_phone, :aadhaar,
        :village, :block, :district, :state, :country,
        :latitude, :longitude, :pincode
      )`,
      {
        name, email, password,
        phone, alt_phone, aadhaar,
        village, block, district, state, country,
        latitude, longitude, pincode
      }
    );

    const response = result[0].sp_register_customer;

    if (!response.success) {
      return res.status(400).json(response);
    }

    // ✅ ONLY backend logic allowed → JWT
    const tokens = generateTokens(response);

    res.status(201).json({
      ...response,
      ...tokens
    });

  } catch (err) {
    next(err);
  }
};


/**
 * LOGIN
 */

// exports.login = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;

//     // 1️⃣ Find user (NOT customer)
//     const user = await User.findOne({
//   where: { email },
//     attributes: { include: ['password'] }, // ✅ ADD THIS

//   include: [
//     {
//       model: Customer,
//       as: 'customer'
//     },
//     { model: Vendor, as: 'vendor' }
//   ]
// });

//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid credentials',
//       });
//     }

//     // 2️⃣ Compare password
//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid credentials',
//       });
//     }

//     // 3️⃣ Generate tokens
//     const tokens = generateTokens(user);
// let profile = null;

// if (user.role === 'customer') {
//   profile = user.customer;

//   if (!profile) {
//     profile = await Customer.create({
//       user_id: user.id,
//       customer_name: user.name
//     });
//   }

// } else if (user.role === 'vendor') {
//   profile = user.vendor;
//   if (!profile) {
//     profile = await Vendor.create({
//       user_id: user.id,
//       vendor_name: user.name
//     });
//   }
// }
    
//     res.json({
//   success: true,
//   message: 'Login successful',
//   ...tokens,
//   user: {
//     id: user.id,
//     email: user.email,
//     role: user.role
//   },
//   profile
// });
// logger.info(`User logged in: ${user.id}`);

//   } catch (err) {
//     logger.error(err.message);
//     next(err);
//   }
// };

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await callSP(
      `SELECT sp_login_customer(:email, :password)`,
      { email, password }
    );

    const response = result[0].sp_login_customer;

    if (!response.success) {
      return res.status(401).json(response);
    }

    const tokens = generateTokens(response.user);

    res.json({
      ...response,
      ...tokens
    });

  } catch (err) {
    next(err);
  }
};

/**
 * REFRESH TOKEN
 */
exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findByPk(decoded.id); // ✅ FIX

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    const tokens = generateTokens(user);

    res.json({
      success: true,
      ...tokens,
    });

  } catch (err) {
    next(err);
  }
};

/**
 * LOGOUT
 */
exports.logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
};