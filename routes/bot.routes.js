const express = require('express');
const router = express.Router();

const { startBot, stopBot, listBots } = require('../controllers/botController');
const { protectAdmin } = require('../middlewares/admin.middleware');

// 🔐 Only admins can control bots
router.post('/start', protectAdmin, startBot);
router.post('/stop', protectAdmin, stopBot);
router.get('/', protectAdmin, listBots);

module.exports = router;
