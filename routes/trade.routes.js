const express = require('express');
const router = express.Router();
const tradingController = require('../controllers/trade.controller');
const { protect } = require('../middlewares/auth.middleware');

// ⭐ Place Order
router.post('/order', protect, tradingController.placeOrder);

// ⭐ Fetch Order Book
router.get('/orderbook', tradingController.getOrderBook);

module.exports = router;
