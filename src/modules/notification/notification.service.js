// notification.service.js
const { query } = require('../../config/db');
const { v4: uuidv4 } = require('uuid');
const emailProvider = require('./email.provider');
const userRepo = require('../user/user.repo');
const logger = require('../../utils/logger');

const create = async (userId, { type, title, message, meta = {} }) => {
  const { rows } = await query(
    `INSERT INTO notifications (id, user_id, type, title, message, meta)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [uuidv4(), userId, type, title, message, JSON.stringify(meta)]
  );
  return rows[0];
};

const getAll = async (userId) => {
  const { rows } = await query(
    'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
    [userId]
  );
  return rows;
};

const markRead = async (userId, id) => {
  await query(
    'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
};

const sendBudgetAlert = async (userId, budget) => {
  const user = await userRepo.findById(userId);
  if (!user) return;

  const isOver = budget.is_over_budget;
  const title  = isOver
    ? `Budget exceeded: ${budget.category_name}`
    : `Budget alert: ${budget.category_name} at ${budget.progress_pct}%`;
  const message = isOver
    ? `You have exceeded your ${budget.currency} ${budget.amount} budget for ${budget.category_name}.`
    : `You've used ${budget.progress_pct}% of your budget for ${budget.category_name}.`;

  await create(userId, {
    type: isOver ? 'budget_overrun' : 'budget_alert',
    title,
    message,
    meta: { category_id: budget.category_id, budget_id: budget.id },
  });

  try {
    await emailProvider.send({
      to: user.email,
      subject: title,
      html: `
        <h2>${title}</h2>
        <p>Hi ${user.name},</p>
        <p>${message}</p>
        <p>Spent: <strong>${budget.currency} ${budget.spent}</strong> / Budget: <strong>${budget.currency} ${budget.amount}</strong></p>
        <a href="${process.env.APP_URL}/dashboard.html">View Dashboard</a>
      `,
    });
    await query('UPDATE notifications SET sent_email=TRUE WHERE user_id=$1 AND type=$2 ORDER BY created_at DESC LIMIT 1',
      [userId, isOver ? 'budget_overrun' : 'budget_alert']);
  } catch (err) {
    logger.warn('Failed to send budget email:', err.message);
  }
};

module.exports = { create, getAll, markRead, sendBudgetAlert };