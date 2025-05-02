const Market = require('../models/Market');

// GET /api/markets — Get all market data
const getAllMarkets = async (req, res) => {
  try {
    const markets = await Market.find({});
    res.status(200).json(markets);
  } catch (error) {
    console.error('Error fetching market data:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getAllMarkets };
