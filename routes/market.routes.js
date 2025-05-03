// routes/market.routes.js

const express = require('express');
const router = express.Router();
const Market = require('../models/Market');

// GET /api/market/live — returns top 15 market data sorted by volume
router.get('/live', async (req, res) => {
  try {
    const marketData = await Market.find()
      .sort({ quoteVolume: -1 }) // Sort by 24h quote volume (highest first)
      .limit(15); // Return only top 15

    res.status(200).json(marketData);
  } catch (err) {
    console.error('❌ Failed to fetch live market data:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
