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

exports.registerCustomer = async (req, res, next) => {
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

exports.loginCustomer = async (req, res, next) => {
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


//Vendor registration

exports.registerVendor = async (req, res, next) => {
  try {
    
    const {
  name, email, password,
   company_reg_no, vendor_gst_no,
  contact_person, vendor_phone,
  district, state, country,
  lat, long
} = req.body;

    logger.push("Body:",req.body);
    console.log("Body:",req.body);
    const result= await callSP(
  `SELECT sp_register_vendor(
    :name, :email, :password,
     :company_reg_no, :vendor_gst_no,
    :contact_person, :vendor_phone,
    :district, :state, :country,
    :lat, :long
  )`,
  {
    name, email, password,
     company_reg_no, vendor_gst_no,
    contact_person, vendor_phone,
    district, state, country,
    lat, long
  }
);
    const response = result[0].sp_register_vendor;
logger.push("response",response);
console.log("response",response);
    if (!response.success) {
      return res.status(400).json(response);
    }

    res.status(201).json(response);

  } catch (err) {
    next(err);
  }
};


// vendor login

exports.loginVendor = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await callSP(
      `SELECT sp_login_vendor(:email, :password)`,
      { email, password }
    );

    const response = result[0].sp_login_vendor;

    if (!response.success) {
      return res.status(401).json(response);
    }

    const tokens = generateTokens({
      id: response.user_id,
      role: response.role,
      name: response.name
    });

    res.json({
      ...response,
      ...tokens
    });

  } catch (err) {
    next(err);
  }
};


// Treda Admin Login
exports.loginTredaAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await callSP(
      `SELECT sp_login_admin(:email, :password)`,
      { email, password }
    );

    const response = result[0].sp_login_admin;

    if (!response.success) {
      return res.status(401).json(response);
    }

    const tokens = generateTokens({
      id: response.user.id,
      role: response.user.role,
      name: response.user.name
    });

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