/**
 * Quiz Routes
 * 
 * Defines API endpoints for skin quiz operations.
 * All routes are protected and require authentication.
 * 
 * @module routes/quizRoutes
 * 
 * Routes:
 * - POST /api/quiz - Submit quiz answers and get skin type result
 */

const express = require('express');
const router = express.Router();

// Import authentication middleware
const { protect } = require('../middleware/authMiddleware');

// Import controller functions
const { submitQuiz } = require('../controllers/quizController');

// ================== PROTECTED ROUTES ==================
// All routes below require authentication (JWT token)

/**
 * @route   POST /api/quiz
 * @desc    Submit skin quiz answers and calculate skin type
 * @access  Private
 * 
 * @body    {Object} answers - Quiz answers object containing:
 *          - oilyAfterWash: "yes" | "no"
 *          - tightAfterWash: "yes" | "no"
 *          - frequentAcne: "yes" | "no"
 *          - rednessIrritation: "yes" | "no"
 *          - shinyTZone: "yes" | "no"
 * 
 * @returns {Object} Response containing:
 *          - success: boolean
 *          - message: string
 *          - skinType: calculated skin type
 *          - scores: breakdown of scores per skin type
 *          - profile: updated/created skin profile
 */
router.post('/', protect, submitQuiz);

module.exports = router;
