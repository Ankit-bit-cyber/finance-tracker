const jwt = require('jsonwebtoken');
const env = require('../config/env');

const sign = (payload) =>
  jwt.sign(payload, env.jwt.secret, { expiresIn: env.jwt.expiresIn });

const verify = (token) =>
  jwt.verify(token, env.jwt.secret);

module.exports = { sign, verify };