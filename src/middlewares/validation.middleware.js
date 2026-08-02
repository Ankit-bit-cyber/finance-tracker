const { ApiError } = require('./error.middleware');

const validate = (schema, source = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[source], {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) {
    const errors = error.details.map(d => d.message.replace(/['"]/g, ''));
    return next(new ApiError(422, 'Validation failed', errors));
  }
  req[source] = value;
  next();
};

module.exports = { validate };
