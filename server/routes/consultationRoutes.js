const express = require('express');
const router = express.Router();
const { verifyToken, checkSubscription, premiumOnly } = require('../middleware/authMiddleware');
const { uploadConsultationImages } = require('../middleware/uploadMiddleware');
const {
  requestConsultation,
  getMyConsultations,
} = require('../controllers/consultationController');

router.use(verifyToken);
router.post('/', checkSubscription, premiumOnly, uploadConsultationImages, requestConsultation);
router.get('/', checkSubscription, premiumOnly, getMyConsultations);
router.get('/my', checkSubscription, premiumOnly, getMyConsultations);

module.exports = router;
