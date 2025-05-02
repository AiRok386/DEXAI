const cron = require('node-cron');
const { updatePrices } = require('../controllers/priceController');

// Runs every 10 seconds
const startScheduler = () => {
  cron.schedule('*/10 * * * * *', updatePrices);
};

module.exports = startScheduler;
