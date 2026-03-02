/**
 * Test Routes
 * 
 * These routes are used to verify that the backend server
 * is running correctly and can communicate with the frontend.
 */

const express = require('express');
const router = express.Router();

// Import the test controller
const testController = require('../controllers/testController');

/**
 * @route   GET /api/test
 * @desc    Test endpoint to verify backend is running
 * @access  Public
 */
router.get('/test', testController.getTestMessage);

/**
 * @route   GET /api/health
 * @desc    Health check endpoint for monitoring
 * @access  Public
 */
router.get('/health', testController.getHealthStatus);

module.exports = router;

