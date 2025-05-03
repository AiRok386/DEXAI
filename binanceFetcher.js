const axios = require('axios');
const { updateMarketData } = require('./marketDataStore');
const MarketSnapshot = require('./models/MarketSnapshot');

const PAIRS = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
  'DOGEUSDT', 'PEPEUSDT', 'SUIUSDT', 'ADAUSDT', 'TRXUSDT',
  'TONUSDT', 'AVAXUSDT', 'SHIBUSDT', 'DOTUSDT', 'LINKUSDT'
];

async function fetchAndUpdateMarketData() {
  for (const symbol of PAIRS) {
    try {
      const res = await axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
      const data = res.data;

      const marketInfo = {
        symbol: symbol,
        price: parseFloat(data.lastPrice),
        volume: parseFloat(data.volume),
        priceChangePercent: parseFloat(data.priceChangePercent),
        highPrice: parseFloat(data.highPrice),
        lowPrice: parseFloat(data.lowPrice)
      };

      updateMarketData(symbol, marketInfo); // ✅ Store in memory
      await MarketSnapshot.create(marketInfo); // ✅ Store in MongoDB

      console.log(`✅ Updated ${symbol}`);
    } catch (err) {
      console.error(`❌ Error fetching ${symbol}:`, err.message);
    }
  }
}

setInterval(fetchAndUpdateMarketData, 5000); // Run every 5 seconds
