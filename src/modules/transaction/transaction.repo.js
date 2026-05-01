const { query, getClient } = require('../../config/db');
const { paginate } = require('../../utils/helpers');

const findAll = async (userId, filters = {}) => {
  const {
    type, category_id, start_date, end_date,
    page = 1, limit = 20, sort = 'date', order = 'desc'
  } = filters;

  const { limit: lim, offset } = paginate(page, limit);
  const conditions = ['t.user_id = $1'];
  const params = [userId];
  let pi = 2;

  if (type)        { conditions.push(`t.type = $${pi++}`);        params.push(type); }
  if (category_id) { conditions.push(`t.category_id = $${pi++}`); params.push(category_id); }
  if (start_date)  { conditions.push(`t.date >= $${pi++}`);        params.push(start_date); }
  if (end_date)    { conditions.push(`t.date <= $${pi++}`);        params.push(end_date); }

  const where = conditions.join(' AND ');
  const sortCol = ['date','amount','created_at'].includes(sort) ? sort : 'date';
  const sortDir = order === 'asc' ? 'ASC' : 'DESC';

  const dataQuery = `
    SELECT t.*, c.name AS category_name, c.icon AS category_icon
    FROM transactions t
    LEFT JOIN categories c ON c.id = t.category_id
    WHERE ${where}
    ORDER BY t.${sortCol} ${sortDir}
    LIMIT $${pi++} OFFSET $${pi++}
  `;
  const countQuery = `SELECT COUNT(*) FROM transactions t WHERE ${where}`;

  const [data, count] = await Promise.all([
    query(dataQuery, [...params, lim, offset]),
    query(countQuery, params),
  ]);

  return {
    transactions: data.rows,
    total: parseInt(count.rows[0].count),
    page: parseInt(page),
    limit: lim,
    totalPages: Math.ceil(parseInt(count.rows[0].count) / lim),
  };
};

const findById = async (id, userId) => {
  const { rows } = await query(
    `SELECT t.*, c.name AS category_name, c.icon AS category_icon
     FROM transactions t
     LEFT JOIN categories c ON c.id = t.category_id
     WHERE t.id = $1 AND t.user_id = $2`,
    [id, userId]
  );
  return rows[0] || null;
};

const create = async (data) => {
  const {
    user_id, category_id, type, amount, currency,
    amount_in_base, exchange_rate, description, date, is_refund
  } = data;
  const { rows } = await query(
    `INSERT INTO transactions
       (user_id, category_id, type, amount, currency, amount_in_base, exchange_rate, description, date, is_refund)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [user_id, category_id, type, amount, currency, amount_in_base, exchange_rate, description, date, is_refund]
  );
  return rows[0];
};

const update = async (id, userId, fields) => {
  const allowed = ['category_id','amount','currency','amount_in_base','exchange_rate','description','date','is_refund','receipt_url'];
  const updates = Object.entries(fields).filter(([k]) => allowed.includes(k) && fields[k] !== undefined);
  if (!updates.length) return findById(id, userId);

  const setClauses = updates.map(([k], i) => `${k} = $${i + 3}`).join(', ');
  const values = updates.map(([, v]) => v);
  const { rows } = await query(
    `UPDATE transactions SET ${setClauses}, updated_at = NOW()
     WHERE id = $1 AND user_id = $2 RETURNING *`,
    [id, userId, ...values]
  );
  return rows[0] || null;
};

const remove = async (id, userId) => {
  const { rowCount } = await query(
    'DELETE FROM transactions WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return rowCount > 0;
};

// Aggregates for reports / dashboard
const sumByTypeAndMonth = async (userId, year, month) => {
  const { rows } = await query(
    `SELECT type, SUM(amount_in_base) AS total
     FROM transactions
     WHERE user_id = $1
       AND EXTRACT(YEAR  FROM date) = $2
       AND EXTRACT(MONTH FROM date) = $3
     GROUP BY type`,
    [userId, year, month]
  );
  return rows;
};

const monthlySummary = async (userId, months = 6) => {
  const { rows } = await query(
    `SELECT
       TO_CHAR(date, 'YYYY-MM') AS month,
       type,
       SUM(amount_in_base) AS total
     FROM transactions
     WHERE user_id = $1
       AND date >= NOW() - INTERVAL '${months} months'
     GROUP BY TO_CHAR(date, 'YYYY-MM'), type
     ORDER BY month`,
    [userId]
  );
  return rows;
};

const categoryBreakdown = async (userId, type, year, month) => {
  const { rows } = await query(
    `SELECT
       c.name AS category, c.icon,
       SUM(t.amount_in_base) AS total,
       COUNT(*) AS count
     FROM transactions t
     LEFT JOIN categories c ON c.id = t.category_id
     WHERE t.user_id = $1 AND t.type = $2
       AND EXTRACT(YEAR  FROM t.date) = $3
       AND EXTRACT(MONTH FROM t.date) = $4
     GROUP BY c.name, c.icon
     ORDER BY total DESC`,
    [userId, type, year, month]
  );
  return rows;
};

module.exports = {
  findAll, findById, create, update, remove,
  sumByTypeAndMonth, monthlySummary, categoryBreakdown
};