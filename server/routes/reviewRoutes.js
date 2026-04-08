const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect, userOnly } = require('../middleware/authMiddleware');

router.get('/product/:productId', reviewController.getReviewsByProduct);
router.post('/product/:productId', protect, userOnly, reviewController.createReview);
router.get('/me', protect, userOnly, reviewController.getMyReviews);

module.exports = router;
