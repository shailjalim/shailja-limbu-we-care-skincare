const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, adminOnly } = require('../middleware/authMiddleware');

router.use(verifyToken, adminOnly);

router.get('/stats', adminController.getAdminDashboardStats);

module.exports = router;
