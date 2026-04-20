/**
 * Quiz Controller
 * 
 * Handles weighted multi-choice skin quiz submission and result calculation.
 * Automatically creates or updates the user's SkinProfile with skin type,
 * concerns, sensitivity level, and allergies.
 * 
 * @module controllers/quizController
 */

const SkinProfile = require('../models/SkinProfile');
const QuizScoringConfig = require('../models/QuizScoringConfig');
const {
    SKIN_QUIZ_QUESTIONS,
    ALLERGY_MAP,
    buildQuizQuestionsWithOverrides,
} = require('../utils/skinQuizConfig');

const SCORE_KEYS = ['oily', 'dry', 'sensitive', 'acne'];

const getScoringQuestions = async () => {
    try {
        const activeConfig = await QuizScoringConfig
            .findOne({ isActive: true })
            .sort({ updatedAt: -1 })
            .lean();

        if (!activeConfig) {
            return {
                questions: SKIN_QUIZ_QUESTIONS,
                configVersion: 'default',
            };
        }

        return {
            questions: buildQuizQuestionsWithOverrides(
                SKIN_QUIZ_QUESTIONS,
                activeConfig.optionWeightOverrides || []
            ),
            configVersion: `${activeConfig.name || 'default'}-v${activeConfig.version || 1}`,
        };
    } catch (error) {
        return {
            questions: SKIN_QUIZ_QUESTIONS,
            configVersion: 'default-fallback',
        };
    }
};

const calculateScores = (answers, questions) => {
    const scores = {
        oily: 0,
        dry: 0,
        sensitive: 0,
        acne: 0,
    };

    questions.forEach((question) => {
        const selectedOptionId = answers[question.id];
        const selectedOption = question.options.find((option) => option.id === selectedOptionId);
        if (!selectedOption) return;

        SCORE_KEYS.forEach((key) => {
            scores[key] += Number(selectedOption.scores?.[key] || 0);
        });
    });

    return scores;
};

const determineSkinType = (scores) => {
    const { oily, dry, sensitive } = scores;
    const baseScores = [oily, dry, sensitive];
    const maxBaseScore = Math.max(...baseScores);
    const minBaseScore = Math.min(...baseScores);

    // Balanced profile means no strong dominance.
    if (maxBaseScore - minBaseScore <= 1) {
        return 'normal';
    }

    // Oily + dry both high generally indicates combination skin.
    if (oily >= 5 && dry >= 5) {
        return 'combination';
    }

    // Sensitive should be explicitly picked when it dominates.
    if (sensitive === maxBaseScore && sensitive > oily && sensitive > dry) {
        return 'sensitive';
    }

    if (oily > dry) return 'oily';
    if (dry > oily) return 'dry';

    return 'combination';
};

const determineConcerns = (scores) => {
    const concerns = [];

    if (scores.acne >= 3) concerns.push('acne');
    if (scores.dry >= 3) concerns.push('dryness');
    if (scores.oily >= 3) concerns.push('oil control');
    if (scores.sensitive >= 3) concerns.push('sensitivity');

    if (concerns.length === 0) {
        const ranked = [
            { key: 'acne', value: scores.acne, concern: 'acne' },
            { key: 'dry', value: scores.dry, concern: 'dryness' },
            { key: 'oily', value: scores.oily, concern: 'oil control' },
            { key: 'sensitive', value: scores.sensitive, concern: 'sensitivity' },
        ].sort((a, b) => b.value - a.value);

        if (ranked[0].value > 0) concerns.push(ranked[0].concern);
    }

    return concerns;
};

const determineSensitivityLevel = (sensitiveScore) => {
    if (sensitiveScore <= 2) return 'low';
    if (sensitiveScore <= 5) return 'medium';
    return 'high';
};

const extractAllergies = (answers) => {
    const selectedAllergyOption = answers.allergyTrigger;
    return ALLERGY_MAP[selectedAllergyOption] || [];
};

const getMissingQuestionIds = (answers, questions) => {
    return questions
        .map((question) => question.id)
        .filter((questionId) => !answers[questionId]);
};

const getInvalidQuestionAnswers = (answers, questions) => {
    const invalid = [];

    questions.forEach((question) => {
        const selectedOptionId = answers[question.id];
        if (!selectedOptionId) return;

        const isValidOption = question.options.some((option) => option.id === selectedOptionId);
        if (!isValidOption) invalid.push(question.id);
    });

    return invalid;
};


const submitQuiz = async (req, res) => {
    try {
        const userId = req.user._id;
        const { answers } = req.body;
        const { questions, configVersion } = await getScoringQuestions();

        if (!answers || typeof answers !== 'object') {
            return res.status(400).json({
                success: false,
                message: 'Quiz answers are required',
            });
        }

        const missingQuestions = getMissingQuestionIds(answers, questions);

        if (missingQuestions.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required answers: ${missingQuestions.join(', ')}`,
            });
        }

        const invalidAnswers = getInvalidQuestionAnswers(answers, questions);

        if (invalidAnswers.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Invalid option selected for: ${invalidAnswers.join(', ')}`,
            });
        }

        const scores = calculateScores(answers, questions);
        const skinType = determineSkinType(scores);
        const concerns = determineConcerns(scores);
        const sensitivityLevel = determineSensitivityLevel(scores.sensitive);
        const allergies = extractAllergies(answers);

        const profile = await SkinProfile.findOneAndUpdate(
            { user: userId },
            { 
                user: userId,
                skinType,
                concerns,
                sensitivityLevel,
                allergies,
                lastQuizDate: new Date(),
            },
            { 
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true,
            }
        );

        const result = {
            skinType,
            concerns,
            sensitivityLevel,
            allergies,
        };

        return res.status(200).json({
            success: true,
            message: 'Quiz completed successfully',
            result,
            scores,
            scoringConfig: configVersion,
            profile,
        });

    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', '),
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Server error while processing quiz',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

module.exports = {
    submitQuiz,
};
