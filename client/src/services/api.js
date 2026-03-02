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
