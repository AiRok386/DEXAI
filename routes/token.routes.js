// routes/token.routes.js
const express = require('express');
const router = express.Router();
const tokenController = require('../controllers/token.controller');
const { protectAdmin } = require('../middlewares/auth.middleware');

// 🟢 Public Route (for frontend)
router.get('/', tokenController.getActiveTokens); // GET /api/tokens

// 🔒 Admin Routes (optional, protected)
router.post('/admin', protectAdmin, tokenController.createToken);
router.put('/admin/:id', protectAdmin, tokenController.updateToken);
router.delete('/admin/:id', protectAdmin, tokenController.deleteToken);

module.exports = router;
