// notification.controller.js
const svc = require('./notification.service');

const getAll = async (req, res, next) => {
  try { res.json({ success: true, data: await svc.getAll(req.user.id) }); }
  catch (e) { next(e); }
};

const markRead = async (req, res, next) => {
  try {
    await svc.markRead(req.user.id, req.params.id);
    res.json({ success: true, message: 'Marked as read' });
  } catch (e) { next(e); }
};

module.exports = { getAll, markRead };
