const Decimal = require('decimal.js');

// Safe money arithmetic using decimal.js
const money = {
  add: (a, b) => new Decimal(a).plus(b).toDecimalPlaces(2).toNumber(),
  sub: (a, b) => new Decimal(a).minus(b).toDecimalPlaces(2).toNumber(),
  mul: (a, b) => new Decimal(a).times(b).toDecimalPlaces(2).toNumber(),
  div: (a, b) => new Decimal(a).dividedBy(b).toDecimalPlaces(2).toNumber(),
  fmt: (n) => new Decimal(n).toDecimalPlaces(2).toNumber(),
};

// Get start and end of a month
const getMonthRange = (year, month) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
};

// Get current month/year
const currentMonthYear = () => {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
};

// Paginate helper
const paginate = (page = 1, limit = 20) => {
  const p = Math.max(1, parseInt(page));
  const l = Math.min(100, Math.max(1, parseInt(limit)));
  return { limit: l, offset: (p - 1) * l, page: p };
};

module.exports = { money, getMonthRange, currentMonthYear, paginate };
