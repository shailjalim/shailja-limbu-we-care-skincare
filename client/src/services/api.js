/**
 * API Service
 * 
 * Centralized API client for all backend communications.
 * Handles authentication, request/response interceptors, and API calls.
 * 
 * @module services/api
 */

import axios from 'axios';

// ================== CONFIGURATION ==================

/**
 * Base URL for the API
 * In development: Uses proxy from package.json (http://localhost:5000)
 * In production: Set REACT_APP_API_URL environment variable
 */
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

/**
 * Local Storage Keys
 */
const TOKEN_KEY = 'wecare_token';
const USER_KEY = 'wecare_user';

/**
 * Axios Instance
 * Pre-configured axios instance with base URL and default headers
 */
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds timeout
});

// ================== TOKEN MANAGEMENT ==================

/**
 * Get stored authentication token
 * @returns {string|null} - The stored token or null
 */
export const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};

/**
 * Store authentication token
 * @param {string} token - JWT token to store
 */
export const setToken = (token) => {
    localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Remove authentication token
 */
export const removeToken = () => {
    localStorage.removeItem(TOKEN_KEY);
};

/**
 * Get stored user data
 * @returns {Object|null} - The stored user object or null
 */
export const getStoredUser = () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
};

/**
 * Alias for getStoredUser - Get current user from storage
 * @returns {Object|null} - The stored user object or null
 */
export const getUser = getStoredUser;

/**
 * Store user data
 * @param {Object} user - User object to store
 */
export const setStoredUser = (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Remove stored user data
 */
export const removeStoredUser = () => {
    localStorage.removeItem(USER_KEY);
};

/**
 * Clear all authentication data
 */
export const clearAuthData = () => {
    removeToken();
    removeStoredUser();
};

/**
 * Check if user is authenticated
 * @returns {boolean} - True if token exists
 */
export const isAuthenticated = () => {
    return !!getToken();
};

// ================== REQUEST INTERCEPTOR ==================

/**
 * Request Interceptor
 * Automatically attaches JWT token to requests
 */
apiClient.interceptors.request.use(
    (config) => {
        const token = getToken();
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ================== RESPONSE INTERCEPTOR ==================

/**
 * Response Interceptor
 * Handles common response scenarios and errors
 */
apiClient.interceptors.response.use(
    (response) => {
        // Return the response data directly
        return response.data;
    },
    (error) => {
        // Handle common errors
        if (error.response) {
            const { status, data } = error.response;
            
            switch (status) {
                case 401:
                    // Unauthorized - clear auth data and redirect
                    clearAuthData();
                    // Optionally redirect to login
                    if (window.location.pathname !== '/login') {
                        window.location.href = '/login';
                    }
                    break;
                case 403:
                    console.error('Access forbidden');
                    break;
                case 404:
                    console.error('Resource not found');
                    break;
                case 500:
                    console.error('Server error');
                    break;
                default:
                    console.error('An error occurred');
            }
            
            // Return the error response data for handling in components
            return Promise.reject(data);
        } else if (error.request) {
            // Network error - no response received
            return Promise.reject({
                success: false,
                message: 'Network error. Please check your connection.',
            });
        } else {
            return Promise.reject({
                success: false,
                message: error.message || 'An unexpected error occurred',
            });
        }
    }
);

// ================== AUTHENTICATION API ==================

/**
 * Register a new user
 * 
 * @param {Object} userData - { name, email, password }
 * @returns {Promise<Object>} - User data with token
 */
export const register = async (userData) => {
    try {
        const response = await apiClient.post('/auth/register', userData);
        
        if (response.success && response.user) {
            // Store token and user data
            setToken(response.user.token);
            setStoredUser(response.user);
        }
        
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Login user
 * 
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} - User data with token
 */
export const login = async (credentials) => {
    try {
        const response = await apiClient.post('/auth/login', credentials);
        
        if (response.success && response.user) {
            // Store token and user data
            setToken(response.user.token);
            setStoredUser(response.user);
        }
        
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Logout user
 * Clears all stored authentication data
 */
export const logout = () => {
    clearAuthData();
};

/**
 * Get current user profile
 * 
 * @returns {Promise<Object>} - Current user data
 */
export const getCurrentUser = async () => {
    try {
        const response = await apiClient.get('/auth/me');
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Request password reset email
 * 
 * @param {string} email - User's email address
 * @returns {Promise<Object>} - Success response
 */
export const forgotPassword = async (email) => {
    try {
        const response = await apiClient.post('/auth/forgot-password', { email });
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Reset password with token
 * 
 * @param {string} token - Reset token from email
 * @param {string} password - New password
 * @returns {Promise<Object>} - Success response
 */
export const resetPassword = async (token, password) => {
    try {
        const response = await apiClient.post('/auth/reset-password', { token, password });
        return response;
    } catch (error) {
        throw error;
    }
};

// ================== SKIN PROFILE API ==================

/**
 * Get current user's skin profile
 * 
 * @returns {Promise<Object>} - User's skin profile data
 */
export const getSkinProfile = async () => {
    try {
        const response = await apiClient.get('/profile/me');
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Create or update skin profile
 * 
 * @param {Object} profileData - { skinType, concerns, allergies, goals }
 * @returns {Promise<Object>} - Updated profile data
 */
export const updateSkinProfile = async (profileData) => {
    try {
        const response = await apiClient.post('/profile', profileData);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Submit skin quiz answers
 * 
 * @param {Object} answers - Quiz answers object
 * @returns {Promise<Object>} - Quiz result with skin type
 */
export const submitSkinQuiz = async (answers) => {
    try {
        const response = await apiClient.post('/quiz', { answers });
        return response;
    } catch (error) {
        throw error;
    }
};

// ================== PRODUCT CATALOG API ==================

export const getProducts = async (params = {}) => {
    try {
        const response = await apiClient.get('/products', { params });
        return response;
    } catch (error) {
        throw error;
    }
};

export const getProductById = async (productId) => {
    try {
        const response = await apiClient.get(`/products/${productId}`);
        return response;
    } catch (error) {
        throw error;
    }
};

// ================== CONTENT API ==================

export const getContent = async (params = {}) => {
    try {
        const response = await apiClient.get('/content', { params });
        return response;
    } catch (error) {
        throw error;
    }
};

export const getContentById = async (contentId) => {
    try {
        const response = await apiClient.get(`/content/${contentId}`);
        return response;
    } catch (error) {
        throw error;
    }
};

export const getProductReviews = async (productId) => {
    try {
        const response = await apiClient.get(`/reviews/product/${productId}`);
        return response;
    } catch (error) {
        throw error;
    }
};

export const submitProductReview = async (productId, reviewData) => {
    try {
        const response = await apiClient.post(`/reviews/product/${productId}`, reviewData);
        return response;
    } catch (error) {
        throw error;
    }
};

export const getAllProducts = async () => {
    try {
        const response = await apiClient.get('/products');
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get personalized product recommendations based on user's skin profile
 * 
 * @param {Object} options - { limit?: 5, groupByCategory?: false, detailed?: false }
 * @returns {Promise<Object>} - Recommended products with scores and user profile
 */
export const getRecommendedProducts = async (options = {}) => {
    try {
        const params = {
            limit: options.limit || 5,
            groupByCategory: options.groupByCategory || false,
            detailed: options.detailed || false,
        };
        const response = await apiClient.get('/products/recommendations/personalized', { params });
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get detailed recommendations with reasoning and match percentages
 * 
 * @param {Object} options - { limit?: 5 }
 * @returns {Promise<Object>} - Recommendations with reasons and match percentages
 */
export const getDetailedRecommendations = async (options = {}) => {
    try {
        return getRecommendedProducts({
            limit: options.limit || 5,
            detailed: true,
        });
    } catch (error) {
        throw error;
    }
};

// ================== ROUTINE TRACKER API ==================

export const getRoutines = async () => {
    try {
        const response = await apiClient.get('/routines');
        return response;
    } catch (error) {
        throw error;
    }
};

export const createRoutine = async (routineData) => {
    try {
        const response = await apiClient.post('/routines', routineData);
        return response;
    } catch (error) {
        throw error;
    }
};

export const updateRoutine = async (routineId, routineData) => {
    try {
        const response = await apiClient.put(`/routines/${routineId}`, routineData);
        return response;
    } catch (error) {
        throw error;
    }
};

export const completeRoutine = async (routineId) => {
    try {
        const response = await apiClient.post('/routines/complete', { routineId });
        return response;
    } catch (error) {
        throw error;
    }
};

export const deleteRoutine = async (routineId) => {
    try {
        const response = await apiClient.delete(`/routines/${routineId}`);
        return response;
    } catch (error) {
        throw error;
    }
};

// ================== SUBSCRIPTION API ==================

export const getCurrentSubscription = async () => {
    try {
        const response = await apiClient.get('/subscriptions/current');
        return response;
    } catch (error) {
        throw error;
    }
};

export const subscribeToPlan = async (plan, paymentMethod) => {
    try {
        const response = await apiClient.post('/subscriptions/subscribe', { plan, paymentMethod });
        return response;
    } catch (error) {
        throw error;
    }
};

export const cancelSubscription = async (subscriptionId) => {
    try {
        const response = await apiClient.put(`/subscriptions/${subscriptionId}/cancel`);
        return response;
    } catch (error) {
        throw error;
    }
};

// ================== CONSULTATION API ==================

export const requestConsultation = async (consultationData) => {
    try {
        const response = await apiClient.post('/consultations', consultationData);
        return response;
    } catch (error) {
        throw error;
    }
};

export const getMyConsultations = async () => {
    try {
        const response = await apiClient.get('/consultations');
        return response;
    } catch (error) {
        throw error;
    }
};

export const getAllConsultations = async () => {
    try {
        const response = await apiClient.get('/consultations/admin/all');
        return response;
    } catch (error) {
        throw error;
    }
};

export const respondToConsultation = async (consultationId, responseText) => {
    try {
        const response = await apiClient.put(`/consultations/admin/${consultationId}/respond`, { response: responseText });
        return response;
    } catch (error) {
        throw error;
    }
};

// ================== CHATBOT API ==================

export const sendChatbotMessage = async (message, history = []) => {
    try {
        const response = await apiClient.post('/chatbot', { message, history });
        return response;
    } catch (error) {
        throw error;
    }
};

export const getChatHistory = async () => {
    try {
        const response = await apiClient.get('/chatbot');
        return response;
    } catch (error) {
        throw error;
    }
};

export const clearChatHistory = async () => {
    try {
        const response = await apiClient.delete('/chatbot');
        return response;
    } catch (error) {
        throw error;
    }
};

// ================== ADMIN API ==================

export const getAdminStats = async () => {
    try {
        const response = await apiClient.get('/admin/stats');
        return response;
    } catch (error) {
        throw error;
    }
};

export const getUsers = async () => {
    try {
        const response = await apiClient.get('/admin/users');
        return response;
    } catch (error) {
        throw error;
    }
};

export const updateUserRole = async (userId, role) => {
    try {
        const response = await apiClient.put(`/admin/users/${userId}/role`, { role });
        return response;
    } catch (error) {
        throw error;
    }
};

export const deleteUser = async (userId) => {
    try {
        const response = await apiClient.delete(`/admin/users/${userId}`);
        return response;
    } catch (error) {
        throw error;
    }
};

export const createProduct = async (productData) => {
    try {
        const response = await apiClient.post('/products', productData);
        return response;
    } catch (error) {
        throw error;
    }
};

export const deleteProduct = async (productId) => {
    try {
        const response = await apiClient.delete(`/products/${productId}`);
        return response;
    } catch (error) {
        throw error;
    }
};

// ================== ADMIN MANAGEMENT API ==================

export const getAdminProducts = async () => {
    try {
        const response = await apiClient.get('/admin/products');
        return response;
    } catch (error) {
        throw error;
    }
};

export const createAdminProduct = async (productData) => {
    try {
        const response = await apiClient.post('/admin/products', productData);
        return response;
    } catch (error) {
        throw error;
    }
};

export const updateAdminProduct = async (productId, productData) => {
    try {
        const response = await apiClient.put(`/admin/products/${productId}`, productData);
        return response;
    } catch (error) {
        throw error;
    }
};

export const deleteAdminProduct = async (productId) => {
    try {
        const response = await apiClient.delete(`/admin/products/${productId}`);
        return response;
    } catch (error) {
        throw error;
    }
};

export const getAdminUsers = async () => {
    try {
        const response = await apiClient.get('/admin/users');
        return response;
    } catch (error) {
        throw error;
    }
};

export const updateAdminUserRole = async (userId, role) => {
    try {
        const response = await apiClient.put(`/admin/users/${userId}/role`, { role });
        return response;
    } catch (error) {
        throw error;
    }
};

export const deleteAdminUser = async (userId) => {
    try {
        const response = await apiClient.delete(`/admin/users/${userId}`);
        return response;
    } catch (error) {
        throw error;
    }
};

export const getAdminArticles = async () => {
    try {
        const response = await apiClient.get('/admin/articles');
        return response;
    } catch (error) {
        throw error;
    }
};

export const createAdminArticle = async (articleData) => {
    try {
        const response = await apiClient.post('/admin/articles', articleData);
        return response;
    } catch (error) {
        throw error;
    }
};

export const updateAdminArticle = async (articleId, articleData) => {
    try {
        const response = await apiClient.put(`/admin/articles/${articleId}`, articleData);
        return response;
    } catch (error) {
        throw error;
    }
};

export const deleteAdminArticle = async (articleId) => {
    try {
        const response = await apiClient.delete(`/admin/articles/${articleId}`);
        return response;
    } catch (error) {
        throw error;
    }
};

export const getAdminConsultations = async () => {
    try {
        const response = await apiClient.get('/admin/consultations');
        return response;
    } catch (error) {
        throw error;
    }
};

export const updateAdminConsultation = async (consultationId, payload) => {
    try {
        const response = await apiClient.put(`/admin/consultations/${consultationId}`, payload);
        return response;
    } catch (error) {
        throw error;
    }
};

export const deleteAdminConsultation = async (consultationId) => {
    try {
        const response = await apiClient.delete(`/admin/consultations/${consultationId}`);
        return response;
    } catch (error) {
        throw error;
    }
};

// ================== TEST API FUNCTIONS ==================

/**
 * Test Backend Connection
 * Calls the /test endpoint to verify backend is running
 * 
 * @returns {Promise<Object>} - Response object with message
 */
export const testBackendConnection = async () => {
    try {
        const response = await apiClient.get('/test');
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get Health Status
 * Calls the /health endpoint for detailed server status
 * 
 * @returns {Promise<Object>} - Response object with health details
 */
export const getHealthStatus = async () => {
    try {
        const response = await apiClient.get('/health');
        return response;
    } catch (error) {
        throw error;
    }
};

// Export the axios instance for custom requests
export default apiClient;
