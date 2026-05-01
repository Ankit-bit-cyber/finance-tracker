// currency.util.js
const currencyService = require('./currency.service');

const convertAmount = async (amount, from, to) => currencyService.convert(amount, from, to);

module.exports = { convertAmount };