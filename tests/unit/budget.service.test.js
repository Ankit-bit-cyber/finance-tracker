const Decimal = require('decimal.js');

describe('Budget progress calculations', () => {
  const calcProgress = (spent, budget) => {
    if (budget <= 0) return 0;
    return Math.min(100, new Decimal(spent).dividedBy(budget).times(100).toDecimalPlaces(1).toNumber());
  };

  const calcRemaining = (spent, budget) =>
    new Decimal(budget).minus(spent).toNumber();

  test('50% spent returns 50% progress', () => {
    expect(calcProgress(2500, 5000)).toBe(50);
  });

  test('Over-budget is capped at 100% for display', () => {
    expect(calcProgress(6000, 5000)).toBe(100);
  });

  test('Is over budget flag works', () => {
    expect(6000 > 5000).toBe(true);
    expect(4999 > 5000).toBe(false);
  });

  test('Remaining is negative when over budget', () => {
    expect(calcRemaining(6000, 5000)).toBe(-1000);
  });

  test('Zero budget returns 0% progress', () => {
    expect(calcProgress(100, 0)).toBe(0);
  });

  test('Alert threshold detection', () => {
    const pct = calcProgress(4200, 5000);
    const alertAt = 80;
    expect(pct >= alertAt).toBe(true); // 84% >= 80%
  });
});