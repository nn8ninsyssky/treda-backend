const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const logger = require('../utils/logger');
const { callSP } = require('../config/db.postgres');
const crypto = require('crypto');
const { sendEmail } = require('../services/email.service');
const { generateTokens, hashToken } = require('../utils/token.utils');
const { createLoginSession } = require("../utils/session.utils");


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
    const { email, page } = req.body;

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
      name,
      email,
      password,
      phone,
      alt_phone,
      village,
      block,
      district,
      state,
      country,
      latitude,
      longitude,
      pincode,
    } = req.body || {};

    const result = await callSP(
      `
      SELECT public.sp_register_panchayat(
        :admin_user_id,
        :name,
        :email,
        :password,
        :phone,
        :alt_phone,
        :village,
        :block,
        :district,
        :state,
        :country,
        :latitude,
        :longitude,
        :pincode
      ) AS response
      `,
      {
        admin_user_id: req.user.id,

        name: name ? String(name).trim() : null,
        email: email ? String(email).trim().toLowerCase() : null,
        password: password ? String(password) : null,

        phone: phone ? String(phone).trim() : null,
        alt_phone: alt_phone ? String(alt_phone).trim() : null,

        village: village ? String(village).trim() : null,
        block: block ? String(block).trim() : null,
        district: district ? String(district).trim() : null,
        state: state ? String(state).trim() : null,
        country: country ? String(country).trim() : null,

        latitude:
          latitude !== undefined &&
            latitude !== null &&
            String(latitude).trim() !== ""
            ? Number(latitude)
            : null,

        longitude:
          longitude !== undefined &&
            longitude !== null &&
            String(longitude).trim() !== ""
            ? Number(longitude)
            : null,

        pincode: pincode ? String(pincode).trim() : null,
      }
    );

    const response = result[0].response;

    if (!response.success) {
      return res.status(400).json(response);
    }

    try {
      await sendEmail({
        to: email,
        subject: "Panchayat Registration Successful",
        text: `
Hello ${name},

Your Panchayat account has been successfully created.

Login Details:
Email: ${email}
Password: ${password}

Please login and change your password after first login.

Thank you.
        `,
      });
    } catch (mailErr) {
      console.error("Email failed:", mailErr.message);
    }

    return res.status(201).json(response);
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

    const tokens = await createLoginSession({
      user: response.user,
      req,
    });

    return res.json({
      ...response,
      ...tokens,
    });

  } catch (err) {
    next(err);
  }
};


//Vendor registration

exports.registerVendor = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      vendor_name,
      company_reg_no,
      vendor_gst_no,
      contact_person,
      vendor_phone,
      district,
      state,
      country,
      lat,
      long
    } = req.body;

    const result = await callSP(
      `SELECT public.sp_register_vendor(
        :name,
        :email,
        :password,
        :vendor_name,
        :company_reg_no,
        :vendor_gst_no,
        :contact_person,
        :vendor_phone,
        :district,
        :state,
        :country,
        :lat,
        :long
      )`,
      {
        name,
        email,
        password,
        vendor_name,
        company_reg_no,
        vendor_gst_no,
        contact_person,
        vendor_phone,
        district,
        state,
        country,
        lat,
        long
      }
    );

    const response = result[0].sp_register_vendor;

    if (!response.success) {
      return res.status(400).json(response);
    }

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

    const userForToken = {
      id: response.user_id,
      role: response.role,
      name: response.name,
      email: response.email || null,
    };

    const tokens = await createLoginSession({
      user: userForToken,
      req,
    });

    return res.json({
      ...response,
      ...tokens,
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

    const userForToken = {
      id: response.user.id,
      role: response.user.role,
      name: response.user.name,
      email: response.user.email || null,
    };

    const tokens = await createLoginSession({
      user: userForToken,
      req,
    });

    return res.json({
      ...response,
      ...tokens,
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

    const response = result?.[0]?.sp_login_admin;

    if (!response) {
      return res.status(500).json({
        success: false,
        message: "Login failed. No response from database."
      });
    }

    if (!response.success) {
      let statusCode = 401;

      if (response.message === "Please try with a valid email!") {
        statusCode = 404;
      }

      if (response.message === "Please enter a valid password!") {
        statusCode = 401;
      }

      if (response.message === "Admin not verified") {
        statusCode = 403;
      }

      return res.status(statusCode).json(response);
    }

    const userForToken = {
      id: response.user.id,
      role: response.user.role,
      name: response.user.name,
      email: response.user.email || null,
    };

    const tokens = await createLoginSession({
      user: userForToken,
      req,
    });

    return res.status(200).json({
      ...response,
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

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        code: "NO_REFRESH_TOKEN",
        message: "Refresh token missing.",
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    if (decoded.tokenType !== "refresh") {
      return res.status(403).json({
        success: false,
        code: "INVALID_TOKEN_TYPE",
        message: "Invalid token type.",
      });
    }

    if (!decoded.session_id || !decoded.jti) {
      return res.status(403).json({
        success: false,
        code: "INVALID_REFRESH_TOKEN",
        message: "Invalid refresh token.",
      });
    }

    const validateResult = await callSP(
      `
      SELECT public.sp_validate_refresh_session(
        :user_id::uuid,
        :session_id::uuid,
        :refresh_jti,
        :refresh_token_hash
      ) AS response
      `,
      {
        user_id: decoded.id,
        session_id: decoded.session_id,
        refresh_jti: decoded.jti,
        refresh_token_hash: hashToken(refreshToken),
      }
    );

    const validateResponse = validateResult?.[0]?.response;

    if (!validateResponse || !validateResponse.success) {
      return res.status(401).json({
        success: false,
        code: "INVALID_REFRESH_SESSION",
        message: validateResponse?.message || "Invalid refresh session.",
      });
    }

    const tokens = generateTokens(validateResponse.user, decoded.session_id);

    const rotateResult = await callSP(
      `
      SELECT public.sp_rotate_user_session_tokens(
        :user_id::uuid,
        :session_id::uuid,
        :new_access_jti,
        :new_refresh_jti,
        :new_refresh_token_hash,
        :new_access_expires_at,
        :new_refresh_expires_at
      ) AS response
      `,
      {
        user_id: validateResponse.user.id,
        session_id: decoded.session_id,
        new_access_jti: tokens.accessJti,
        new_refresh_jti: tokens.refreshJti,
        new_refresh_token_hash: tokens.refreshTokenHash,
        new_access_expires_at: tokens.accessExpiresAt,
        new_refresh_expires_at: tokens.refreshExpiresAt,
      }
    );

    const rotateResponse = rotateResult?.[0]?.response;

    if (!rotateResponse || !rotateResponse.success) {
      return res.status(401).json({
        success: false,
        code: "SESSION_ROTATE_FAILED",
        message: rotateResponse?.message || "Failed to rotate session.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully.",
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });

  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(403).json({
        success: false,
        code: "REFRESH_TOKEN_EXPIRED",
        message: "Refresh token expired. Please login again.",
      });
    }

    if (err.name === "JsonWebTokenError") {
      return res.status(403).json({
        success: false,
        code: "INVALID_REFRESH_TOKEN",
        message: "Invalid refresh token.",
      });
    }

    next(err);
  }
};

/**
 * LOGOUT
 */
exports.logout = async (req, res, next) => {
  try {
    const result = await callSP(
      `
      SELECT public.sp_logout_current_session(
        :user_id::uuid,
        :session_id::uuid
      ) AS response
      `,
      {
        user_id: req.user.id,
        session_id: req.user.session_id,
      }
    );

    const response = result?.[0]?.response;

    if (!response || !response.success) {
      return res.status(400).json(response || {
        success: false,
        message: "Logout failed",
      });
    }

    return res.status(200).json(response);

  } catch (err) {
    next(err);
  }
};
exports.logoutAllDevices = async (req, res, next) => {
  try {
    const result = await callSP(
      `
      SELECT public.sp_logout_all_sessions(
        :user_id::uuid
      ) AS response
      `,
      {
        user_id: req.user.id,
      }
    );

    const response = result?.[0]?.response;

    if (!response || !response.success) {
      return res.status(400).json(response || {
        success: false,
        message: "Logout from all devices failed",
      });
    }

    return res.status(200).json(response);

  } catch (err) {
    next(err);
  }
};