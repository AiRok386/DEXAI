const express = require('express');
const router = express.Router();
const icoController = require('../controllers/ico.controller');
const { protectUser, protectAdmin } = require('../middlewares/auth.middleware');

// Admin Routes
router.post('/admin/ico', protectAdmin, icoController.createICO);
router.put('/admin/ico/:id', protectAdmin, icoController.updateICO);
router.delete('/admin/ico/:id', protectAdmin, icoController.deleteICO);

// Public Routes
router.get('/icos', icoController.getLiveICOs);

// User Routes
router.post('/ico/buy', protectUser, icoController.buyICO);

module.exports = router;
