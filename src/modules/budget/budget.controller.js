// budget.controller.js
const svc = require('./budget.service');

const getAll = async (req, res, next) => {
  try { res.json({ success: true, data: await svc.getAll(req.user.id, req.query) }); }
  catch (e) { next(e); }
};
const getOne = async (req, res, next) => {
  try { res.json({ success: true, data: await svc.getOne(req.params.id, req.user.id) }); }
  catch (e) { next(e); }
};
const create = async (req, res, next) => {
  try { res.status(201).json({ success: true, data: await svc.create(req.user.id, req.body) }); }
  catch (e) { next(e); }
};
const update = async (req, res, next) => {
  try { res.json({ success: true, data: await svc.update(req.params.id, req.user.id, req.body) }); }
  catch (e) { next(e); }
};
const remove = async (req, res, next) => {
  try { res.json({ success: true, data: await svc.remove(req.params.id, req.user.id) }); }
  catch (e) { next(e); }
};

module.exports = { getAll, getOne, create, update, remove };
