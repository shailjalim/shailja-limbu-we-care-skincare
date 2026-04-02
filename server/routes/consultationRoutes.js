const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  requestConsultation,
  getMyConsultations,
  getAllConsultations,
  respondToConsultation,
} = require('../controllers/consultationController');

router.use(protect);
router.post('/', requestConsultation);
router.get('/', getMyConsultations);

// Admin-only consultation management
router.get('/admin/all', authorize('admin'), getAllConsultations);
router.put('/admin/:id/respond', authorize('admin'), respondToConsultation);

module.exports = router;
