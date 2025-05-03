// utils/fetchBinanceMarkets.js
const axios = require('axios');

async function fetchBinanceMarkets() {
  try {
    const response = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching Binance data:', error.message);
    return [];
  }
}

module.exports = fetchBinanceMarkets;
