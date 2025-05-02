const cron = require('node-cron');
const { fetchMarketData } = require('../services/coinCapService');
const { saveOrUpdateMarketData } = require('../controllers/marketController');

// Async function to start the scheduler
async function startScheduler() {
  // Schedule a cron job to fetch data every minute
  cron.schedule('* * * * *', async () => {
    try {
      console.log('[Scheduler] Fetching market data from CoinCap...');
      
      // Fetch market data
      const data = await fetchMarketData();

      if (Array.isArray(data) && data.length > 0) {
        // Loop through all assets and save them to the database
        for (const asset of data) {
          await saveOrUpdateMarketData(asset); // Assuming this is an async function
        }
        console.log(`[Scheduler] Synced ${data.length} assets from CoinCap`);
      } else {
        console.warn('[Scheduler] No asset data received');
      }
    } catch (err) {
      console.error('[Scheduler] Error fetching market data:', err.message);
    }
  });

  console.log('[Scheduler] Token price updater started and running every minute.');
}

module.exports = {
  startScheduler
};
