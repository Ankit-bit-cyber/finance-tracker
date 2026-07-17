const express = require('express');
const router = express.Router();
const ctrl = require('./upload.controller');
const { upload } = require('./upload.middleware');

router.get('/',        ctrl.getReceipts);
router.post('/',       upload.single('receipt'), ctrl.uploadReceipt);
router.delete('/:id',  ctrl.deleteReceipt);

module.exports = router;