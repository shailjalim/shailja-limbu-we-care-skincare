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
 * @desc    Submit skin quiz answers and calculate profile insights
 * @access  Private
 * 
 * @body    {Object} answers - Quiz answers object containing:
 *          - Each question ID mapped to selected option ID
 * 
 * @returns {Object} Response containing:
 *          - success: boolean
 *          - message: string
 *          - result: { skinType, concerns, sensitivityLevel, allergies }
 *          - scores: breakdown of oily/dry/sensitive/acne scores
 *          - profile: updated/created skin profile
 */
router.post('/', protect, submitQuiz);

module.exports = router;
