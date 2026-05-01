// dashboard.service.js
const txRepo = require('../transaction/transaction.repo');
const budgetService = require('../budget/budget.service');
const { currentMonthYear } = require('../../utils/helpers');
const Decimal = require('decimal.js');

const getSummary = async (userId) => {
  const { month, year } = currentMonthYear();

  const [monthRows, trendRows, expenseBreakdown, incomeBreakdown, budgets] = await Promise.all([
    txRepo.sumByTypeAndMonth(userId, year, month),
    txRepo.monthlySummary(userId, 6),
    txRepo.categoryBreakdown(userId, 'expense', year, month),
    txRepo.categoryBreakdown(userId, 'income',  year, month),
    budgetService.getAll(userId, { month, year }),
  ]);

  const income  = parseFloat(monthRows.find(r => r.type === 'income')?.total  || 0);
  const expense = parseFloat(monthRows.find(r => r.type === 'expense')?.total || 0);
  const savings = new Decimal(income).minus(expense).toNumber();
  const savingsRate = income > 0
    ? new Decimal(savings).dividedBy(income).times(100).toDecimalPlaces(1).toNumber()
    : 0;

  // Format trend data for chart
  const trendMap = {};
  for (const row of trendRows) {
    if (!trendMap[row.month]) trendMap[row.month] = { month: row.month, income: 0, expense: 0 };
    trendMap[row.month][row.type] = parseFloat(row.total);
  }
  const trend = Object.values(trendMap).sort((a, b) => a.month.localeCompare(b.month));

  return {
    current_month: { month, year, income, expense, savings, savings_rate: savingsRate },
    trend,
    expense_breakdown: expenseBreakdown.map(r => ({ ...r, total: parseFloat(r.total) })),
    income_breakdown: incomeBreakdown.map(r => ({ ...r, total: parseFloat(r.total) })),
    budgets: budgets.slice(0, 5), // top 5 budgets
  };
};

module.exports = { getSummary };