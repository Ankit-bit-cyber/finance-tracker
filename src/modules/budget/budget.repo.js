const express = require('express');
const router = express.Router();
const ctrl = require('./transaction.controller');
const { validate } = require('../../middlewares/validation.middleware');
const v = require('./transaction.validation');

router.get('/',       validate(v.query, 'query'), ctrl.getAll);
router.get('/:id',    ctrl.getOne);
router.post('/',      validate(v.create),         ctrl.create);
router.put('/:id',    validate(v.update),          ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;