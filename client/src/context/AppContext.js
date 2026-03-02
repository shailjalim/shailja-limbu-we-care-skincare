/**
 * App Context
 * 
 * This context provides global state management for the application.
 * It can be used to share data between components without prop drilling.
 * 
 * Future use cases:
 * - User authentication state
 * - Theme preferences
 * - Global notifications
 * - Loading states
 */

import React, { createContext, useContext, useState, useReducer } from 'react';

// ================== INITIAL STATE ==================

const initialState = {
    // User state (for future authentication)
    user: null,
    isAuthenticated: false,
    
    // Application state
    isLoading: false,
    
    // Theme state
    theme: 'light',
    
    // Notification state
    notification: null,
};

// ================== ACTION TYPES ==================

const ActionTypes = {
    SET_USER: 'SET_USER',
    LOGOUT: 'LOGOUT',
    SET_LOADING: 'SET_LOADING',
    SET_THEME: 'SET_THEME',
    SET_NOTIFICATION: 'SET_NOTIFICATION',
    CLEAR_NOTIFICATION: 'CLEAR_NOTIFICATION',
};

// ================== REDUCER ==================

/**
 * App Reducer
 * Handles state updates based on dispatched actions
 */
const appReducer = (state, action) => {
    switch (action.type) {
        case ActionTypes.SET_USER:
            return {
                ...state,
                user: action.payload,
                isAuthenticated: true,
            };
            
        case ActionTypes.LOGOUT:
            return {
                ...state,
                user: null,
                isAuthenticated: false,
            };
            
        case ActionTypes.SET_LOADING:
            return {
                ...state,
                isLoading: action.payload,
            };
            
        case ActionTypes.SET_THEME:
            return {
                ...state,
                theme: action.payload,
            };
            
        case ActionTypes.SET_NOTIFICATION:
            return {
                ...state,
                notification: action.payload,
            };
            
        case ActionTypes.CLEAR_NOTIFICATION:
            return {
                ...state,
                notification: null,
            };
            
        default:
            return state;
    }
};

// ================== CONTEXT ==================

// Create the context
const AppContext = createContext(null);

// ================== PROVIDER ==================

/**
 * App Provider Component
 * Wraps the application and provides global state
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const AppProvider = ({ children }) => {
    // Use reducer for complex state management
    const [state, dispatch] = useReducer(appReducer, initialState);
    
    // ================== ACTIONS ==================
    
    /**
     * Set the current user
     * @param {Object} user - User object
     */
    const setUser = (user) => {
        dispatch({ type: ActionTypes.SET_USER, payload: user });
    };
    
    /**
     * Log out the current user
     */
    const logout = () => {
        localStorage.removeItem('authToken');
        dispatch({ type: ActionTypes.LOGOUT });
    };
    
    /**
     * Set loading state
     * @param {boolean} isLoading - Loading state
     */
    const setLoading = (isLoading) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: isLoading });
    };
    
    /**
     * Set theme
     * @param {string} theme - Theme name ('light' or 'dark')
     */
    const setTheme = (theme) => {
        dispatch({ type: ActionTypes.SET_THEME, payload: theme });
    };
    
    /**
     * Show a notification
     * @param {Object} notification - Notification object { type, message }
     */
    const showNotification = (notification) => {
        dispatch({ type: ActionTypes.SET_NOTIFICATION, payload: notification });
        
        // Auto-clear notification after 5 seconds
        setTimeout(() => {
            dispatch({ type: ActionTypes.CLEAR_NOTIFICATION });
        }, 5000);
    };
    
    /**
     * Clear the current notification
     */
    const clearNotification = () => {
        dispatch({ type: ActionTypes.CLEAR_NOTIFICATION });
    };
    
    // Context value
    const value = {
        // State
        ...state,
        
        // Actions
        setUser,
        logout,
        setLoading,
        setTheme,
        showNotification,
        clearNotification,
    };
    
    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

// ================== CUSTOM HOOK ==================

/**
 * useApp Hook
 * Custom hook to access the App context
 * 
 * @returns {Object} Context value
 * @throws {Error} If used outside of AppProvider
 */
export const useApp = () => {
    const context = useContext(AppContext);
    
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    
    return context;
};

export default AppContext;

