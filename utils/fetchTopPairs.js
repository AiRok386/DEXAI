// utils/fetchTopPairs.js

const axios = require('axios');

/**
 * Fetches the top N trading pairs from Bitget based on 24h trading volume.
 * @param {number} limit - Number of top trading pairs to fetch.
 * @returns {Promise<string[]>} - Array of trading pair symbols.
 */
const fetchTopTradingPairs = async (limit = 15) => {
  try {
    const response = await axios.get('https://api.bitget.com/api/spot/v1/market/tickers');
    const tickers = response.data.data;

    if (!tickers || !Array.isArray(tickers)) {
      throw new Error('Invalid response format from Bitget API');
    }

    // Sort tickers by 24h trading volume in descending order
    const sortedTickers = tickers.sort((a, b) => parseFloat(b.baseVolume) - parseFloat(a.baseVolume));

    // Extract the top N trading pair symbols
    const topPairs = sortedTickers.slice(0, limit).map(ticker => ticker.symbol);

    return topPairs;
  } catch (error) {
    console.error('Error fetching top trading pairs:', error.message);
    return [];
  }
};

module.exports = fetchTopTradingPairs;
