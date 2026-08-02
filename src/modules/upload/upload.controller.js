// upload.controller.js
const svc = require('./upload.service');

const uploadReceipt = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const transactionId = req.body.transaction_id || null;
    const receipt = await svc.saveReceipt(req.user.id, req.file, transactionId);
    res.status(201).json({ success: true, data: receipt });
  } catch (e) { next(e); }
};

const getReceipts = async (req, res, next) => {
  try { res.json({ success: true, data: await svc.getReceipts(req.user.id) }); }
  catch (e) { next(e); }
};

const deleteReceipt = async (req, res, next) => {
  try { res.json({ success: true, data: await svc.deleteReceipt(req.user.id, req.params.id) }); }
  catch (e) { next(e); }
};

module.exports = { uploadReceipt, getReceipts, deleteReceipt };
