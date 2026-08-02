const express = require('express');
const router = express.Router();
const ctrl = require('./dashboard.controller');

router.get('/summary', ctrl.getSummary);

module.exports = router;
