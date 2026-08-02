// currency.service.js
const axios = require('axios');
const env = require('../../config/env');
const logger = require('../../utils/logger');
const { SUPPORTED_CURRENCIES } = require('../../utils/constants');

// In-memory cache: { 'USD_INR': { rate, expiry } }
const rateCache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

const getRate = async (from, to) => {
  if (from === to) return 1;

  const key = `${from}_${to}`;
  const cached = rateCache.get(key);
  if (cached && cached.expiry > Date.now()) return cached.rate;

  try {
    const apiKey = env.currency.apiKey;
    if (!apiKey || apiKey === 'your_exchange_rate_api_key') {
      // Fallback mock rates for development
      return getMockRate(from, to);
    }

    const url = `${env.currency.baseUrl}/${apiKey}/pair/${from}/${to}`;
    const { data } = await axios.get(url, { timeout: 5000 });

    if (data.result !== 'success') throw new Error('API error');

    const rate = data.conversion_rate;
    rateCache.set(key, { rate, expiry: Date.now() + CACHE_TTL });
    return rate;
  } catch (err) {
    logger.warn(`Currency API failed for ${from}->${to}: ${err.message}. Using mock rate.`);
    return getMockRate(from, to);
  }
};

const convert = async (amount, from, to) => {
  const rate = await getRate(from, to);
  return parseFloat((amount * rate).toFixed(2));
};

const getSupportedCurrencies = () => SUPPORTED_CURRENCIES;

// Rough mock rates relative to USD (for dev/testing)
const MOCK_RATES_TO_USD = {
  USD: 1, EUR: 1.09, GBP: 1.27, INR: 0.012, JPY: 0.0067,
  CAD: 0.74, AUD: 0.65, CHF: 1.12, CNY: 0.14, SGD: 0.74,
};

const getMockRate = (from, to) => {
  const fromRate = MOCK_RATES_TO_USD[from] ?? 1;
  const toRate   = MOCK_RATES_TO_USD[to]   ?? 1;
  return parseFloat((fromRate / toRate).toFixed(6));
};

module.exports = { getRate, convert, getSupportedCurrencies };
