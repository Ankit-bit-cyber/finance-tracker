// category.repo.js
const { query, getClient } = require('../../config/db');

const findAllForUser = async (userId) => {
  const { rows } = await query(
    `SELECT * FROM categories
     WHERE user_id = $1 OR user_id IS NULL
     ORDER BY is_default DESC, type, name`,
    [userId]
  );
  return rows;
};

const findById = async (id, userId) => {
  const { rows } = await query(
    'SELECT * FROM categories WHERE id = $1 AND (user_id = $2 OR user_id IS NULL)',
    [id, userId]
  );
  return rows[0] || null;
};

const create = async ({ user_id, name, type, icon = '📦' }) => {
  const { rows } = await query(
    'INSERT INTO categories (user_id, name, type, icon) VALUES ($1, $2, $3, $4) RETURNING *',
    [user_id, name, type, icon]
  );
  return rows[0];
};

const update = async (id, userId, { name, icon }) => {
  const { rows } = await query(
    `UPDATE categories SET
       name = COALESCE($3, name),
       icon = COALESCE($4, icon)
     WHERE id = $1 AND user_id = $2 RETURNING *`,
    [id, userId, name, icon]
  );
  return rows[0] || null;
};

// Soft-delete: reassign transactions to null category, then delete
const remove = async (id, userId) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    await client.query(
      'UPDATE transactions SET category_id = NULL WHERE category_id = $1 AND user_id = $2',
      [id, userId]
    );
    await client.query(
      'DELETE FROM categories WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    await client.query('COMMIT');
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { findAllForUser, findById, create, update, remove };
