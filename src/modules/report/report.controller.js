// report.controller.js
const svc = require('./report.service');

const monthly = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const m = parseInt(month) || now.getMonth() + 1;
    const y = parseInt(year)  || now.getFullYear();
    res.json({ success: true, data: await svc.monthly(req.user.id, y, m) });
  } catch (e) { next(e); }
};

const yearly = async (req, res, next) => {
  try {
    const y = parseInt(req.query.year) || new Date().getFullYear();
    res.json({ success: true, data: await svc.yearly(req.user.id, y) });
  } catch (e) { next(e); }
};

module.exports = { monthly, yearly };