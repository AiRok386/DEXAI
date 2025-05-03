// controllers/marketController.js
const Market = require('../models/market.model');
const fetchBinanceMarkets = require('../utils/fetchBinanceMarkets');

async function updateAllMarkets(req, res) {
  try {
    const data = await fetchBinanceMarkets();
    const updates = data.map(async (item) => {
      const symbolParts = item.symbol.match(/^([A-Z]+)(USDT|BTC|ETH|BUSD|BNB)$/); // basic matching
      if (!symbolParts) return;

      const base = symbolParts[1];
      const quote = symbolParts[2];

      await Market.findOneAndUpdate(
        { symbol: item.symbol },
        {
          symbol: item.symbol,
          baseAsset: base,
          quoteAsset: quote,
          price: item.lastPrice,
          volume: item.volume,
        },
        { upsert: true, new: true }
      );
    });

    await Promise.all(updates);
    res.json({ message: '✅ Market data updated from Binance.' });
  } catch (error) {
    res.status(500).json({ error: '❌ Failed to update market data' });
  }
}

async function getAllMarkets(req, res) {
  try {
    const markets = await Market.find({});
    res.json(markets);
  } catch (error) {
    res.status(500).json({ error: '❌ Could not fetch markets' });
  }
}

module.exports = { updateAllMarkets, getAllMarkets };
