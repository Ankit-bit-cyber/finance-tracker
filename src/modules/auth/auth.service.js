const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { sign } = require('../../utils/jwt');
const { ApiError } = require('../../middlewares/error.middleware');
const userRepo = require('../user/user.repo');

const SALT_ROUNDS = 12;

const register = async ({ name, email, password, currency = 'USD' }) => {
  const existing = await userRepo.findByEmail(email);
  if (existing) throw new ApiError(409, 'Email already registered');

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userRepo.create({
    id: uuidv4(), name, email, password_hash, currency,
  });

  const token = sign({ id: user.id, email: user.email });
  return { user: sanitize(user), token };
};

const login = async ({ email, password }) => {
  const user = await userRepo.findByEmail(email);
  if (!user) throw new ApiError(401, 'Invalid email or password');
  if (!user.password_hash) throw new ApiError(401, 'Please use Google login for this account');

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new ApiError(401, 'Invalid email or password');
  if (!user.is_active) throw new ApiError(403, 'Account is disabled');

  const token = sign({ id: user.id, email: user.email });
  return { user: sanitize(user), token };
};

const getProfile = async (userId) => {
  const user = await userRepo.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');
  return sanitize(user);
};

const updateProfile = async (userId, data) => {
  const user = await userRepo.update(userId, data);
  if (!user) throw new ApiError(404, 'User not found');
  return sanitize(user);
};

const changePassword = async (userId, { current_password, new_password }) => {
  const user = await userRepo.findById(userId);
  if (!user || !user.password_hash) throw new ApiError(400, 'No password set on this account');

  const valid = await bcrypt.compare(current_password, user.password_hash);
  if (!valid) throw new ApiError(401, 'Current password is incorrect');

  const password_hash = await bcrypt.hash(new_password, SALT_ROUNDS);
  await userRepo.update(userId, { password_hash });
  return { message: 'Password updated successfully' };
};

const sanitize = (user) => {
  const { password_hash, ...safe } = user;
  return safe;
};

module.exports = { register, login, getProfile, updateProfile, changePassword, sanitize };
