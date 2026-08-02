// dashboard.controller.js
const svc = require('./dashboard.service');

const getSummary = async (req, res, next) => {
  try { res.json({ success: true, data: await svc.getSummary(req.user.id) }); }
  catch (e) { next(e); }
};

module.exports = { getSummary };

// dashboard.routes.js — appended below as separate export
