// services/coinCapService.js

const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'https://api.coincap.io/v2';
const API_KEY = process.env.COINCAP_API_KEY;

const api = axios.create({
  baseURL: BASE_URL,
  headers: API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}
});

/**
 * Retry the request with exponential backoff if rate limited (429).
 * @param {Function} func - The function to retry.
 * @param {number} retries - How many retries before failing.
 * @returns {Promise<any>} - The response data.
 */
async function retryRequest(func, retries = 3) {
  let attempts = 0;
  while (attempts < retries) {
    try {
      return await func();
    } catch (err) {
      if (err.response?.status === 429) {
        console.log(`[Retry] Rate limit hit, retrying...`);
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000)); // Exponential backoff
        attempts++;
      } else {
        throw err;
      }
    }
  }
  throw new Error('Max retries reached');
}

/**
 * Fetch market data for top assets (default: top 10).
 * @param {number} limit - Number of assets to fetch.
 * @returns {Array} - List of asset objects.
 */
async function fetchMarketData(limit = 10) {
  try {
    const response = await retryRequest(() => api.get(`/assets?limit=${limit}`));
    return response.data.data || [];
  } catch (err) {
    console.error('❌ Error fetching market data:', err.response?.status, err.response?.data || err.message);
    return [];
  }
}

/**
 * Fetch data for a single asset (e.g., 'bitcoin').
 * @param {string} symbol - Asset ID from CoinCap (lowercase).
 * @returns {Object|null} - Asset data or null on error.
 */
async function fetchSingleAsset(symbol = 'bitcoin') {
  try {
    const response = await retryRequest(() => api.get(`/assets/${symbol.toLowerCase()}`));
    return response.data.data || null;
  } catch (err) {
    console.error(`❌ Error fetching ${symbol}:`, err.response?.status, err.response?.data || err.message);
    return null;
  }
}

/**
 * Simulate a simple order book based on a mid-price.
 * @param {number} price - Current price to simulate around.
 * @returns {Object} - { bids, asks } arrays.
 */
function simulateOrderBook(price) {
  const bids = Array.from({ length: 5 }, (_, i) => [
    (price - i * 10).toFixed(2),
    (Math.random() * 5).toFixed(4)
  ]);
  const asks = Array.from({ length: 5 }, (_, i) => [
    (price + i * 10).toFixed(2),
    (Math.random() * 5).toFixed(4)
  ]);
  return { bids, asks };
}

module.exports = {
  fetchMarketData,
  fetchSingleAsset,
  simulateOrderBook
};
