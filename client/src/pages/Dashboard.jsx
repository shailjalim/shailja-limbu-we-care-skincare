/**
 * Updated Dashboard Page
 * 
 * Comprehensive dashboard for authenticated users with:
 * - Skin profile summary
 * - Quick actions
 * - Recommended products based on skin type
 * - Activity tracking
 * - Notifications
 * - Skin concerns and allergies
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSkinProfile, getUser, getAllProducts, getContent, getRoutines } from '../services/api';
import { getRecommendedContent } from '../utils/contentRecommendation';

/**
 * Skin type display configuration
 */
const SKIN_TYPE_CONFIG = {
    oily: { label: 'Oily', color: 'bg-yellow-100 text-yellow-800', icon: '💧' },
    dry: { label: 'Dry', color: 'bg-orange-100 text-orange-800', icon: '🏜️' },
    combination: { label: 'Combination', color: 'bg-purple-100 text-purple-800', icon: '⚖️' },
    normal: { label: 'Normal', color: 'bg-green-100 text-green-800', icon: '✨' },
    sensitive: { label: 'Sensitive', color: 'bg-red-100 text-red-800', icon: '🌸' },
};

/**
 * Get recommended products based on skin type, concerns, and allergies
 * Filters products that match skin type benefits and excludes allergenic ingredients
 */
const getRecommendedProductsForSkin = (products, skinType, concerns = [], allergies = []) => {
    if (!products || !Array.isArray(products)) return [];

    const benefitMap = {
        oily: ['oil control', 'acne treatment', 'brightening'],
        dry: ['hydration', 'soothing'],
        combination: ['hydration', 'oil control'],
        sensitive: ['soothing', 'hydration'],
        normal: ['hydration', 'brightening'],
    };

    const targetBenefits = benefitMap[skinType] || ['hydration', 'brightening'];

    // Score products based on benefit matches and filter by allergies
    const scored = products
        .filter((product) => {
            // Exclude products with allergenic ingredients
            if (allergies && allergies.length > 0) {
                const productIngredients = (product.ingredients || []).map((i) => i.toLowerCase());
                const hasAllergen = allergies.some((allergy) =>
                    productIngredients.some((ing) => ing.includes(allergy.toLowerCase()))
                );
                if (hasAllergen) return false;
            }
            return true;
        })
        .map((product) => {
            // Calculate benefit match score
            const benefitMatches = (product.benefits || []).filter((b) =>
                targetBenefits.includes(b)
            ).length;
            return { ...product, score: benefitMatches };
        })
        .filter((product) => product.score > 0)
        .sort((a, b) => b.score - a.score);

    // Return top 5 products
    return scored.slice(0, 5);
};

/**
 * Dashboard Component
 */
const Dashboard = () => {
    // State management
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [recommendedContent, setRecommendedContent] = useState([]);
    const [routines, setRoutines] = useState([]);

    const navigate = useNavigate();

    /**
     * Fetch user data, skin profile, products, and routines on component mount
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
                const profileResponse = await getSkinProfile();
                
                if (profileResponse.success && profileResponse.profile) {
                    setProfile(profileResponse.profile);
                    
                    // Fetch products and routines if profile exists
                    try {
                        const productsResponse = await getAllProducts();
                        const productsData = Array.isArray(productsResponse) ? productsResponse : productsResponse.products || [];

                        // Generate recommended products based on skin type
                        const recommended = getRecommendedProductsForSkin(
                            productsData,
                            profileResponse.profile.skinType,
                            profileResponse.profile.concerns || [],
                            profileResponse.profile.allergies || []
                        );
                        setRecommendedProducts(recommended);
                    } catch (prodErr) {
                        console.warn('Failed to load products:', prodErr);
                    }

                    try {
                        const contentResponse = await getContent();
                        const contentData = Array.isArray(contentResponse) ? contentResponse : [];

                        const recommendedArticles = getRecommendedContent(
                            profileResponse.profile,
                            contentData,
                            { limit: 5 }
                        );
                        setRecommendedContent(recommendedArticles);
                    } catch (contentErr) {
                        console.warn('Failed to load content:', contentErr);
                    }

                    // Fetch user routines for activity tracking
                    try {
                        const routinesResponse = await getRoutines();
                        setRoutines(routinesResponse.routines || []);
                    } catch (routineErr) {
                        console.warn('Failed to load routines:', routineErr);
                    }
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

    const skinTypeConfig = profile ? SKIN_TYPE_CONFIG[profile.skinType] || SKIN_TYPE_CONFIG.normal : SKIN_TYPE_CONFIG.normal;

    // ============ DASHBOARD LAYOUT ============
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Header */}
            <header className="bg-white border-b border-gray-100 px-4 lg:px-8 py-4">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
                        Welcome back, <span className="text-pink-600">{user?.name || 'User'}</span>
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Your personal dashboard is ready to glow.</p>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
                {/* Quick Actions & Sidebar */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Left Sidebar - Quick Actions & Notifications */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Quick Actions */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <Link 
                                    to="/routines"
                                    className="w-full flex items-center justify-between p-3 bg-pink-50 rounded-xl hover:bg-pink-100 transition"
                                >
                                    <div className="flex items-center">
                                        <span className="text-xl mr-2">📋</span>
                                        <span className="font-medium text-gray-800 text-sm">Build Routine</span>
                                    </div>
                                    <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>

                                <Link 
                                    to="/products"
                                    className="w-full flex items-center justify-between p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition"
                                >
                                    <div className="flex items-center">
                                        <span className="text-xl mr-2">🛍️</span>
                                        <span className="font-medium text-gray-800 text-sm">View Products</span>
                                    </div>
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>

                                <Link 
                                    to="/content"
                                    className="w-full flex items-center justify-between p-3 bg-rose-50 rounded-xl hover:bg-rose-100 transition"
                                >
                                    <div className="flex items-center">
                                        <span className="text-xl mr-2">📚</span>
                                        <span className="font-medium text-gray-800 text-sm">Learn Content</span>
                                    </div>
                                    <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>

                                <Link 
                                    to="/consultation"
                                    className="w-full flex items-center justify-between p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition"
                                >
                                    <div className="flex items-center">
                                        <span className="text-xl mr-2">👨‍⚕️</span>
                                        <span className="font-medium text-gray-800 text-sm">Consultation</span>
                                    </div>
                                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>

                                <Link 
                                    to="/subscription"
                                    className="w-full flex items-center justify-between p-3 bg-green-50 rounded-xl hover:bg-green-100 transition"
                                >
                                    <div className="flex items-center">
                                        <span className="text-xl mr-2">⭐</span>
                                        <span className="font-medium text-gray-800 text-sm">Subscription</span>
                                    </div>
                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>

                                {profile && (
                                    <button 
                                        onClick={handleTakeQuiz}
                                        className="w-full flex items-center justify-between p-3 bg-orange-50 rounded-xl hover:bg-orange-100 transition"
                                    >
                                        <div className="flex items-center">
                                            <span className="text-xl mr-2">🧠</span>
                                            <span className="font-medium text-gray-800 text-sm">Retake Quiz</span>
                                        </div>
                                        <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Notifications */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Notifications</h3>
                            <div className="space-y-3">
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        <span className="font-semibold">💡 Tip:</span> Complete your routine today for best results.
                                    </p>
                                </div>
                                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                    <p className="text-sm text-purple-800">
                                        <span className="font-semibold">✨ New:</span> Check out personalized product recommendations below.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Dashboard Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {!profile ? (
                            <div className="bg-white rounded-2xl shadow-sm p-8">
                                <div className="flex flex-col items-center text-center gap-4">
                                    <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center">
                                        <span className="text-4xl">✨</span>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Start Your Skin Journey</h2>
                                        <p className="text-gray-500">
                                            You haven't completed the skin quiz yet. Once you do, we'll finalize your skin type and personalize your routine.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                                        <div className="p-4 bg-pink-50 rounded-2xl">
                                            <h3 className="text-sm font-semibold text-gray-800 mb-2">Why take the quiz?</h3>
                                            <p className="text-sm text-gray-600">Discover whether your skin is oily, dry, combination, sensitive, or normal.</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-2xl">
                                            <h3 className="text-sm font-semibold text-gray-800 mb-2">What you get</h3>
                                            <p className="text-sm text-gray-600">Personalized skincare advice, routines, and product recommendations.</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleTakeQuiz}
                                        className="mt-6 px-8 py-3 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition font-medium"
                                    >
                                        Start Quiz Now
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Skin Profile Overview */}
                                <div className="bg-white rounded-2xl shadow-sm p-6">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Skin Profile Summary</h2>
                                    <div className="flex items-center justify-between flex-wrap gap-4">
                                        <div>
                                            <div className={`inline-flex items-center px-4 py-2 rounded-full ${skinTypeConfig.color} mb-3`}>
                                                <span className="mr-2">{skinTypeConfig.icon}</span>
                                                <span className="font-semibold">{skinTypeConfig.label} Skin</span>
                                            </div>
                                            <p className="text-gray-600 text-sm mb-2">
                                                Your skin type is <span className="font-semibold">{profile.skinType}</span>. Follow your routine regularly to maintain healthy skin.
                                            </p>
                                            <div className="flex gap-4 text-sm text-gray-600 mt-4">
                                                <div>
                                                    <p className="font-semibold text-gray-800">{profile.concerns?.length || 0}</p>
                                                    <p className="text-xs">Concerns</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800">{profile.allergies?.length || 0}</p>
                                                    <p className="text-xs">Allergies</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800">{profile.goals?.length || 0}</p>
                                                    <p className="text-xs">Goals</p>
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={handleTakeQuiz}
                                            className="px-6 py-2 border border-pink-600 text-pink-600 rounded-full hover:bg-pink-50 transition text-sm font-medium whitespace-nowrap"
                                        >
                                            Retake Quiz
                                        </button>
                                    </div>
                                </div>

                                {/* Recommended Products */}
                                <div className="bg-white rounded-2xl shadow-sm p-6">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Recommended Products</h2>
                                    {recommendedProducts.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {recommendedProducts.slice(0, 4).map((product) => (
                                                <div key={product._id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
                                                    <div className="mb-3">
                                                        <div className="inline-block px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full font-medium mb-2">
                                                            {product.category}
                                                        </div>
                                                        <h3 className="font-semibold text-gray-800 text-sm">{product.name}</h3>
                                                    </div>
                                                    <p className="text-gray-600 text-xs mb-3 line-clamp-2">{product.description}</p>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-lg font-bold text-pink-600">${product.price}</span>
                                                        <Link 
                                                            to={`/routines?productId=${product._id}&category=${encodeURIComponent(product.category)}`}
                                                            state={{
                                                                preselectProductId: product._id,
                                                                preselectCategory: product.category,
                                                            }}
                                                            className="text-xs px-3 py-1 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition"
                                                        >
                                                            Use in Routine
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-sm">No recommendations available. Update your profile for better suggestions.</p>
                                    )}
                                </div>

                                {/* Recommended Content */}
                                <div className="bg-white rounded-2xl shadow-sm p-6">
                                    <div className="flex items-center justify-between gap-4 mb-4">
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-800">Recommended for You</h2>
                                            <p className="text-sm text-gray-500">Educational articles matched to your concerns and skin type.</p>
                                        </div>
                                        <Link to="/content" className="text-sm font-medium text-pink-600 hover:text-pink-700">
                                            View all
                                        </Link>
                                    </div>
                                    {recommendedContent.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {recommendedContent.slice(0, 4).map((article) => (
                                                <div key={article._id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
                                                    <div className="flex items-center justify-between gap-3 mb-3">
                                                        <span className="inline-block px-2 py-1 bg-rose-100 text-rose-700 text-xs rounded-full font-medium">
                                                            {article.category}
                                                        </span>
                                                        <span className="text-xs text-gray-400">{article.tags?.slice(0, 2).join(' • ')}</span>
                                                    </div>
                                                    <h3 className="font-semibold text-gray-800 text-sm mb-2">{article.title}</h3>
                                                    <p className="text-gray-600 text-xs mb-3 line-clamp-3">
                                                        {article.content.length > 140 ? `${article.content.slice(0, 140).trim()}...` : article.content}
                                                    </p>
                                                    <Link
                                                        to={`/content/${article._id}`}
                                                        className="text-xs px-3 py-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition inline-block"
                                                    >
                                                        Read More
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-sm">No recommended articles yet. Browse the content library to explore skincare guides.</p>
                                    )}
                                </div>

                                {/* Activity & Progress */}
                                <div className="bg-white rounded-2xl shadow-sm p-6">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Activity</h2>
                                    <div className="mb-4 text-sm text-gray-600">
                                        <p>You completed {profile?.routineStats?.weeklyCompleted || 0} routines this week.</p>
                                        <p>Total routines completed: {profile?.routineStats?.totalCompleted || 0}</p>
                                    </div>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="p-4 bg-pink-50 rounded-xl text-center">
                                            <p className="text-3xl font-bold text-pink-600">{routines.length}</p>
                                            <p className="text-sm text-gray-600 mt-1">Routines Created</p>
                                        </div>
                                        <div className="p-4 bg-green-50 rounded-xl text-center">
                                            <p className="text-3xl font-bold text-green-600">{profile?.routineStats?.weeklyCompleted || 0}</p>
                                            <p className="text-sm text-gray-600 mt-1">Completed This Week</p>
                                        </div>
                                        <div className="p-4 bg-purple-50 rounded-xl text-center">
                                            <p className="text-3xl font-bold text-purple-600">{profile?.routineStats?.totalCompleted || 0}</p>
                                            <p className="text-sm text-gray-600 mt-1">Total Completed</p>
                                        </div>
                                        <div className="p-4 bg-blue-50 rounded-xl text-center">
                                            <p className="text-3xl font-bold text-blue-600">{profile?.goals?.length || 0}</p>
                                            <p className="text-sm text-gray-600 mt-1">Skincare Goals</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Skin Concerns & Allergies */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="bg-white rounded-2xl shadow-sm p-6">
                                        <h3 className="font-semibold text-gray-800 mb-3">Concerns</h3>
                                        {profile.concerns && profile.concerns.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {profile.concerns.map((concern, index) => (
                                                    <span key={index} className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium">
                                                        {concern}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-sm">No concerns added.</p>
                                        )}
                                    </div>

                                    <div className="bg-white rounded-2xl shadow-sm p-6">
                                        <h3 className="font-semibold text-gray-800 mb-3">Allergies</h3>
                                        {profile.allergies && profile.allergies.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {profile.allergies.map((allergy, index) => (
                                                    <span key={index} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                                        {allergy}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-sm">No allergies recorded.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Personalized Tip */}
                                <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl shadow-lg p-6 text-white">
                                    <h2 className="text-lg font-semibold mb-2">💡 Personalized Tip</h2>
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
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
