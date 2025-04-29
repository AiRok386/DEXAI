const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const adminAuthController = require('../controllers/adminAuth.controller');

// ⭐ User Registration
router.post('/register', authController.register);

// ⭐ User Login
router.post('/login', authController.login);

// ⭐ Admin Login
router.post('/admin/login', adminAuthController.adminLogin);

module.exports = router;
