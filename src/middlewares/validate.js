const logger = require('../utils/logger');

const validate = (schema) => {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const messages = error.details.map((d) => d.message);

        logger.warn(`Validation failed: ${messages.join(', ')}`);

        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: messages,
        });
      }

      req.body = value;
      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = validate;