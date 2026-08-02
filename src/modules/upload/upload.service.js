// upload.service.js
const { query } = require('../../config/db');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const env = require('../../config/env');
const { ApiError } = require('../../middlewares/error.middleware');

const saveReceipt = async (userId, file, transactionId = null) => {
  const url = `/uploads/${file.filename}`;
  const { rows } = await query(
    `INSERT INTO receipts (id, user_id, transaction_id, filename, original_name, mime_type, size_bytes, url)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [uuidv4(), userId, transactionId, file.filename, file.originalname, file.mimetype, file.size, url]
  );

  // If linked to transaction, update receipt_url
  if (transactionId) {
    await query(
      'UPDATE transactions SET receipt_url=$1 WHERE id=$2 AND user_id=$3',
      [url, transactionId, userId]
    );
  }

  return rows[0];
};

const getReceipts = async (userId) => {
  const { rows } = await query(
    `SELECT r.*, t.description AS transaction_desc
     FROM receipts r
     LEFT JOIN transactions t ON t.id = r.transaction_id
     WHERE r.user_id = $1
     ORDER BY r.created_at DESC`,
    [userId]
  );
  return rows;
};

const deleteReceipt = async (userId, id) => {
  const { rows } = await query(
    'SELECT * FROM receipts WHERE id=$1 AND user_id=$2', [id, userId]
  );
  if (!rows[0]) throw new ApiError(404, 'Receipt not found');

  const filePath = path.join(process.cwd(), env.upload.dir, rows[0].filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  await query('DELETE FROM receipts WHERE id=$1', [id]);
  return { message: 'Receipt deleted' };
};

module.exports = { saveReceipt, getReceipts, deleteReceipt };
