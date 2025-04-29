const express = require('express');
const router = express.Router();
const { startBot, stopBot } = require('../../bots/marketMakerBot');
const { adminAuthMiddleware } = require('../../middlewares/authMiddleware');

// Track bot status
let botRunning = false;

// Start Bot
router.post('/start-bot', adminAuthMiddleware, (req, res) => {
    if (botRunning) {
        return res.status(400).json({ message: 'Bot is already running.' });
    }
    startBot();
    botRunning = true;
    res.json({ message: 'Market Maker Bot started successfully.' });
});

// Stop Bot
router.post('/stop-bot', adminAuthMiddleware, (req, res) => {
    if (!botRunning) {
        return res.status(400).json({ message: 'Bot is not running.' });
    }
    stopBot();
    botRunning = false;
    res.json({ message: 'Market Maker Bot stopped successfully.' });
});

// Check Bot Status
router.get('/bot-status', adminAuthMiddleware, (req, res) => {
    res.json({ running: botRunning });
});

module.exports = router;
