const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn(`No token provided — IP: ${req.ip}`);

      return res.status(401).json({
        success: false,
        code: 'NO_TOKEN',
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      role: decoded.role,
      name: decoded.name,
      email: decoded.email,
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      logger.warn(`Expired access token — IP: ${req.ip}`);

      return res.status(401).json({
        success: false,
        code: 'ACCESS_TOKEN_EXPIRED',
        message: 'Access token expired.',
      });
    }

    if (err.name === 'JsonWebTokenError') {
      logger.warn(`Invalid token — IP: ${req.ip}`);

      return res.status(401).json({
        success: false,
        code: 'INVALID_TOKEN',
        message: 'Invalid token.',
      });
    }

    logger.error(err.message);
    next(err);
  }
};