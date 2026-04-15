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
    getAccountProfile,
    updateAccountProfile,
    changeAccountPassword,
    uploadProfileImage,
    removeProfileImage,
    deactivateAccount,
    getAdminRegistrationStatus,
    forgotPassword,
    resetPassword,
} = require('../controllers/authController');

// Import auth middleware
const { protect } = require('../middleware/authMiddleware');
const { uploadProfileImage: uploadProfileImageMiddleware } = require('../middleware/uploadMiddleware');

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
 * @route   GET /api/auth/admin-status
 * @desc    Check if admin registration is still available
 * @access  Public
 */
router.get('/admin-status', getAdminRegistrationStatus);

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user
 * @access  Private
 */
router.get('/me', protect, getCurrentUser);

/**
 * @route   GET /api/auth/account
 * @desc    Get current account profile details
 * @access  Private
 */
router.get('/account', protect, getAccountProfile);

/**
 * @route   PATCH /api/auth/account
 * @desc    Update basic account information
 * @access  Private
 */
router.patch('/account', protect, updateAccountProfile);

/**
 * @route   PATCH /api/auth/account/password
 * @desc    Change account password
 * @access  Private
 */
router.patch('/account/password', protect, changeAccountPassword);

/**
 * @route   PATCH /api/auth/account/profile-image
 * @desc    Upload or replace profile image
 * @access  Private
 */
router.patch('/account/profile-image', protect, uploadProfileImageMiddleware, uploadProfileImage);

/**
 * @route   DELETE /api/auth/account/profile-image
 * @desc    Remove profile image
 * @access  Private
 */
router.delete('/account/profile-image', protect, removeProfileImage);

/**
 * @route   DELETE /api/auth/account
 * @desc    Soft delete account (deactivate)
 * @access  Private
 */
router.delete('/account', protect, deactivateAccount);

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



