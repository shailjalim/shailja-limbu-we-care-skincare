/**
 * Quiz Controller
 * 
 * Handles skin quiz submission and skin type calculation.
 * Uses a scoring algorithm to determine user's skin type based on quiz answers.
 * Automatically creates or updates the user's SkinProfile with the calculated result.
 * 
 * @module controllers/quizController
 */

const SkinProfile = require('../models/SkinProfile');

/**
 * Valid answer values for quiz questions
 */
const VALID_ANSWERS = ['yes', 'no'];

/**
 * Required quiz questions
 */
const REQUIRED_QUESTIONS = [
    'oilyAfterWash',
    'tightAfterWash',
    'frequentAcne',
    'rednessIrritation',
    'shinyTZone'
];

/**
 * @desc    Submit Skin Quiz and Calculate Skin Type
 * @route   POST /api/quiz
 * @access  Private (requires authentication)
 * 
 * @body    {Object} answers - Quiz answers object
 * @body    {string} answers.oilyAfterWash - "yes" or "no"
 * @body    {string} answers.tightAfterWash - "yes" or "no"
 * @body    {string} answers.frequentAcne - "yes" or "no"
 * @body    {string} answers.rednessIrritation - "yes" or "no"
 * @body    {string} answers.shinyTZone - "yes" or "no"
 * 
 * Scoring Logic:
 * - oilyAfterWash === "yes" → oily += 2
 * - tightAfterWash === "yes" → dry += 2
 * - frequentAcne === "yes" → oily += 1
 * - rednessIrritation === "yes" → sensitive += 2
 * - shinyTZone === "yes" → combination += 2
 * - If no strong indicators → normal
 * - Final skinType = highest score
 * - If tie between oily & dry → combination
 */
const submitQuiz = async (req, res) => {
    try {
        // Extract user ID from authenticated request
        const userId = req.user._id;

        // Extract answers from request body
        const { answers } = req.body;

        // ============ VALIDATION ============

        // Check if answers object exists
        if (!answers || typeof answers !== 'object') {
            return res.status(400).json({
                success: false,
                message: 'Quiz answers are required',
            });
        }

        // Validate all required questions are present
        const missingQuestions = REQUIRED_QUESTIONS.filter(
            question => !answers.hasOwnProperty(question)
        );

        if (missingQuestions.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required answers: ${missingQuestions.join(', ')}`,
            });
        }

        // Validate answer values (must be "yes" or "no")
        const invalidAnswers = REQUIRED_QUESTIONS.filter(
            question => !VALID_ANSWERS.includes(answers[question]?.toLowerCase())
        );

        if (invalidAnswers.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Invalid answer values for: ${invalidAnswers.join(', ')}. Must be "yes" or "no".`,
            });
        }

        // Normalize answers to lowercase
        const normalizedAnswers = {};
        REQUIRED_QUESTIONS.forEach(question => {
            normalizedAnswers[question] = answers[question].toLowerCase();
        });

        // ============ SCORING ALGORITHM ============

        /**
         * Initialize scores for each skin type
         * Each skin type starts at 0 and gains points based on quiz answers
         */
        let scores = {
            oily: 0,
            dry: 0,
            sensitive: 0,
            normal: 0,
            combination: 0
        };

        /**
         * Apply scoring rules based on quiz answers
         * 
         * Rule 1: Oily skin after washing indicates oily skin type
         * Rule 2: Tight feeling after washing indicates dry skin type
         * Rule 3: Frequent acne is a secondary indicator of oily skin
         * Rule 4: Redness/irritation indicates sensitive skin type
         * Rule 5: Shiny T-zone with other areas normal indicates combination skin
         */

        // Rule 1: Oily after wash → strong indicator of oily skin (+2)
        if (normalizedAnswers.oilyAfterWash === 'yes') {
            scores.oily += 2;
        }

        // Rule 2: Tight after wash → strong indicator of dry skin (+2)
        if (normalizedAnswers.tightAfterWash === 'yes') {
            scores.dry += 2;
        }

        // Rule 3: Frequent acne → secondary indicator of oily skin (+1)
        if (normalizedAnswers.frequentAcne === 'yes') {
            scores.oily += 1;
        }

        // Rule 4: Redness/irritation → strong indicator of sensitive skin (+2)
        if (normalizedAnswers.rednessIrritation === 'yes') {
            scores.sensitive += 2;
        }

        // Rule 5: Shiny T-zone → strong indicator of combination skin (+2)
        if (normalizedAnswers.shinyTZone === 'yes') {
            scores.combination += 2;
        }

        // ============ DETERMINE SKIN TYPE ============

        /**
         * Calculate the final skin type based on scores
         * 
         * Logic:
         * 1. If all scores are 0 → Normal skin (no specific concerns)
         * 2. If tie between oily and dry → Combination skin
         * 3. Otherwise → Highest scoring skin type wins
         */

        let skinType = 'normal';
        let maxScore = 0;

        // Find the highest score
        const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

        // If no indicators were triggered, skin type is normal
        if (totalScore === 0) {
            skinType = 'normal';
            scores.normal = 1; // Give normal a score for display purposes
        } else {
            // Check for tie between oily and dry (indicates combination skin)
            if (scores.oily > 0 && scores.dry > 0 && scores.oily === scores.dry) {
                skinType = 'combination';
            } else {
                // Find the skin type with the highest score
                for (const [type, score] of Object.entries(scores)) {
                    if (score > maxScore) {
                        maxScore = score;
                        skinType = type;
                    }
                }
            }
        }

        // ============ UPDATE OR CREATE SKIN PROFILE ============

        /**
         * Find existing profile and update, or create new one
         * Uses findOneAndUpdate with upsert for atomic operation
         */
        const profile = await SkinProfile.findOneAndUpdate(
            { user: userId },
            { 
                user: userId,
                skinType: skinType,
            },
            { 
                new: true,           // Return updated document
                upsert: true,        // Create if doesn't exist
                runValidators: true, // Run schema validators
                setDefaultsOnInsert: true // Apply defaults for new docs
            }
        );

        // ============ RETURN RESULT ============

        return res.status(200).json({
            success: true,
            message: 'Quiz completed successfully',
            skinType: skinType,
            scores: scores,
            profile: profile,
        });

    } catch (error) {
        // Handle validation errors from Mongoose
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', '),
            });
        }

        // Handle other server errors
        return res.status(500).json({
            success: false,
            message: 'Server error while processing quiz',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

// Export controller functions
module.exports = {
    submitQuiz,
};
