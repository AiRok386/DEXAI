const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'https://api.coincap.io/v2';
const API_KEY = process.env.COINCAP_API_KEY; // optional

// Axios instance with optional header for API key
const api = axios.create({
  baseURL: BASE_URL,
  headers: API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}
});

// Fetch market data for all assets (e.g. BTC, ETH, SOL)
async function fetchMarketData(limit = 10) {
  try {
    const response = await api.get(`/assets?limit=${limit}`);
    return response.data.data;
  } catch (err) {
    console.error('❌ Error fetching market data:', err.message);
    return [];
  }
}

// Fetch data for a specific asset (e.g. btc, eth)
async function fetchSingleAsset(symbol = 'bitcoin') {
  try {
    const response = await api.get(`/assets/${symbol.toLowerCase()}`);
    return response.data.data;
  } catch (err) {
    console.error(`❌ Error fetching ${symbol}:`, err.message);
    return null;
  }
}

// CoinCap doesn't support order books, so we simulate it
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
