const express = require('express');
const router = express.Router();

const { startBot, stopBot } = require('../../bots/marketMakerBot');
const adminAuthMiddleware = require('../../middlewares/auth.middleware');

// Ensure middleware is a function
if (typeof adminAuthMiddleware !== 'function') {
    throw new Error('[auth.middleware] adminAuthMiddleware is not a function. Check your export.');
}

let isBotRunning = false;

// ✅ Start Market Maker Bot
router.post('/start-bot', adminAuthMiddleware, (req, res) => {
    if (isBotRunning) {
        return res.status(400).json({ message: 'Bot is already running.' });
    }

    try {
        startBot();
        isBotRunning = true;
        res.status(200).json({ message: '✅ Market Maker Bot started.' });
    } catch (err) {
        console.error('❌ Failed to start bot:', err);
        res.status(500).json({ message: 'Failed to start bot.' });
    }
});

// ✅ Stop Market Maker Bot
router.post('/stop-bot', adminAuthMiddleware, (req, res) => {
    if (!isBotRunning) {
        return res.status(400).json({ message: 'Bot is not running.' });
    }

    try {
        stopBot();
        isBotRunning = false;
        res.status(200).json({ message: '🛑 Market Maker Bot stopped.' });
    } catch (err) {
        console.error('❌ Failed to stop bot:', err);
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
