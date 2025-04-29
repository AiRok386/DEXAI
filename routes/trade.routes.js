const express = require('express');
const router = express.Router();
const tradingController = require('../controllers/trading.controller');
const { protectUser } = require('../middlewares/auth.Middleware');

// ⭐ Place Order
router.post('/order', protectUser, tradingController.placeOrder);

// ⭐ Fetch Order Book
router.get('/orderbook', tradingController.getOrderBook);

module.exports = router;
