const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/product/:productId', reviewController.getReviewsByProduct);
router.post('/product/:productId', protect, reviewController.createReview);
router.get('/me', protect, reviewController.getMyReviews);

module.exports = router;
