/**
 * SkinQuiz Page
 * 
 * Interactive skin type quiz for users to discover their skin type.
 * Submits answers to backend API and redirects to dashboard with results.
 * 
 * @module pages/SkinQuiz
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { submitSkinQuiz } from '../services/api';

/**
 * Quiz Questions Configuration
 * Each question has an id, text, and description for better UX
 */
const QUIZ_QUESTIONS = [
    {
        id: 'oilyAfterWash',
        question: 'Does your face feel oily shortly after washing?',
        description: 'Within 1-2 hours of cleansing, does your skin produce visible oil?',
        icon: '💧',
    },
    {
        id: 'tightAfterWash',
        question: 'Does your skin feel tight or dry after washing?',
        description: 'Do you experience a pulling sensation or flakiness after cleansing?',
        icon: '🏜️',
    },
    {
        id: 'frequentAcne',
        question: 'Do you frequently experience acne or breakouts?',
        description: 'Do you get pimples, blackheads, or whiteheads regularly?',
        icon: '🔴',
    },
    {
        id: 'rednessIrritation',
        question: 'Does your skin often show redness or irritation?',
        description: 'Do skincare products frequently cause burning, stinging, or redness?',
        icon: '🌸',
    },
    {
        id: 'shinyTZone',
        question: 'Is your T-zone (forehead, nose, chin) shiny while cheeks are normal/dry?',
        description: 'Do you notice oil only in certain areas of your face?',
        icon: '✨',
    },
];

/**
 * QuizQuestion Component
 * 
 * Reusable component for rendering individual quiz questions
 * with Yes/No radio button options.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.question - Question configuration object
 * @param {string} props.value - Current answer value
 * @param {Function} props.onChange - Handler for answer changes
 * @param {number} props.index - Question index for display
 */
const QuizQuestion = ({ question, value, onChange, index }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 transition-all hover:shadow-md">
            {/* Question Header */}
            <div className="flex items-start mb-4">
                <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-2xl">{question.icon}</span>
                </div>
                <div className="flex-1">
                    <p className="text-sm text-pink-600 font-medium mb-1">Question {index + 1} of 5</p>
                    <h3 className="text-lg font-semibold text-gray-800">{question.question}</h3>
                    <p className="text-sm text-gray-500 mt-1">{question.description}</p>
                </div>
            </div>

            {/* Answer Options */}
            <div className="flex space-x-4 mt-6">
                {/* Yes Option */}
                <label 
                    className={`flex-1 cursor-pointer transition-all ${
                        value === 'yes' 
                            ? 'ring-2 ring-pink-500 bg-pink-50' 
                            : 'bg-gray-50 hover:bg-gray-100'
                    } rounded-xl p-4`}
                >
                    <input
                        type="radio"
                        name={question.id}
                        value="yes"
                        checked={value === 'yes'}
                        onChange={(e) => onChange(question.id, e.target.value)}
                        className="sr-only"
                        aria-label={`Yes for ${question.question}`}
                    />
                    <div className="flex items-center justify-center">
                        <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                            value === 'yes' 
                                ? 'border-pink-500 bg-pink-500' 
                                : 'border-gray-300'
                        }`}>
                            {value === 'yes' && (
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>
                        <span className={`font-medium ${value === 'yes' ? 'text-pink-700' : 'text-gray-700'}`}>
                            Yes
                        </span>
                    </div>
                </label>

                {/* No Option */}
                <label 
                    className={`flex-1 cursor-pointer transition-all ${
                        value === 'no' 
                            ? 'ring-2 ring-pink-500 bg-pink-50' 
                            : 'bg-gray-50 hover:bg-gray-100'
                    } rounded-xl p-4`}
                >
                    <input
                        type="radio"
                        name={question.id}
                        value="no"
                        checked={value === 'no'}
                        onChange={(e) => onChange(question.id, e.target.value)}
                        className="sr-only"
                        aria-label={`No for ${question.question}`}
                    />
                    <div className="flex items-center justify-center">
                        <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                            value === 'no' 
                                ? 'border-pink-500 bg-pink-500' 
                                : 'border-gray-300'
                        }`}>
                            {value === 'no' && (
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>
                        <span className={`font-medium ${value === 'no' ? 'text-pink-700' : 'text-gray-700'}`}>
                            No
                        </span>
                    </div>
                </label>
            </div>
        </div>
    );
};

/**
 * SkinQuiz Component
 * 
 * Main quiz page component that manages quiz state and submission.
 */
const SkinQuiz = () => {
    const navigate = useNavigate();

    // ============ STATE MANAGEMENT ============

    // Quiz answers state - initialized with empty values
    const [answers, setAnswers] = useState({
        oilyAfterWash: '',
        tightAfterWash: '',
        frequentAcne: '',
        rednessIrritation: '',
        shinyTZone: '',
    });

    // UI state
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [result, setResult] = useState(null);

    // ============ COMPUTED VALUES ============

    // Count answered questions for progress indicator
    const answeredCount = Object.values(answers).filter(a => a !== '').length;
    const totalQuestions = QUIZ_QUESTIONS.length;
    const progressPercentage = (answeredCount / totalQuestions) * 100;

    // Check if all questions are answered
    const isComplete = answeredCount === totalQuestions;

    // ============ EVENT HANDLERS ============

    /**
     * Handle answer change for a question
     * @param {string} questionId - The question identifier
     * @param {string} value - The answer value ('yes' or 'no')
     */
    const handleAnswerChange = (questionId, value) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value,
        }));
        setError('');
    };

    /**
     * Handle quiz submission
     * Validates answers and submits to API
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        // ============ VALIDATION ============

        // Check if all questions are answered
        const unansweredQuestions = QUIZ_QUESTIONS.filter(q => !answers[q.id]);
        
        if (unansweredQuestions.length > 0) {
            setError(`Please answer all questions. Missing: ${unansweredQuestions.map(q => `Question ${QUIZ_QUESTIONS.indexOf(q) + 1}`).join(', ')}`);
            return;
        }

        // ============ API SUBMISSION ============

        setIsLoading(true);
        setError('');

        try {
            const response = await submitSkinQuiz(answers);

            if (response.success) {
                // Show success state with result
                setResult(response);
                setShowSuccess(true);

                // Redirect to dashboard after short delay
                setTimeout(() => {
                    navigate('/dashboard');
                }, 2500);
            }
        } catch (err) {
            setError(err.message || 'Failed to submit quiz. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Reset quiz to start over
     */
    const handleReset = () => {
        setAnswers({
            oilyAfterWash: '',
            tightAfterWash: '',
            frequentAcne: '',
            rednessIrritation: '',
            shinyTZone: '',
        });
        setError('');
    };

    // ============ SUCCESS STATE ============

    if (showSuccess && result) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center">
                    {/* Success Animation */}
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Quiz Completed!</h1>
                    
                    {/* Result Card */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                        <p className="text-gray-600 mb-4">Your skin type is:</p>
                        <div className="inline-flex items-center px-6 py-3 bg-pink-100 text-pink-700 rounded-full text-xl font-bold capitalize">
                            {result.skinType} Skin
                        </div>
                    </div>

                    <p className="text-gray-500 text-sm">
                        Redirecting to your dashboard...
                    </p>

                    {/* Loading Indicator */}
                    <div className="mt-4 flex justify-center">
                        <div className="w-8 h-8 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                </div>
            </div>
        );
    }

    // ============ QUIZ FORM ============

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link to="/dashboard" className="text-pink-600 hover:text-pink-700 text-sm font-medium mb-4 inline-flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-800 mt-4">Discover Your Skin Type</h1>
                    <p className="text-gray-600 mt-2">
                        Answer these 5 simple questions to find out your skin type and get personalized recommendations.
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm text-gray-500">{answeredCount} of {totalQuestions} answered</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                            className="bg-pink-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-start">
                        <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </div>
                )}

                {/* Quiz Form */}
                <form onSubmit={handleSubmit}>
                    {/* Questions */}
                    <div className="space-y-4">
                        {QUIZ_QUESTIONS.map((question, index) => (
                            <QuizQuestion
                                key={question.id}
                                question={question}
                                value={answers[question.id]}
                                onChange={handleAnswerChange}
                                index={index}
                            />
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 flex flex-col sm:flex-row gap-4">
                        {/* Reset Button */}
                        <button
                            type="button"
                            onClick={handleReset}
                            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
                            disabled={isLoading}
                        >
                            Reset Quiz
                        </button>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={!isComplete || isLoading}
                            className={`flex-1 px-6 py-3 rounded-xl font-medium transition flex items-center justify-center ${
                                isComplete && !isLoading
                                    ? 'bg-pink-600 text-white hover:bg-pink-700 shadow-lg hover:shadow-xl'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Get My Results
                                </>
                            )}
                        </button>
                    </div>

                    {/* Completion Hint */}
                    {!isComplete && (
                        <p className="text-center text-gray-500 text-sm mt-4">
                            Please answer all questions to see your results
                        </p>
                    )}
                </form>

                {/* Info Card */}
                <div className="mt-8 bg-pink-50 rounded-2xl p-6">
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Why take this quiz?
                    </h3>
                    <p className="text-gray-600 text-sm">
                        Understanding your skin type is the first step to building an effective skincare routine. 
                        Our quiz analyzes your skin's behavior to determine whether you have oily, dry, combination, 
                        normal, or sensitive skin.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SkinQuiz;
