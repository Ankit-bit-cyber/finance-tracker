const express = require('express');
const passport = require('passport');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const ctrl = require('./auth.controller');
const { validate } = require('../../middlewares/validation.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const v = require('./auth.validation');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many attempts, try again in 15 minutes' },
});

router.post('/register', authLimiter, validate(v.register), ctrl.register);
router.post('/login',    authLimiter, validate(v.login),    ctrl.login);

router.get('/me',              authenticate, ctrl.getProfile);
router.put('/profile',         authenticate, validate(v.updateProfile), ctrl.updateProfile);
router.put('/change-password', authenticate, validate(v.changePassword), ctrl.changePassword);

// Google OAuth
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login.html?error=oauth_failed', session: false }),
  ctrl.googleCallback
);

module.exports = router;
