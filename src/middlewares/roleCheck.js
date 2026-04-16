const logger = require('../utils/logger');

// All valid roles in the TREDA system
const ROLES = {
  ADMIN:         'admin',
  TREDA_OFFICER: 'treda_officer',
  VENDOR:        'vendor',
  TECHNICIAN:    'technician',
  CUSTOMER:      'customer',
};

/**
 * Returns middleware that allows only the specified roles.
 * Always use AFTER authenticate middleware.
 *
 * Usage:
 *   router.get('/all', authenticate, allowRoles('admin', 'treda_officer'), handler)
 *   router.get('/me',  authenticate, allowRoles('customer'), handler)
 */
const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated.',
      });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(
        `Forbidden: role '${req.user.role}' tried ${req.method} ${req.originalUrl}`
      );
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission for this action.',
      });
    }

    next();
  };
};

/**
 * Lets a user access only their own resource.
 * Compares req.user.id with the :id param in the URL.
 * Admin and treda_officer bypass this check automatically.
 *
 * Usage:
 *   router.get('/:id', authenticate, isSelfOrAdmin, handler)
 */
const isSelfOrAdmin = (req, res, next) => {
  const { id, role } = req.user;
  const bypassRoles   = [ROLES.ADMIN, ROLES.TREDA_OFFICER];

  if (bypassRoles.includes(role) || id === req.params.id) {
    return next();
  }

  logger.warn(
    `Ownership check failed: user ${id} tried to access resource ${req.params.id}`
  );

  return res.status(403).json({
    success: false,
    message: 'Access denied. You can only access your own data.',
  });
};

module.exports = { allowRoles, isSelfOrAdmin, ROLES };