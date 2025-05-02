const axios = require('axios');
const User = require('../models/User');
const Trade = require('../models/Trade'); // Assuming you have a Trade model
const { generateRandomPrice } = require('../utils/crypto.util'); // Can be removed if you no longer need random price generation

// In-memory bot list (in production, store in DB or cache)
const activeBots = new Map();

// CoinCap API URL
const COINCAP_API_URL = 'https://api.coincap.io/v2/assets';

// Function to get live price from CoinCap API
const getLivePrice = async (assetId) => {
    try {
        const response = await axios.get(`${COINCAP_API_URL}/${assetId}`);
        return response.data.data.priceUsd; // Assuming you're getting price in USD
    } catch (error) {
        console.error('Error fetching live price:', error);
        return null;
    }
};

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
            // Get the live price for the pair from CoinCap API
            const price = await getLivePrice(pair);
            if (!price) {
                console.log(`[Bot] ${pair}: Failed to fetch live price`);
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

            // Here you can broadcast the trade to a client or log it
            // For now, we'll just log the trade to the console
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
