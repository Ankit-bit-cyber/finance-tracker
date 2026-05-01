const Joi = require('joi');

const register = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(8).max(72).required(),
  currency: Joi.string().length(3).uppercase().default('USD'),
});

const login = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
});

const updateProfile = Joi.object({
  name: Joi.string().min(2).max(100),
  currency: Joi.string().length(3).uppercase(),
});

const changePassword = Joi.object({
  current_password: Joi.string().required(),
  new_password: Joi.string().min(8).max(72).required(),
});

module.exports = { register, login, updateProfile, changePassword };