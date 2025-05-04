const express = require('express');
const router = express.Router();
const OrderBook = require('../models/OrderBook');  // Import the OrderBook model

// Route to get all order books for all symbols
router.get('/', async (req, res) => {
  try {
    // Fetch all order book entries from the database
    const orderBooks = await OrderBook.find({});
    res.json(orderBooks);  // Return the order books as a JSON response
  } catch (error) {
    console.error('❌ Error fetching order books:', error);
    res.status(500).json({ error: '❌ Failed to fetch order books' });
  }
});

// Route to get order book data for a specific symbol (e.g., BTC-USDT)
router.get('/:symbol', async (req, res) => {
  const { symbol } = req.params;  // Get the symbol from the URL params
  try {
    // Fetch the order book for the specific symbol
    const orderBook = await OrderBook.findOne({ symbol });
    if (!orderBook) {
      return res.status(404).json({ error: '❌ Order book not found for symbol' });
    }
    res.json(orderBook);  // Return the order book for the symbol
  } catch (error) {
    console.error('❌ Error fetching order book:', error);
    res.status(500).json({ error: '❌ Failed to fetch order book for symbol' });
  }
});

module.exports = router;
