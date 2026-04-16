const express = require('express');
const router = express.Router();
const { verifyToken, userOnly } = require('../middleware/authMiddleware');
const { initiateEsewaPayment, verifyEsewaPayment } = require('../controllers/paymentController');

router.use(verifyToken, userOnly);

router.post('/initiate-esewa', initiateEsewaPayment);
router.post('/verify-esewa', verifyEsewaPayment);

module.exports = router;
