const Decimal = require('decimal.js');

// Unit test for decimal precision logic (no DB needed)
describe('Money arithmetic precision', () => {
  const fmt = (n) => new Decimal(n).toDecimalPlaces(2).toNumber();

  test('Addition is precise', () => {
    expect(fmt(0.1 + 0.2)).toBe(0.3);
    expect(new Decimal(0.1).plus(0.2).toDecimalPlaces(2).toNumber()).toBe(0.3);
  });

  test('Large multiplication stays precise', () => {
    const result = new Decimal(1234.56).times(83.21).toDecimalPlaces(2).toNumber();
    expect(result).toBe(102741.74);
  });

  test('Division does not create floating point errors', () => {
    const result = new Decimal(100).dividedBy(3).toDecimalPlaces(2).toNumber();
    expect(result).toBe(33.33);
  });

  test('Negative amounts (refunds) are handled', () => {
    const amount = -250.50;
    const abs = new Decimal(amount).abs().toNumber();
    expect(abs).toBe(250.50);
    expect(amount < 0).toBe(true); // is a refund
  });

  test('Zero amount is invalid', () => {
    const isZero = (n) => new Decimal(n).isZero();
    expect(isZero(0)).toBe(true);
    expect(isZero(0.01)).toBe(false);
  });

  test('Currency conversion preserves precision', () => {
    const amount = 1000;
    const rate   = 83.21;
    const result = new Decimal(amount).times(rate).toDecimalPlaces(2).toNumber();
    expect(result).toBe(83210.00);
  });
});