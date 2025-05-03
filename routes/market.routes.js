const express = require('express');
const { getMemoryData } = require('../services/binanceDataService');
const router = express.Router();

// GET /api/market/top15
router.get('/top15', (req, res) => {
  res.json(getMemoryData());
});

const { getAllMarketData, getMarketData } = require('../marketDataStore');

router.get('/markets/:symbol', (req, res) => {
  const data = getMarketData(req.params.symbol.toUpperCase());
  if (!data) return res.status(404).json({ error: 'Symbol not found' });
  res.json(data);
});

module.exports = router;
