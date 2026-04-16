const jwt    = require('jsonwebtoken');
const logger = require('../utils/logger');

/**
 * Verifies the JWT token from the Authorization header.
 * On success, attaches decoded payload to req.user.
 * Format expected:  Authorization: Bearer <token>
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach full user info to request for use in controllers
    req.user = {
      id:   decoded.id,
      role: decoded.role,
      name: decoded.name,
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      logger.warn(`Expired token used — IP: ${req.ip}`);
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.',
      });
    }

    if (err.name === 'JsonWebTokenError') {
      logger.warn(`Invalid token attempt — IP: ${req.ip}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
      });
    }

    next(err); // unexpected error → central error handler
  }
};

module.exports = authenticate;