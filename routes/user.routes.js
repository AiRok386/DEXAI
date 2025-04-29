const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protectUser, protectAdmin } = require('../middlewares/authMiddleware');

// ⭐ Fetch User Info (User must login)
router.get('/profile', protectUser, userController.getUserInfo);

// ⭐ Update Profile (User must login)
router.put('/profile', protectUser, userController.updateProfile);

// ⭐ Submit KYC (User must login)
router.post('/kyc', protectUser, userController.submitKyc);

// ⭐ Admin: Approve or Reject KYC
router.put('/admin/kyc-action', protectAdmin, userController.adminKycAction);

module.exports = router;
