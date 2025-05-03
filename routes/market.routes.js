const express = require('express');
const { getMemoryData } = require('../services/binanceDataService');
const router = express.Router();

// GET /api/market/top15
router.get('/top15', (req, res) => {
  res.json(getMemoryData());
});

module.exports = router;
