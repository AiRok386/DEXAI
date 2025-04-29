const express = require('express');
const router = express.Router();
const icoController = require('../controllers/ico.controller'); // Ensure it's correctly imported
const { protect, protectAdmin } = require('../middlewares/auth.middleware');

// Admin Routes
router.post('/admin/ico', protectAdmin, icoController.createICO); // Ensure this function exists
router.put('/admin/ico/:id', protectAdmin, icoController.updateICO); // Ensure this function exists
router.delete('/admin/ico/:id', protectAdmin, icoController.deleteICO); // Ensure this function exists

// Public Routes
router.get('/icos', icoController.getLiveICOs); // Ensure this function exists

// User Routes
router.post('/ico/buy', protect, icoController.buyICO); // Ensure this function exists

module.exports = router;
