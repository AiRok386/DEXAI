const express = require('express');
const router = express.Router();
const icoController = require('../controllers/ico.controller'); // This is important
const { protect, protectAdmin } = require('../middlewares/auth.middleware');

// Admin Routes
router.post('/admin/ico', protectAdmin, icoController.createICO); // Ensure this is correct

// Public Routes
router.get('/icos', icoController.getLiveICOs);  // Ensure this is correct

// User Routes
router.post('/ico/buy', protect, icoController.buyICO); // Ensure this is correct

module.exports = router;
