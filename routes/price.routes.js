const express = require('express');
const router = express.Router();
const Price = require('../models/Price');
const OrderBook = require('../models/OrderBook');

router.get('/prices', async (req, res) => {
  const data = await Price.find({});
  res.json(data);
});

router.get('/orderbook/:symbol', async (req, res) => {
  const data = await OrderBook.findOne({ symbol: req.params.symbol.toLowerCase() });
  res.json(data || {});
});

module.exports = router;
