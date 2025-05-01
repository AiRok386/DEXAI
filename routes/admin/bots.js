const express = require('express');
const router = express.Router();

const { startBot, stopBot } = require('../../bots/marketMakerBot');
const { adminAuthMiddleware } = require('../../middlewares/auth.middleware');

// Validate that imported functions exist
if (typeof startBot !== 'function' || typeof stopBot !== 'function') {
    throw new Error('[MarketMakerBot] startBot or stopBot is not a function. Check your export in marketMakerBot.js');
}

let isBotRunning = false;

// ✅ Start Market Maker Bot
router.post('/start-bot', adminAuthMiddleware, async (req, res) => {
    if (isBotRunning) {
        return res.status(400).json({ message: 'Bot is already running.' });
    }

    try {
        await startBot(); // Make it async-safe in case startBot returns a promise
        isBotRunning = true;
        res.status(200).json({ message: '✅ Market Maker Bot started.' });
    } catch (err) {
        console.error('Error starting bot:', err);
        res.status(500).json({ message: 'Failed to start bot.' });
    }
});

// ✅ Stop Market Maker Bot
router.post('/stop-bot', adminAuthMiddleware, async (req, res) => {
    if (!isBotRunning) {
        return res.status(400).json({ message: 'Bot is not running.' });
    }

    try {
        await stopBot(); // Make it async-safe
        isBotRunning = false;
        res.status(200).json({ message: '🛑 Market Maker Bot stopped.' });
    } catch (err) {
        console.error('Error stopping bot:', err);
        res.status(500).json({ message: 'Failed to stop bot.' });
    }
});

// ✅ Get Bot Status
router.get('/bot-status', adminAuthMiddleware, (req, res) => {
    res.status(200).json({
        running: isBotRunning,
        status: isBotRunning ? 'Running' : 'Stopped',
    });
});

module.exports = router;
