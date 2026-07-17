const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  database: process.env.DB_NAME + '_test',
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const query = (text, params) => pool.query(text, params);

const clean = async () => {
  await query('DELETE FROM notifications');
  await query('DELETE FROM receipts');
  await query('DELETE FROM budgets');
  await query('DELETE FROM transactions');
  await query('DELETE FROM categories WHERE user_id IS NOT NULL');
  await query('DELETE FROM users');
};

const close = () => pool.end();

module.exports = { query, clean, close };