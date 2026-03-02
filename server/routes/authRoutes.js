/**
 * Authentication Routes
 * 
 * Defines all authentication-related API endpoints.
 * 
 * @module routes/authRoutes
 */

const express = require('express');
const router = express.Router();

// Import controller functions
const {
    registerUser,
    loginUser,
    getCurrentUser,
    forgotPassword,
    resetPassword,
} = require('../controllers/authController');

// Import auth middleware
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', registerUser);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return token
 * @access  Public
 */
router.post('/login', loginUser);

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user
 * @access  Private
 */
router.get('/me', protect, getCurrentUser);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post('/forgot-password', forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using token
 * @access  Public
 */
router.post('/reset-password', resetPassword);

module.exports = router;



