const TRANSACTION_TYPES = Object.freeze({ INCOME: 'income', EXPENSE: 'expense' });

const DEFAULT_CATEGORIES = [
  { name: 'Salary',       type: 'income',  icon: '💼' },
  { name: 'Freelance',    type: 'income',  icon: '💻' },
  { name: 'Investment',   type: 'income',  icon: '📈' },
  { name: 'Other Income', type: 'income',  icon: '💰' },
  { name: 'Food',         type: 'expense', icon: '🍔' },
  { name: 'Transport',    type: 'expense', icon: '🚗' },
  { name: 'Housing',      type: 'expense', icon: '🏠' },
  { name: 'Healthcare',   type: 'expense', icon: '🏥' },
  { name: 'Education',    type: 'expense', icon: '📚' },
  { name: 'Shopping',     type: 'expense', icon: '🛍️' },
  { name: 'Entertainment',type: 'expense', icon: '🎬' },
  { name: 'Utilities',    type: 'expense', icon: '💡' },
  { name: 'Other Expense',type: 'expense', icon: '📦' },
];

const SUPPORTED_CURRENCIES = ['USD','EUR','GBP','INR','JPY','CAD','AUD','CHF','CNY','SGD'];

const BUDGET_PERIODS = Object.freeze({ MONTHLY: 'monthly', WEEKLY: 'weekly', YEARLY: 'yearly' });

module.exports = { TRANSACTION_TYPES, DEFAULT_CATEGORIES, SUPPORTED_CURRENCIES, BUDGET_PERIODS };
