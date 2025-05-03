const axios = require('axios');

async function fetchBinanceData(symbol = 'BTCUSDT') {
  try {
    const response = await axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);

    return {
      symbol,
      price: parseFloat(response.data.lastPrice),
      volume: parseFloat(response.data.volume),
      priceChangePercent: parseFloat(response.data.priceChangePercent),
      highPrice: parseFloat(response.data.highPrice),
      lowPrice: parseFloat(response.data.lowPrice),
    };
  } catch (error) {
    console.error(`❌ Error fetching data from Binance for ${symbol}:`, error.message);
    return null;
  }
}

module.exports = fetchBinanceData;
