// user.service.js
const userRepo = require('./user.repo');
const { ApiError } = require('../../middlewares/error.middleware');
const { sanitize } = require('../auth/auth.service');

const getById = async (id) => {
  const user = await userRepo.findById(id);
  if (!user) throw new ApiError(404, 'User not found');
  return sanitize(user);
};

module.exports = { getById };