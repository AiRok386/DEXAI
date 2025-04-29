const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');
const { protectUser, protectAdmin } = require('../middlewares/authMiddleware');

// ⭐ User Wallet
router.get('/', protectUser, walletController.getWallet);

// ⭐ Simulate Deposit
router.post('/deposit', protectUser, walletController.simulateDeposit);

// ⭐ Request Withdrawal
router.post('/withdraw', protectUser, walletController.requestWithdrawal);

// ⭐ Admin Process Withdrawal
router.put('/admin/withdrawal', protectAdmin, walletController.adminProcessWithdrawal);

module.exports = router;
