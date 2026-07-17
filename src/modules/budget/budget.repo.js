// budget.repo.js
const { query } = require('../../config/db');

const findAll = async (userId, filters = {}) => {
  const { month, year, period } = filters;
  const conditions = ['b.user_id = $1'];
  const params = [userId];
  let pi = 2;

  if (month)  { conditions.push(`b.month = $${pi++}`);  params.push(month); }
  if (year)   { conditions.push(`b.year = $${pi++}`);   params.push(year); }
  if (period) { conditions.push(`b.period = $${pi++}`); params.push(period); }

  const { rows } = await query(
    `SELECT b.*, c.name AS category_name, c.icon AS category_icon,
       COALESCE(
         (SELECT SUM(t.amount_in_base)
          FROM transactions t
          WHERE t.user_id = b.user_id
            AND t.category_id = b.category_id
            AND t.type = 'expense'
            AND EXTRACT(YEAR  FROM t.date) = b.year
            AND EXTRACT(MONTH FROM t.date) = b.month
         ), 0
       ) AS spent
     FROM budgets b
     LEFT JOIN categories c ON c.id = b.category_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY b.created_at DESC`,
    params
  );
  return rows;
};

const findById = async (id, userId) => {
  const { rows } = await query('SELECT * FROM budgets WHERE id = $1 AND user_id = $2', [id, userId]);
  return rows[0] || null;
};

const findForAlert = async (userId, categoryId, month, year) => {
  const { rows } = await query(
    `SELECT * FROM budgets WHERE user_id=$1 AND category_id=$2 AND month=$3 AND year=$4`,
    [userId, categoryId, month, year]
  );
  return rows[0] || null;
};

const create = async (data) => {
  const { user_id, category_id, amount, currency, period, month, year, alert_at_pct } = data;
  const { rows } = await query(
    `INSERT INTO budgets (user_id,category_id,amount,currency,period,month,year,alert_at_pct)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [user_id, category_id, amount, currency, period, month, year, alert_at_pct || 80]
  );
  return rows[0];
};

const update = async (id, userId, fields) => {
  const allowed = ['amount','currency','period','month','year','alert_at_pct','alerted'];
  const updates = Object.entries(fields).filter(([k]) => allowed.includes(k));
  if (!updates.length) return findById(id, userId);
  const setClauses = updates.map(([k], i) => `${k} = $${i + 3}`).join(', ');
  const { rows } = await query(
    `UPDATE budgets SET ${setClauses}, updated_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING *`,
    [id, userId, ...updates.map(([, v]) => v)]
  );
  return rows[0] || null;
};

const remove = async (id, userId) => {
  const { rowCount } = await query('DELETE FROM budgets WHERE id=$1 AND user_id=$2', [id, userId]);
  return rowCount > 0;
};

module.exports = { findAll, findById, findForAlert, create, update, remove };