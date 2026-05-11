const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");
const { callSP } = require("../config/db.postgres");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn(`No token provided — IP: ${req.ip}`);

      return res.status(401).json({
        success: false,
        code: "NO_TOKEN",
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.tokenType !== "access") {
      return res.status(401).json({
        success: false,
        code: "INVALID_TOKEN_TYPE",
        message: "Invalid access token type.",
      });
    }

    if (!decoded.session_id || !decoded.jti) {
      return res.status(401).json({
        success: false,
        code: "INVALID_SESSION_TOKEN",
        message: "Invalid session token.",
      });
    }

    const result = await callSP(
      `
      SELECT public.sp_validate_user_session(
        :user_id::uuid,
        :session_id::uuid,
        :access_jti
      ) AS response
      `,
      {
        user_id: decoded.id,
        session_id: decoded.session_id,
        access_jti: decoded.jti,
      }
    );

    const sessionResponse = result?.[0]?.response;

    if (!sessionResponse || !sessionResponse.success) {
      return res.status(401).json({
        success: false,
        code: "SESSION_REVOKED_OR_INVALID",
        message: sessionResponse?.message || "Invalid session. Please login again.",
      });
    }

    req.user = {
      id: decoded.id,
      role: decoded.role,
      name: decoded.name,
      email: decoded.email,
      session_id: decoded.session_id,
      jti: decoded.jti,
    };

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      logger.warn(`Expired access token — IP: ${req.ip}`);

      return res.status(401).json({
        success: false,
        code: "ACCESS_TOKEN_EXPIRED",
        message: "Access token expired.",
      });
    }

    if (err.name === "JsonWebTokenError") {
      logger.warn(`Invalid token — IP: ${req.ip}`);

      return res.status(401).json({
        success: false,
        code: "INVALID_TOKEN",
        message: "Invalid token.",
      });
    }

    logger.error(err.message);
    next(err);
  }
};