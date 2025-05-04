// utils/fetchTopPairs.js

const axios = require('axios');

/**
 * Fetches the top N trading pairs from Bitget based on 24h USDT volume.
 * Compatible with Bitget WebSocket API format.
 *
 * @param {number} limit - Number of top trading pairs to fetch.
 * @returns {Promise<string[]>} - Array of trading pair symbols (e.g., ['BTCUSDT', 'ETHUSDT'])
 */
const fetchTopTradingPairs = async (limit = 15) => {
  try {
    const response = await axios.get('https://api.bitget.com/api/spot/v1/market/tickers');
    const tickers = response.data?.data;

    if (!Array.isArray(tickers)) {
      throw new Error('Invalid response format from Bitget API');
    }

    // Sort by 24h USDT volume in descending order
    const sorted = tickers.sort((a, b) => parseFloat(b.usdtVol) - parseFloat(a.usdtVol));

    // Return top N pair symbols in format required by WebSocket: "BTCUSDT"
    return sorted.slice(0, limit).map(ticker => ticker.symbol);
  } catch (error) {
    console.error('❌ Failed to fetch top trading pairs:', error.message);
    return [];
  }
};

module.exports = fetchTopTradingPairs;
