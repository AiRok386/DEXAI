const express = require('express');
const router = express.Router();
const OrderBookSnapshot = require('../models/OrderBookSnapshot');

// GET /api/orderbook/:symbol
router.get('/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toLowerCase();

    const snapshot = await OrderBookSnapshot.findOne({ symbol })
      .sort({ createdAt: -1 }) // Get latest
      .limit(1);

    if (!snapshot) {
      return res.status(404).json({ success: false, message: 'Order book not found' });
    }

    res.json({ success: true, orderbook: snapshot });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

module.exports = router;
