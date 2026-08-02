const authService = require('./auth.service');
const { sign } = require('../../utils/jwt');

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user.id);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await authService.updateProfile(req.user.id, req.body);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

const changePassword = async (req, res, next) => {
  try {
    const result = await authService.changePassword(req.user.id, req.body);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

// Google OAuth callback — issue JWT and redirect to frontend
const googleCallback = (req, res) => {
  const token = sign({ id: req.user.id, email: req.user.email });
  // Redirect to frontend with token in query param (frontend stores it)
  res.redirect(`/auth-success.html?token=${token}`);
};

module.exports = { register, login, getProfile, updateProfile, changePassword, googleCallback };
