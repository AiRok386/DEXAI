// utils/scheduler.js

const cron = require('node-cron');
const { fetchMarketData } = require('../services/coinCapService');
const { saveOrUpdateMarketData } = require('../controllers/marketController');

function startScheduler() {
  // Schedule a job to run every minute
  cron.schedule('* * * * *', async () => {
    try {
      console.log('[Scheduler] Fetching market data from CoinCap...');
      const data = await fetchMarketData();

      if (Array.isArray(data)) {
        for (const asset of data) {
          await saveOrUpdateMarketData(asset); // Save to DB
        }
        console.log(`[Scheduler] Synced ${data.length} assets from CoinCap`);
      } else {
        console.warn('[Scheduler] No asset data received');
      }
    } catch (err) {
      console.error('[Scheduler] Error fetching market data:', err.message);
    }
  });
}

module.exports = {
  startScheduler
};
