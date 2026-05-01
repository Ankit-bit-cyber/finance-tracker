const budgetRepo = require('./budget.repo');
const { ApiError } = require('../../middlewares/error.middleware');
const { currentMonthYear } = require('../../utils/helpers');
const Decimal = require('decimal.js');

const getAll = async (userId, filters) => {
  const rows = await budgetRepo.findAll(userId, filters);
  return rows.map(b => ({
    ...b,
    spent: parseFloat(b.spent) || 0,
    remaining: new Decimal(b.amount).minus(b.spent || 0).toNumber(),
    progress_pct: b.amount > 0
      ? Math.min(100, new Decimal(b.spent || 0).dividedBy(b.amount).times(100).toDecimalPlaces(1).toNumber())
      : 0,
    is_over_budget: parseFloat(b.spent) > parseFloat(b.amount),
  }));
};

const getOne = async (id, userId) => {
  const b = await budgetRepo.findById(id, userId);
  if (!b) throw new ApiError(404, 'Budget not found');
  return b;
};

const create = async (userId, data) => {
  const { month, year } = data.month
    ? { month: data.month, year: data.year }
    : currentMonthYear();
  return budgetRepo.create({ user_id: userId, ...data, month, year });
};

const update = async (id, userId, data) => {
  const b = await budgetRepo.findById(id, userId);
  if (!b) throw new ApiError(404, 'Budget not found');
  const updated = await budgetRepo.update(id, userId, data);
  return updated;
};

const remove = async (id, userId) => {
  const deleted = await budgetRepo.remove(id, userId);
  if (!deleted) throw new ApiError(404, 'Budget not found');
  return { message: 'Budget deleted' };
};

// Called after a transaction is added — check if budget threshold crossed
const checkAndAlert = async (userId, categoryId) => {
  const { month, year } = currentMonthYear();
  const budget = await budgetRepo.findForAlert(userId, categoryId, month, year);
  if (!budget || budget.alerted) return;

  const [budgets] = await getAll(userId, { month, year });
  // find this specific budget from enriched list
  const enriched = (await getAll(userId, { month, year }))
    .find(b => b.id === budget.id);
  if (!enriched) return;

  if (enriched.progress_pct >= budget.alert_at_pct) {
    await budgetRepo.update(budget.id, userId, { alerted: true });

    const notificationService = require('../notification/notification.service');
    await notificationService.sendBudgetAlert(userId, enriched);
  }
};

module.exports = { getAll, getOne, create, update, remove, checkAndAlert };