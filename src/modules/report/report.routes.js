const express = require('express');
const router = express.Router();
const ctrl = require('./report.controller');

router.get('/monthly', ctrl.monthly);
router.get('/yearly',  ctrl.yearly);

module.exports = router;