const express = require('express');
const router = express.Router();

// Importing route handlers from botController.js
const { startBot, stopBot, listBots } = require('../controllers/botController');

// Importing middleware for admin protection
const { protectAdmin } = require('../middlewares/admin.middleware');

// Route to start a bot (protected by admin middleware)
router.post('/start', protectAdmin, (req, res) => {
  try {
    startBot(req, res);
  } catch (error) {
    console.error("Error starting bot:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to stop a bot (protected by admin middleware)
router.post('/stop', protectAdmin, (req, res) => {
  try {
    stopBot(req, res);
  } catch (error) {
    console.error("Error stopping bot:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to list all bots (protected by admin middleware)
router.get('/', protectAdmin, (req, res) => {
  try {
    listBots(req, res);
  } catch (error) {
    console.error("Error listing bots:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
