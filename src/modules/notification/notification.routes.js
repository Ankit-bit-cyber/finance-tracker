// notification.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('./notification.controller');

router.get('/',         ctrl.getAll);
router.put('/:id/read', ctrl.markRead);

module.exports = router;
