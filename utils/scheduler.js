const cron = require('node-cron');
const { fetchMarketData } = require('../services/coinCapService');
const { saveOrUpdateMarketData } = require('../controllers/marketController');

function startScheduler() {
  // Every minute
  cron.schedule('* * * * *', async () => {
    try {
      console.log('[Scheduler] Fetching market data from CoinCap...');
      const data = await fetchMarketData();

      for (const asset of data) {
        await saveOrUpdateMarketData(asset); // Store or update in DB
      }

      console.log(`[Scheduler] Synced ${data.length} assets from CoinCap`);
    } catch (err) {
      console.error('[Scheduler] Error fetching market data:', err.message);
    }
  });
}

module.exports = {
  startScheduler
};
