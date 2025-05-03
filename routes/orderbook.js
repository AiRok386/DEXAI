const express = require('express');
const router = express.Router();
const axios = require('axios');
const OrderBook = require('../models/OrderBook');

// List of allowed trading pairs (Top 15)
const allowedSymbols = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
  'DOGEUSDT', 'PEPEUSDT', 'SUIUSDT', 'ADAUSDT', 'TRXUSDT',
  'TONUSDT', 'LTCUSDT', 'AVAXUSDT', 'SHIBUSDT', 'DOTUSDT'
];

router.get('/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();

  if (!allowedSymbols.includes(symbol)) {
    return res.status(400).json({ error: 'Symbol not allowed' });
  }

  try {
    // Fetch the order book data from Binance API
    const response = await axios.get(`https://api.binance.com/api/v3/depth`, {
      params: {
        symbol: symbol,
        limit: 20 // You can adjust to 5, 10, 50, etc.
      }
    });

    // Prepare the data to be saved into MongoDB
    const orderBookData = {
      symbol,
      bids: response.data.bids,
      asks: response.data.asks,
      lastUpdateId: response.data.lastUpdateId
    };

    // Save the data to MongoDB
    const newOrderBook = new OrderBook(orderBookData);
    await newOrderBook.save();

    // Respond with the order book data
    res.json({
      symbol,
      bids: response.data.bids,
      asks: response.data.asks,
      lastUpdateId: response.data.lastUpdateId
    });

  } catch (error) {
    console.error('❌ Orderbook fetch error:', error.message);
    res.status(500).json({ error: 'Failed to fetch order book' });
  }
});

module.exports = router;
