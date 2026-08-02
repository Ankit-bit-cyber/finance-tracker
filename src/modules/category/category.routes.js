const express = require('express');
const router = express.Router();
const ctrl = require('./category.controller');
const { validate } = require('../../middlewares/validation.middleware');
const Joi = require('joi');

const schema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  type: Joi.string().valid('income', 'expense').required(),
  icon: Joi.string().max(10).default('📦'),
});
const updateSchema = Joi.object({
  name: Joi.string().min(1).max(100),
  icon: Joi.string().max(10),
});

router.get('/',        ctrl.getAll);
router.get('/:id',     ctrl.getOne);
router.post('/',       validate(schema),       ctrl.create);
router.put('/:id',     validate(updateSchema), ctrl.update);
router.delete('/:id',  ctrl.remove);

module.exports = router;
