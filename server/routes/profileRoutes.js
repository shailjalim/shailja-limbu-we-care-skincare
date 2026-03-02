/**
 * Profile Routes
 * 
 * Defines API endpoints for skin profile operations.
 * All routes are protected and require authentication.
 * 
 * @module routes/profileRoutes
 * 
 * Routes:
 * - GET  /api/profile/me  - Get current user's skin profile
 * - POST /api/profile     - Create or update skin profile
 */

const express = require('express');
const router = express.Router();

// Import authentication middleware
const { protect } = require('../middleware/authMiddleware');

// Import controller functions
const { 
    createOrUpdateProfile, 
    getMyProfile 
} = require('../controllers/profileController');

// ================== PROTECTED ROUTES ==================
// All routes below require authentication (JWT token)

/**
 * @route   GET /api/profile/me
 * @desc    Get current authenticated user's skin profile
 * @access  Private
 */
router.get('/me', protect, getMyProfile);

/**
 * @route   POST /api/profile
 * @desc    Create new skin profile or update existing one
 * @access  Private
 * 
 * @body    {string} skinType - Required. One of: oily, dry, combination, normal, sensitive
 * @body    {string[]} concerns - Optional. Array of skin concerns
 * @body    {string[]} allergies - Optional. Array of known allergies
 * @body    {string[]} goals - Optional. Array of skincare goals
 */
router.post('/', protect, createOrUpdateProfile);

module.exports = router;
