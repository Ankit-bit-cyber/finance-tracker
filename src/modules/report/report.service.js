// report.service.js
const { query } = require('../../config/db');
const Decimal = require('decimal.js');

const monthly = async (userId, year, month) => {
  // Monthly income vs expense with category breakdown
  const [summary, expenses, incomes, daily] = await Promise.all([
    query(
      `SELECT type, SUM(amount_in_base) AS total, COUNT(*) AS count
       FROM transactions
       WHERE user_id=$1 AND EXTRACT(YEAR FROM date)=$2 AND EXTRACT(MONTH FROM date)=$3
       GROUP BY type`,
      [userId, year, month]
    ),
    query(
      `SELECT c.name AS category, c.icon, SUM(t.amount_in_base) AS total, COUNT(*) AS count
       FROM transactions t LEFT JOIN categories c ON c.id = t.category_id
       WHERE t.user_id=$1 AND t.type='expense'
         AND EXTRACT(YEAR FROM t.date)=$2 AND EXTRACT(MONTH FROM t.date)=$3
       GROUP BY c.name, c.icon ORDER BY total DESC`,
      [userId, year, month]
    ),
    query(
      `SELECT c.name AS category, c.icon, SUM(t.amount_in_base) AS total, COUNT(*) AS count
       FROM transactions t LEFT JOIN categories c ON c.id = t.category_id
       WHERE t.user_id=$1 AND t.type='income'
         AND EXTRACT(YEAR FROM t.date)=$2 AND EXTRACT(MONTH FROM t.date)=$3
       GROUP BY c.name, c.icon ORDER BY total DESC`,
      [userId, year, month]
    ),
    query(
      `SELECT date, type, SUM(amount_in_base) AS total
       FROM transactions
       WHERE user_id=$1 AND EXTRACT(YEAR FROM date)=$2 AND EXTRACT(MONTH FROM date)=$3
       GROUP BY date, type ORDER BY date`,
      [userId, year, month]
    ),
  ]);

  const income  = parseFloat(summary.rows.find(r => r.type === 'income')?.total  || 0);
  const expense = parseFloat(summary.rows.find(r => r.type === 'expense')?.total || 0);

  return {
    period: { month, year },
    income,
    expense,
    savings: new Decimal(income).minus(expense).toNumber(),
    savings_rate: income > 0
      ? new Decimal(income - expense).dividedBy(income).times(100).toDecimalPlaces(1).toNumber()
      : 0,
    income_tx_count: parseInt(summary.rows.find(r => r.type === 'income')?.count || 0),
    expense_tx_count: parseInt(summary.rows.find(r => r.type === 'expense')?.count || 0),
    expense_categories: expenses.rows.map(r => ({ ...r, total: parseFloat(r.total) })),
    income_categories: incomes.rows.map(r => ({ ...r, total: parseFloat(r.total) })),
    daily_breakdown: daily.rows,
  };
};

const yearly = async (userId, year) => {
  const { rows } = await query(
    `SELECT
       EXTRACT(MONTH FROM date) AS month,
       type,
       SUM(amount_in_base) AS total
     FROM transactions
     WHERE user_id=$1 AND EXTRACT(YEAR FROM date)=$2
     GROUP BY EXTRACT(MONTH FROM date), type
     ORDER BY month`,
    [userId, year]
  );

  const months = {};
  for (const row of rows) {
    const m = parseInt(row.month);
    if (!months[m]) months[m] = { month: m, income: 0, expense: 0 };
    months[m][row.type] = parseFloat(row.total);
  }

  const monthsArr = Object.values(months).map(m => ({
    ...m,
    savings: new Decimal(m.income).minus(m.expense).toNumber(),
  }));

  const totals = monthsArr.reduce(
    (acc, m) => ({ income: acc.income + m.income, expense: acc.expense + m.expense }),
    { income: 0, expense: 0 }
  );

  return { year, months: monthsArr, totals: { ...totals, savings: totals.income - totals.expense } };
};

module.exports = { monthly, yearly };
