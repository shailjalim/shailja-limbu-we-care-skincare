const express = require('express');
const router = express.Router();
const { protect, userOnly } = require('../middleware/authMiddleware');
const {
  createSubscription,
  getCurrentSubscription,
  cancelSubscription,
} = require('../controllers/subscriptionController');

router.use(protect, userOnly);
router.post('/subscribe', createSubscription);
router.get('/current', getCurrentSubscription);
router.put('/:id/cancel', cancelSubscription);

module.exports = router;
