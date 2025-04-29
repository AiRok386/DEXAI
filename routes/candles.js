const express = require('express');
const router = express.Router();
const Candle = require('../models/Candle');

// GET /api/candles/:symbol?interval=1m&limit=100
router.get('/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toLowerCase();
    const interval = req.query.interval || '1m';
    const limit = parseInt(req.query.limit) || 100;

    const candles = await Candle.find({ symbol, interval })
      .sort({ openTime: -1 })
      .limit(limit);

    res.json({ success: true, candles: candles.reverse() }); // Ascending
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

module.exports = router;
