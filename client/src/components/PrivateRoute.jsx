/**
 * PrivateRoute Component
 * 
 * A wrapper component that protects routes requiring authentication.
 * Redirects unauthenticated users to the login page.
 * 
 * @module components/PrivateRoute
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../services/api';

/**
 * PrivateRoute Component
 * 
 * Checks if user is authenticated before rendering the protected content.
 * If not authenticated, redirects to login page with return URL.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Protected content to render
 * @returns {React.ReactNode} - Protected content or redirect
 * 
 * @example
 * <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
 */
const PrivateRoute = ({ children }) => {
    // Get current location for redirect after login
    const location = useLocation();

    // Check authentication status
    if (!isAuthenticated()) {
        // Redirect to login with the attempted URL for redirect after login
        return (
            <Navigate 
                to="/login" 
                state={{ from: location.pathname }} 
                replace 
            />
        );
    }

    // User is authenticated, render the protected content
    return children;
};

export default PrivateRoute;



