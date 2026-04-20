import React, { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { submitSkinQuiz } from '../services/api';
import { SKIN_QUIZ_QUESTIONS } from '../data/skinQuizQuestions';


const SkinQuiz = () => {
    const navigate = useNavigate();
    const totalQuestions = SKIN_QUIZ_QUESTIONS.length;

    const [answers, setAnswers] = useState({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSummary, setShowSummary] = useState(false);
    const [result, setResult] = useState(null);

    const answeredCount = Object.values(answers).filter(a => a !== '').length;
    const progressPercentage = (answeredCount / totalQuestions) * 100;
    const isComplete = answeredCount === totalQuestions;
    const currentQuestion = SKIN_QUIZ_QUESTIONS[currentQuestionIndex];
    const selectedCurrentOption = answers[currentQuestion?.id] || '';

    const unansweredIndices = useMemo(
        () => SKIN_QUIZ_QUESTIONS
            .map((question, index) => (!answers[question.id] ? index + 1 : null))
            .filter(Boolean),
        [answers]
    );

    const handleAnswerChange = (questionId, value) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value,
        }));
        setError('');
    };

    const handleNextQuestion = () => {
        if (!selectedCurrentOption) {
            setError('Please select an option to continue.');
            return;
        }

        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
            setError('');
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1);
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isComplete) {
            setError(`Please answer all questions before submitting. Missing: ${unansweredIndices.join(', ')}`);
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await submitSkinQuiz(answers);

            if (response.success) {
                const resultData = response.result || {
                    skinType: response.skinType,
                    concerns: response.concerns || [],
                    sensitivityLevel: response.sensitivityLevel,
                    allergies: response.allergies || [],
                };

                setResult(resultData);
                setShowSummary(true);

                setTimeout(() => {
                    navigate('/dashboard');
                }, 3500);
            }
        } catch (err) {
            setError(err.message || 'Failed to submit quiz. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setAnswers({});
        setCurrentQuestionIndex(0);
        setError('');
    };

    if (showSummary && result) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center px-4">
                <div className="max-w-lg w-full text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 animate-bounce">
                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <h1 className="text-3xl font-bold text-gray-800 mb-3">Result Summary</h1>

                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 text-left">
                        <div className="mb-4">
                            <p className="text-sm text-gray-500">Skin Type</p>
                            <p className="text-lg font-bold text-pink-700 capitalize">{result.skinType}</p>
                        </div>
                        <div className="mb-4">
                            <p className="text-sm text-gray-500">Sensitivity Level</p>
                            <p className="text-lg font-semibold text-gray-800 capitalize">{result.sensitivityLevel || 'low'}</p>
                        </div>
                        <div className="mb-4">
                            <p className="text-sm text-gray-500 mb-2">Concerns</p>
                            {result.concerns?.length ? (
                                <div className="flex flex-wrap gap-2">
                                    {result.concerns.map((concern) => (
                                        <span key={concern} className="px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-medium">
                                            {concern}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-600">No major concerns detected.</p>
                            )}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-2">Allergies</p>
                            {result.allergies?.length ? (
                                <div className="flex flex-wrap gap-2">
                                    {result.allergies.map((allergy) => (
                                        <span key={allergy} className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
                                            {allergy}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-600">No known allergies selected.</p>
                            )}
                        </div>
                    </div>

                    <p className="text-gray-500 text-sm">
                        Redirecting to your dashboard...
                    </p>
                    <div className="mt-4 flex justify-center">
                        <div className="w-8 h-8 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <Link to="/dashboard" className="text-pink-600 hover:text-pink-700 text-sm font-medium mb-4 inline-flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-800 mt-4">Discover Your Skin Type</h1>
                    <p className="text-gray-600 mt-2">
                        Answer these 10 questions to get a realistic skin profile and personalized guidance.
                    </p>
                </div>

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

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-start">
                        <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                                {currentQuestion.icon}
                            </div>
                            <div>
                                <p className="text-sm text-pink-600 font-medium mb-1">Question {currentQuestionIndex + 1} of {totalQuestions}</p>
                                <h2 className="text-lg font-semibold text-gray-800">{currentQuestion.question}</h2>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {currentQuestion.options.map((option) => {
                                const isSelected = selectedCurrentOption === option.id;

                                return (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => handleAnswerChange(currentQuestion.id, option.id)}
                                        className={`w-full text-left rounded-xl border px-4 py-3 transition ${
                                            isSelected
                                                ? 'border-pink-500 bg-pink-50 shadow-sm'
                                                : 'border-gray-200 bg-white hover:border-pink-300 hover:bg-pink-50/40'
                                        }`}
                                    >
                                        <span className={`font-medium ${isSelected ? 'text-pink-700' : 'text-gray-700'}`}>
                                            {option.text}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row gap-4">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
                            disabled={isLoading}
                        >
                            Reset Quiz
                        </button>

                        <button
                            type="button"
                            onClick={handlePreviousQuestion}
                            disabled={currentQuestionIndex === 0 || isLoading}
                            className={`flex-1 px-6 py-3 rounded-xl font-medium transition ${
                                currentQuestionIndex === 0 || isLoading
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            Previous
                        </button>

                        {currentQuestionIndex < totalQuestions - 1 ? (
                            <button
                                type="button"
                                onClick={handleNextQuestion}
                                className="flex-1 px-6 py-3 rounded-xl font-medium bg-pink-600 text-white hover:bg-pink-700 transition"
                            >
                                Next
                            </button>
                        ) : (
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
                                    'See My Results'
                                )}
                            </button>
                        )}
                    </div>

                    {!isComplete && (
                        <p className="text-center text-gray-500 text-sm mt-4">
                            Complete all questions to unlock your personalized summary.
                        </p>
                    )}
                </form>

                <div className="mt-8 bg-pink-50 rounded-2xl p-6">
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Why take this quiz?
                    </h3>
                    <p className="text-gray-600 text-sm">
                        This advanced quiz evaluates oil balance, hydration, sensitivity, acne tendency, and allergy triggers
                        to build a more realistic skin profile for personalized recommendations.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SkinQuiz;
