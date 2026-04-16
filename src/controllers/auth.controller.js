const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const logger = require('../utils/logger');
const { User, Customer } = require('../models/pg');


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

/**
 * REGISTER
 */



exports.register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      customer_phone,
      customer_alt_phone,
      customer_aadhaar_no,
      customer_village,
      customer_block,
      customer_district,
      customer_state,
      customer_country,
      customer_latitude,
      customer_longitude,
      customer_pincode
    } = req.body;

    // 🔍 Check existing
    const existing = await Customer.findOne({
      where: { customer_email: email }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Customer already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create customer directly
    const customer = await Customer.create({
      customer_name: name,
      customer_email: email,
      
      customer_phone,
      customer_alt_phone,
      customer_aadhaar_no,
      customer_village,
      customer_block,
      customer_district,
      customer_state,
      customer_country,
      customer_latitude,
      customer_longitude,
      customer_pincode,
    });

    res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      data: customer,
    });

  } catch (err) {
    next(err);
  }
};

// Registration //


exports.register = async (req, res, next) => {
  try {
    console.log("✅ REGISTER API CALLED");

    const {
      name, email, password, role,
      phone, alt_phone, adhaar,
      village, block, district, state, country,
      latitude, longitude, pincode
    } = req.body;

    // 1️⃣ Check if user exists
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // 2️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3️⃣ Create USER
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    // 4️⃣ If CUSTOMER → create profile
    if (role === 'customer') {
      await Customer.create({
        user_id: user.id,
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        customer_alt_phone: alt_phone,
        customer_aadhaar_no: adhaar,
        customer_village: village,
        customer_block: block,
        customer_district: district,
        customer_state: state,
        customer_country: country,
        customer_latitude: latitude,
        customer_longitude: longitude,
        customer_pincode: pincode,
      });
    }

    // 5️⃣ Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user_id: user.id
    });

  } catch (err) {
    next(err);
  }
};

/**
 * LOGIN
 */

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const customer = await Customer.findOne({
      where: { customer_email: email }
    });

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      customer.customer_password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const tokens = generateTokens({
      id: customer.customer_id,
      role: 'customer',
      name: customer.customer_name
    });

    res.json({
      success: true,
      message: 'Login successful',
      ...tokens,
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

    const user = users.find((u) => u.id === decoded.id);
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