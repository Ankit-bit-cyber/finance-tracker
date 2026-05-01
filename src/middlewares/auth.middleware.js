const { verify } = require('../utils/jwt');
const ApiError = require('./error.middleware').ApiError;

const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authentication required'));
  }
  try {
    const token = header.split(' ')[1];
    const payload = verify(token);
    req.user = { id: payload.id, email: payload.email };
    next();
  } catch (err) {
    return next(new ApiError(401, 'Invalid or expired token'));
  }
};

module.exports = { authenticate };