const Decimal = require('decimal.js');
const { v4: uuidv4 } = require('uuid');
const txRepo = require('./transaction.repo');
const userRepo = require('../user/user.repo');
const currencyService = require('../currency/currency.service');
const budgetService = require('../budget/budget.service');
const { ApiError } = require('../../middlewares/error.middleware');

const getAll = async (userId, filters) => txRepo.findAll(userId, filters);

const getOne = async (id, userId) => {
  const tx = await txRepo.findById(id, userId);
  if (!tx) throw new ApiError(404, 'Transaction not found');
  return tx;
};

const create = async (userId, data) => {
  const user = await userRepo.findById(userId);
  const userCurrency = user?.currency || 'USD';

  // Handle currency conversion
  let exchangeRate = 1;
  let amountInBase = new Decimal(data.amount).abs().toDecimalPlaces(2).toNumber();

  if (data.currency && data.currency !== userCurrency) {
    exchangeRate = await currencyService.getRate(data.currency, userCurrency);
    amountInBase = new Decimal(amountInBase).times(exchangeRate).toDecimalPlaces(2).toNumber();
  }

  // Refunds: negative amounts are allowed for expenses (represent money back)
  const finalAmount = new Decimal(data.amount).toDecimalPlaces(2).toNumber();

  const tx = await txRepo.create({
    user_id: userId,
    category_id: data.category_id || null,
    type: data.type,
    amount: finalAmount,
    currency: data.currency || userCurrency,
    amount_in_base: amountInBase,
    exchange_rate: exchangeRate,
    description: data.description || null,
    date: data.date || new Date(),
    is_refund: data.is_refund || (data.amount < 0),
  });

  // Check budget after adding expense
  if (tx.type === 'expense' && tx.category_id) {
    await budgetService.checkAndAlert(userId, tx.category_id).catch(() => {});
  }

  return tx;
};

const update = async (id, userId, data) => {
  const tx = await txRepo.findById(id, userId);
  if (!tx) throw new ApiError(404, 'Transaction not found');

  const updateData = { ...data };

  // Recalculate base amount if currency or amount changed
  if (data.amount !== undefined || data.currency !== undefined) {
    const user = await userRepo.findById(userId);
    const userCurrency = user?.currency || 'USD';
    const newAmount = new Decimal(data.amount ?? tx.amount).abs().toDecimalPlaces(2).toNumber();
    const newCurrency = data.currency ?? tx.currency;

    let exchangeRate = 1;
    if (newCurrency !== userCurrency) {
      exchangeRate = await currencyService.getRate(newCurrency, userCurrency);
    }
    updateData.amount_in_base = new Decimal(newAmount).times(exchangeRate).toDecimalPlaces(2).toNumber();
    updateData.exchange_rate = exchangeRate;
    updateData.amount = new Decimal(data.amount ?? tx.amount).toDecimalPlaces(2).toNumber();
  }

  const updated = await txRepo.update(id, userId, updateData);
  if (!updated) throw new ApiError(404, 'Transaction not found');
  return updated;
};

const remove = async (id, userId) => {
  const deleted = await txRepo.remove(id, userId);
  if (!deleted) throw new ApiError(404, 'Transaction not found');
  return { message: 'Transaction deleted' };
};

module.exports = { getAll, getOne, create, update, remove };