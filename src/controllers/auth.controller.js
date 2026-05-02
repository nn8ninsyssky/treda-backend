const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const logger = require('../utils/logger');
const { User, Customer,Vendor,sequelize } = require('../models/pg');
const { callSP } = require('../config/db.postgres');
const crypto = require('crypto');
const { sendEmail } = require('../services/email.service');


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

//Email verification For all registration
exports.sendVendorEmailOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    // 1. Generate OTP (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Store OTP in DB
    const result = await callSP(
      `SELECT sp_store_email_otp(:email, :otp)`,
      { email, otp }
    );

    const response = result?.[0]?.sp_store_email_otp;

    if (!response.success) {
      return res.status(400).json(response);
    }

    // 3. Send Email (IMPORTANT)
    await sendEmail({
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully"
    });

  } catch (err) {
    next(err);
  }
};
exports.verifyVendorEmailOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required"
      });
    }

    const result = await callSP(
      `SELECT sp_verify_email_otp(:email, :otp)`,
      { email, otp }
    );

    const response = result?.[0]?.sp_verify_email_otp;

    if (!response.success) {
      return res.status(400).json(response);
    }

    return res.status(200).json(response);

  } catch (err) {
    next(err);
  }
};
//forgot password controller function for all roles...
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email,page } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    // Generate token
    const token = require('crypto').randomBytes(32).toString('hex');

    // Store token
    const result = await callSP(
      `SELECT sp_create_password_reset(:email, :token)`,
      { email, token }
    );

    const response = result?.[0]?.sp_create_password_reset;

    if (!response.success) {
      return res.status(400).json(response);
    }

    //  Create reset link
    const resetLink = `https://unstable-follow-quarrel.ngrok-free.dev/reset-password?email=${email}&token=${token}&page=${page}`;

    // Send email
    await sendEmail({
      to: email,
      subject: "Reset Your Password",
      text: `Click the link to reset your password:\n${resetLink}\n\nLink expires in 10 minutes.`
    });

    res.status(200).json({
      success: true,
      message: "Password reset link sent"
    });

  } catch (err) {
    next(err);
  }
};

// Reset password  controller function for all roles...
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, token, new_password } = req.body;

    if (!email || !token || !new_password) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    const result = await callSP(
      `SELECT sp_reset_password(:email, :token, :new_password)`,
      { email, token, new_password }
    );

    const response = result?.[0]?.sp_reset_password;

    if (!response.success) {
      return res.status(400).json(response);
    }

    res.status(200).json(response);

  } catch (err) {
    next(err);
  }
};
// Change Password for all roles...
exports.changePassword = async (req, res, next) => {
  try {
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: "Old and new password are required"
      });
    }

    const result = await callSP(
      `SELECT sp_change_password(:user_id, :old_password, :new_password)`,
      {
        user_id: req.user.id, //  from JWT
        old_password,
        new_password
      }
    );

    const response = result?.[0]?.sp_change_password;

    if (!response.success) {
      return res.status(400).json(response);
    }

    //  Send Email Notification
    try {
      await sendEmail({
        to: response.email,
        subject: "Password Changed Successfully",
        text: `
Hello ${response.name},

Your password has been successfully changed.

If this was not you, please contact support immediately.

Thank you.
        `
      });
    } catch (mailErr) {
      console.error("Email failed:", mailErr.message);
    }

    return res.status(200).json(response);

  } catch (err) {
    next(err);
  }
};


// Panchayat Registration //

exports.registerPanchayat = async (req, res, next) => {
  try {
    const {
      name, email, password,
      phone, alt_phone, aadhaar,
      village, block, district, state, country,
      latitude, longitude, pincode
    } = req.body;

    const result = await callSP(
      `SELECT sp_register_panchayat(
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

    const response = result[0].sp_register_panchayat;

    if (!response.success) {
      return res.status(400).json(response);
    }

    // Generate JWT
    const tokens = generateTokens(response);

    // SEND EMAIL
    try {
      await sendEmail({
        to: email,
        subject: "Panchayat Registration Successful",
        text: `
Hello ${name},

Your account has been successfully created.

Login Details:
Email: ${email}
Password: ${password}

Please login and change your password after first login.

Thank you.
        `
      });
    } catch (mailErr) {
      console.error("Email failed:", mailErr.message);
    }

    res.status(201).json({
      ...response,
      ...tokens
    });

  } catch (err) {
    next(err);
  }
};


/**
 * Customer LOGIN
 */

exports.loginPanchayat = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await callSP(
      `SELECT sp_login_panchayat(:email, :password)`,
      { email, password }
    );

    const response = result[0].sp_login_panchayat;

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

    const result = await callSP(
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

    if (!response.success) {
      return res.status(400).json(response);
    }

    // SEND EMAIL AFTER SUCCESS
    try {
      await sendEmail({
        to: email,
        subject: "Vendor Registration Successful",
        text: `
Hello ${name},

Your vendor account has been successfully created.

Login Details:
Email: ${email}
Password: ${password}

Please login and change your password after first login.

Thank you.
        `
      });
    } catch (mailErr) {
      console.error("Email sending failed:", mailErr.message);
      // ❗ Don't fail API because of email issue
    }

    return res.status(201).json(response);

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

// Technician Registration
exports.registerTechnician = async (req, res, next) => {
  try {
    const { email, name, password } = req.body;

    // Optional basic validation
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required"
      });
    }

    const result = await callSP(
      `SELECT sp_register_technician_by_vendor(:user_id, :data)`,
      {
        user_id: req.user.id,
        data: JSON.stringify(req.body)
      }
    );

    const response = result[0].sp_register_technician_by_vendor;

    if (!response.success) {
      return res.status(400).json(response);
    }

    // SEND EMAIL AFTER SUCCESS
    try {
      await sendEmail({
        to: email,
        subject: "Technician Registration Successful",
        text: `
Hello ${name},

Your technician account has been successfully created.

Login Details:
Email: ${email}
Password:${password}

Please login and change your password after first login.


Thank you.
        `
      });
    } catch (mailErr) {
      console.error("Email sending failed:", mailErr.message);
      // Do not fail API
    }

    return res.status(201).json(response);

  } catch (err) {
    next(err);
  }
};

// Technician Login
exports.loginTechnician = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await callSP(
      `SELECT sp_login_technician(:email, :password)`,
      { email, password }
    );

    const response = result[0].sp_login_technician;

    if (!response.success) {
      return res.status(401).json(response);
    }
console.log("response technician",response);
logger.push("technician response",response.data)
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