// controllers/botController.js

const Trade = require('../models/Trade');
const { getPrice } = require('../services/bitgetWebSocket');

const activeBots = new Map();

/**
 * Start a trading bot
 */
exports.startBot = async (req, res) => {
  const { pair, intervalSeconds, tradeVolume } = req.body;

  if (!pair || !intervalSeconds || !tradeVolume) {
    return res.status(400).json({ message: 'pair, intervalSeconds, and tradeVolume are required' });
  }

  if (activeBots.has(pair)) {
    return res.status(400).json({ message: `Bot for ${pair} is already running` });
  }

  const botId = setInterval(async () => {
    try {
      const price = getPrice(pair);
      if (!price) {
        console.log(`[Bot] ${pair}: Price not available yet`);
        return;
      }

      const trade = new Trade({
        pair,
        price,
        volume: tradeVolume,
        botGenerated: true,
        timestamp: new Date()
      });
      await trade.save();

      console.log(`[Bot] ${pair}: Executed simulated trade @ ${price}`);
    } catch (err) {
      console.error(`[Bot] ${pair}: Error simulating trade`, err);
    }
  }, intervalSeconds * 1000);

  activeBots.set(pair, botId);

  res.status(200).json({ message: `Bot started for ${pair}` });
};

/**
 * Stop a trading bot
 */
exports.stopBot = (req, res) => {
  const { pair } = req.body;

  if (!pair || !activeBots.has(pair)) {
    return res.status(400).json({ message: `No bot is running for ${pair}` });
  }

  clearInterval(activeBots.get(pair));
  activeBots.delete(pair);

  res.status(200).json({ message: `Bot stopped for ${pair}` });
};

/**
 * List active bots
 */
exports.listBots = (req, res) => {
  const bots = Array.from(activeBots.keys());
  res.status(200).json({ activePairs: bots });
};
