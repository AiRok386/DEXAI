const express = require('express');
const router = express.Router();

const { startBot, stopBot } = require('../../bots/marketMakerBot');
const { adminAuthMiddleware } = require('../../middlewares/auth.middleware');

let isBotRunning = false;

// ✅ Start Market Maker Bot
router.post('/start-bot', adminAuthMiddleware, (req, res) => {
    if (isBotRunning) {
        return res.status(400).json({ message: 'Bot is already running.' });
    }

    startBot();
    isBotRunning = true;
    return res.status(200).json({ message: '✅ Market Maker Bot started.' });
});

// ✅ Stop Market Maker Bot
router.post('/stop-bot', adminAuthMiddleware, (req, res) => {
    if (!isBotRunning) {
        return res.status(400).json({ message: 'Bot is not running.' });
    }

    stopBot();
    isBotRunning = false;
    return res.status(200).json({ message: '🛑 Market Maker Bot stopped.' });
});

// ✅ Get Bot Status
router.get('/bot-status', adminAuthMiddleware, (req, res) => {
    return res.status(200).json({
        running: isBotRunning,
        status: isBotRunning ? 'Running' : 'Stopped',
    });
});

module.exports = router;
