/**
 * Dashboard Page
 * 
 * Main dashboard for authenticated users.
 * Displays skin profile information, skin condition, and personalized insights.
 * Fetches data from the backend API on mount.
 * 
 * @module pages/Dashboard
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSkinProfile, getUser } from '../services/api';

/**
 * Skin type display configuration
 * Maps skin type values to display names and colors
 */
const SKIN_TYPE_CONFIG = {
    oily: { label: 'Oily', color: 'bg-yellow-100 text-yellow-800', icon: '💧' },
    dry: { label: 'Dry', color: 'bg-orange-100 text-orange-800', icon: '🏜️' },
    combination: { label: 'Combination', color: 'bg-purple-100 text-purple-800', icon: '⚖️' },
    normal: { label: 'Normal', color: 'bg-green-100 text-green-800', icon: '✨' },
    sensitive: { label: 'Sensitive', color: 'bg-red-100 text-red-800', icon: '🌸' },
};

/**
 * Dashboard Component
 * 
 * Displays user's skin profile and personalized dashboard.
 */
const Dashboard = () => {
    // State management
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);

    const navigate = useNavigate();

    /**
     * Fetch user data and skin profile on component mount
     */
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Get user data from localStorage
                const userData = getUser();
                setUser(userData);

                // Fetch skin profile from API
                const response = await getSkinProfile();
                
                if (response.success && response.profile) {
                    setProfile(response.profile);
                }
            } catch (err) {
                // Handle 404 (no profile) differently from other errors
                if (err.message === 'Skin profile not found. Please create your profile first.') {
                    setProfile(null);
                } else {
                    setError(err.message || 'Failed to load profile');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    /**
     * Navigate to quiz page
     */
    const handleTakeQuiz = () => {
        navigate('/quiz');
    };

    // ============ LOADING STATE ============
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    // ============ ERROR STATE ============
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // ============ NO PROFILE STATE ============
    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">🧴</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">No Skin Profile Found</h2>
                    <p className="text-gray-600 mb-6">
                        Take our quick skin quiz to discover your skin type and get personalized recommendations.
                    </p>
                    <button 
                        onClick={handleTakeQuiz}
                        className="w-full px-6 py-3 bg-pink-600 text-white rounded-full font-medium hover:bg-pink-700 transition shadow-lg hover:shadow-xl"
                    >
                        Take Skin Quiz
                    </button>
                </div>
            </div>
        );
    }

    // Get skin type configuration
    const skinTypeConfig = SKIN_TYPE_CONFIG[profile.skinType] || SKIN_TYPE_CONFIG.normal;

    // ============ DASHBOARD WITH PROFILE ============
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Header */}
            <header className="bg-white border-b border-gray-100 px-4 lg:px-8 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
                            Welcome back, <span className="text-pink-600">{user?.name || 'User'}</span>
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">Your personal dashboard is ready to glow.</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="hidden md:flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                className="bg-transparent border-none outline-none text-sm w-40"
                            />
                        </div>
                        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                            <span className="text-pink-600 font-semibold">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left Column - Skin Condition Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-800">Skin Condition</h2>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </button>
                            </div>

                            {/* Skin Type Badge */}
                            <div className="text-center mb-6">
                                <div className={`inline-flex items-center px-4 py-2 rounded-full ${skinTypeConfig.color} mb-4`}>
                                    <span className="mr-2">{skinTypeConfig.icon}</span>
                                    <span className="font-semibold">{skinTypeConfig.label} Skin</span>
                                </div>
                                <p className="text-gray-500 text-sm">Your skin is {profile.skinType}</p>
                            </div>

                            {/* Skin Stats */}
                            <div className="grid grid-cols-3 gap-4 text-center border-t border-gray-100 pt-6">
                                <div>
                                    <p className="text-2xl font-bold text-gray-800">{profile.concerns?.length || 0}</p>
                                    <p className="text-xs text-gray-500">Concerns</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-800">{profile.allergies?.length || 0}</p>
                                    <p className="text-xs text-gray-500">Allergies</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-800">{profile.goals?.length || 0}</p>
                                    <p className="text-xs text-gray-500">Goals</p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <button 
                                    onClick={handleTakeQuiz}
                                    className="w-full flex items-center justify-between p-3 bg-pink-50 rounded-xl hover:bg-pink-100 transition"
                                >
                                    <div className="flex items-center">
                                        <span className="text-xl mr-3">📋</span>
                                        <span className="font-medium text-gray-800">Retake Quiz</span>
                                    </div>
                                    <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                                <Link 
                                    to="/features"
                                    className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                                >
                                    <div className="flex items-center">
                                        <span className="text-xl mr-3">✨</span>
                                        <span className="font-medium text-gray-800">Explore Features</span>
                                    </div>
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Middle & Right Columns */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Skin Concerns */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Skin Concerns</h2>
                            {profile.concerns && profile.concerns.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {profile.concerns.map((concern, index) => (
                                        <span 
                                            key={index}
                                            className="px-4 py-2 bg-pink-50 text-pink-700 rounded-full text-sm font-medium"
                                        >
                                            {concern}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No concerns added yet. Retake the quiz to update.</p>
                            )}
                        </div>

                        {/* Allergies */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Known Allergies</h2>
                            {profile.allergies && profile.allergies.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {profile.allergies.map((allergy, index) => (
                                        <span 
                                            key={index}
                                            className="px-4 py-2 bg-red-50 text-red-700 rounded-full text-sm font-medium"
                                        >
                                            {allergy}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No allergies recorded. Update your profile to add.</p>
                            )}
                        </div>

                        {/* Skincare Goals */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Skincare Goals</h2>
                            {profile.goals && profile.goals.length > 0 ? (
                                <div className="space-y-3">
                                    {profile.goals.map((goal, index) => (
                                        <div 
                                            key={index}
                                            className="flex items-center p-3 bg-green-50 rounded-xl"
                                        >
                                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span className="font-medium text-gray-800">{goal}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No goals set yet. Update your profile to add skincare goals.</p>
                            )}
                        </div>

                        {/* Skin Insights Card */}
                        <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl shadow-lg p-6 text-white">
                            <h2 className="text-lg font-semibold mb-2">Personalized Tip</h2>
                            <p className="opacity-90 text-sm mb-4">
                                {profile.skinType === 'oily' && "Use oil-free moisturizers and clay masks weekly to control excess sebum."}
                                {profile.skinType === 'dry' && "Hydrate with hyaluronic acid serums and avoid hot water when washing your face."}
                                {profile.skinType === 'combination' && "Balance your routine with gentle cleansers and zone-specific treatments."}
                                {profile.skinType === 'sensitive' && "Choose fragrance-free products and always patch test new skincare items."}
                                {profile.skinType === 'normal' && "Maintain your healthy skin with consistent SPF and antioxidant serums."}
                            </p>
                            <Link 
                                to="/features"
                                className="inline-flex items-center text-sm font-medium hover:underline"
                            >
                                Learn more tips
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
