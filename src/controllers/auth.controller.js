const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const logger = require('../utils/logger');
const { User, Customer,Vendor,sequelize } = require('../models/pg');


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
    logger.info("✅ REGISTER API CALLED");

    const {
      name, email, password, role,
      phone, alt_phone, aadhaar,
      village, block, district, state, country,
      latitude, longitude, pincode
    } = req.body;
logger.info("REQUEST BODY:", req.body);
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
      
    
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let user; // ✅ FIX

    const t = await sequelize.transaction();

    try {
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        role
      }, { transaction: t });

   logger.info(`User registered: ${user.id}`);
        if(role==='customer'){
          await Customer.create({
          user_id: user.id,
          customer_name: name,
          
          customer_phone: phone,
          customer_alt_phone: alt_phone,
          customer_aadhaar_no: aadhaar,
          customer_village: village,
          customer_block: block,
          customer_district: district,
          customer_state: state,
          customer_country: country,
          customer_latitude: latitude,
          customer_longitude: longitude,
          customer_pincode: pincode,
        }, { transaction: t });
        }else if(role==='vendor'){
await Vendor.create({
    user_id: user.id,
    vendor_name: name,
    vendor_phone: phone,
    vendor_district: district,
    vendor_state: state,
    vendor_country: country,
  }, { transaction: t });
        }
      

      await t.commit();

    } catch (err) {
      await t.rollback();
      throw err;
    }
const tokens = generateTokens(user);

res.status(201).json({
  success: true,
  message: 'Registration successful',
  ...tokens,
  user: {
    id: user.id,
    email: user.email,
    role: user.role
  }
});
    

    

  } catch (err) {
    console.log("❌ FULL ERROR:", err);

  if (err.errors) {
    err.errors.forEach(e => {
      console.log("➡️", e.message);
    });
  }

  logger.error(err.message);

  return res.status(500).json({
    success: false,
    message: err.message,
    details: err.errors || null
  });
    //next(err); // ✅ VERY IMPORTANT
  }
};

/**
 * LOGIN
 */

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Find user (NOT customer)
    const user = await User.findOne({
  where: { email },
    attributes: { include: ['password'] }, // ✅ ADD THIS

  include: [
    {
      model: Customer,
      as: 'customer'
    },
    { model: Vendor, as: 'vendor' }
  ]
});

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // 2️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // 3️⃣ Generate tokens
    const tokens = generateTokens(user);
let profile = null;

if (user.role === 'customer') {
  profile = user.customer;

  if (!profile) {
    profile = await Customer.create({
      user_id: user.id,
      customer_name: user.name
    });
  }

} else if (user.role === 'vendor') {
  profile = user.vendor;
}
    
    res.json({
  success: true,
  message: 'Login successful',
  ...tokens,
  user: {
    id: user.id,
    email: user.email,
    role: user.role
  },
  profile
});
logger.info(`User logged in: ${user.id}`);

  } catch (err) {
    logger.error(err.message);
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