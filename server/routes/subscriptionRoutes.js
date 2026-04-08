const express = require('express');
const router = express.Router();
const { verifyToken, userOnly } = require('../middleware/authMiddleware');
const {
  activateSubscription,
  getSubscriptionStatus,
  createSubscription,
  getCurrentSubscription,
  cancelSubscription,
} = require('../controllers/subscriptionController');

router.use(verifyToken, userOnly);

// New routes (preferred)
router.post('/activate', activateSubscription);
router.get('/status', getSubscriptionStatus);

// Backward-compatible routes
router.post('/subscribe', createSubscription);
router.get('/current', getCurrentSubscription);
router.put('/:id/cancel', cancelSubscription);

module.exports = router;
