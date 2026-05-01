const express = require('express');
const router = express.Router();
const ctrl = require('./budget.controller');
const { validate } = require('../../middlewares/validation.middleware');
const Joi = require('joi');

const createSchema = Joi.object({
  category_id:  Joi.string().uuid().required(),
  amount:       Joi.number().positive().required(),
  currency:     Joi.string().length(3).uppercase().default('USD'),
  period:       Joi.string().valid('monthly','weekly','yearly').default('monthly'),
  month:        Joi.number().integer().min(1).max(12),
  year:         Joi.number().integer().min(2000).max(2100),
  alert_at_pct: Joi.number().integer().min(1).max(100).default(80),
});
const updateSchema = createSchema.fork(
  ['category_id','amount'], s => s.optional()
);

router.get('/',       ctrl.getAll);
router.get('/:id',    ctrl.getOne);
router.post('/',      validate(createSchema), ctrl.create);
router.put('/:id',    validate(updateSchema), ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;