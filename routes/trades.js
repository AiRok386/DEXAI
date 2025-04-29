const express = require('express');
const router = express.Router();
const Trade = require('../models/Trade');

// GET /api/trades/:symbol?limit=10
router.get('/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toLowerCase();
    const limit = parseInt(req.query.limit) || 10;

    const trades = await Trade.find({ symbol })
      .sort({ timestamp: -1 })
      .limit(limit);

    res.json({ success: true, trades });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

module.exports = router;
