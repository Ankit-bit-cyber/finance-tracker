const Joi = require('joi');

const create = Joi.object({
  type:        Joi.string().valid('income', 'expense').required(),
  amount:      Joi.number().not(0).required()
                 .messages({ 'number.base': 'Amount must be a number', 'any.invalid': 'Amount cannot be zero' }),
  currency:    Joi.string().length(3).uppercase().default('USD'),
  category_id: Joi.string().uuid().allow(null, '').default(null),
  description: Joi.string().max(500).allow('', null),
  date:        Joi.date().iso().max('now').default(() => new Date()),
  is_refund:   Joi.boolean().default(false),
});

const update = Joi.object({
  amount:      Joi.number().not(0),
  currency:    Joi.string().length(3).uppercase(),
  category_id: Joi.string().uuid().allow(null, ''),
  description: Joi.string().max(500).allow('', null),
  date:        Joi.date().iso().max('now'),
  is_refund:   Joi.boolean(),
});

const query = Joi.object({
  type:        Joi.string().valid('income', 'expense'),
  category_id: Joi.string().uuid(),
  start_date:  Joi.date().iso(),
  end_date:    Joi.date().iso().min(Joi.ref('start_date')),
  currency:    Joi.string().length(3).uppercase(),
  page:        Joi.number().integer().min(1).default(1),
  limit:       Joi.number().integer().min(1).max(100).default(20),
  sort:        Joi.string().valid('date', 'amount', 'created_at').default('date'),
  order:       Joi.string().valid('asc', 'desc').default('desc'),
});

module.exports = { create, update, query };
