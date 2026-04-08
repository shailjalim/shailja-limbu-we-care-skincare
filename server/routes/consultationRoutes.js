const express = require('express');
const router = express.Router();
const { verifyToken, authorize, userOnly, checkSubscription, premiumOnly } = require('../middleware/authMiddleware');
const {
  requestConsultation,
  getMyConsultations,
  getAllConsultations,
  respondToConsultation,
} = require('../controllers/consultationController');

router.use(verifyToken);
router.post('/', checkSubscription, premiumOnly, userOnly, requestConsultation);
router.get('/', checkSubscription, premiumOnly, userOnly, getMyConsultations);

// Admin-only consultation management
router.get('/admin/all', authorize('admin'), getAllConsultations);
router.put('/admin/:id/respond', authorize('admin'), respondToConsultation);

module.exports = router;
