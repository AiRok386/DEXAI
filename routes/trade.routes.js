const express = require('express');
const router = express.Router();
const tradingController = require('../controllers/trade.controller');  // Ensure this is correctly imported
const { protect } = require('../middlewares/auth.middleware');  // Ensure the auth middleware is correct

// ⭐ Place Order
router.post('/order', protect, tradingController.placeOrder);

// ⭐ Fetch Order Book
router.get('/orderbook', tradingController.getOrderBook);

module.exports = router;
