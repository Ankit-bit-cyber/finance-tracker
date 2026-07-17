const express = require('express');
const router = express.Router();
const svc = require('./currency.service');

// GET /api/currencies
router.get('/', (req, res) => {
  res.json({ success: true, data: svc.getSupportedCurrencies() });
});

// GET /api/currencies/convert?from=USD&to=INR&amount=100
router.get('/convert', async (req, res, next) => {
  try {
    const { from = 'USD', to = 'USD', amount = 1 } = req.query;
    const result = await svc.convert(parseFloat(amount), from.toUpperCase(), to.toUpperCase());
    const rate   = await svc.getRate(from.toUpperCase(), to.toUpperCase());
    res.json({ success: true, data: { from, to, amount: parseFloat(amount), converted: result, rate } });
  } catch (e) { next(e); }
});

module.exports = router;