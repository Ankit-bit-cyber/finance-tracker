const logger = require('../utils/logger');

class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
  }
}

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors.length ? err.errors : undefined,
    });
  }

  // Postgres errors
  if (err.code === '23505') {
    return res.status(409).json({ success: false, message: 'Resource already exists' });
  }
  if (err.code === '23503') {
    return res.status(400).json({ success: false, message: 'Referenced resource not found' });
  }
  if (err.code === '22P02') {
    return res.status(400).json({ success: false, message: 'Invalid ID format' });
  }

  logger.error(err);
  return res.status(500).json({ success: false, message: 'Internal server error' });
};

module.exports = { errorHandler, ApiError };
