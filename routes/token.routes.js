const express = require('express');
const router = express.Router();
const tokenController = require('../controllers/token.controller');
const { protectAdmin } = require('../middlewares/auth.middleware');

// ⭐ Admin Routes
router.post('/admin/token', protectAdmin, tokenController.createToken); // Create
router.put('/admin/token/:id', protectAdmin, tokenController.updateToken); // Update
router.delete('/admin/token/:id', protectAdmin, tokenController.deleteToken); // Delete

// ⭐ Public Route
router.get('/tokens', tokenController.getActiveTokens); // Fetch all active tokens (frontend use)

module.exports = router;
