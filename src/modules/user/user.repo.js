const { query } = require('../../config/db');

const findById = async (id) => {
  const { rows } = await query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0] || null;
};

const findByEmail = async (email) => {
  const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] || null;
};

const findByGoogleId = async (googleId) => {
  const { rows } = await query('SELECT * FROM users WHERE google_id = $1', [googleId]);
  return rows[0] || null;
};

const create = async ({ id, name, email, password_hash, currency = 'USD', google_id = null, avatar_url = null }) => {
  const { rows } = await query(
    `INSERT INTO users (id, name, email, password_hash, currency, google_id, avatar_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [id, name, email, password_hash, currency, google_id, avatar_url]
  );
  return rows[0];
};

const update = async (id, fields) => {
  const allowed = ['name', 'currency', 'avatar_url', 'password_hash', 'is_active'];
  const updates = Object.entries(fields).filter(([k]) => allowed.includes(k));
  if (!updates.length) return findById(id);

  const setClauses = updates.map(([k], i) => `${k} = $${i + 2}`).join(', ');
  const values = updates.map(([, v]) => v);

  const { rows } = await query(
    `UPDATE users SET ${setClauses}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, ...values]
  );
  return rows[0] || null;
};

const updateGoogleId = async (id, googleId) => {
  const { rows } = await query(
    'UPDATE users SET google_id = $2, updated_at = NOW() WHERE id = $1 RETURNING *',
    [id, googleId]
  );
  return rows[0];
};

module.exports = { findById, findByEmail, findByGoogleId, create, update, updateGoogleId };
