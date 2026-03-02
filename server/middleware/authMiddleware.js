/**
 * Authentication Middleware
 * 
 * Middleware functions for protecting routes and verifying JWT tokens.
 * 
 * @module middleware/authMiddleware
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect Middleware
 * 
 * Verifies the JWT token from the Authorization header.
 * Attaches the authenticated user to the request object.
 * 
 * Usage: Add as middleware to any route that requires authentication
 * 
 * @example
 * router.get('/profile', protect, getProfile);
 */
const protect = async (req, res, next) => {
    try {
        let token;

        // ============ EXTRACT TOKEN ============

        // Check for token in Authorization header (Bearer token)
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            // Extract token from "Bearer <token>"
            token = req.headers.authorization.split(' ')[1];
        }

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, no token provided',
            });
        }

        // ============ VERIFY TOKEN ============

        try {
            // Verify token and decode payload
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // ============ ATTACH USER TO REQUEST ============

            // Find user by ID from token payload (exclude password)
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Not authorized, user not found',
                });
            }

            // Attach user to request object for use in route handlers
            req.user = user;

            next();

        } catch (error) {
            // Handle specific JWT errors
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: 'Not authorized, invalid token',
                });
            }

            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Not authorized, token expired',
                });
            }

            throw error;
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error during authentication',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

/**
 * Authorize Middleware
 * 
 * Restricts access to specific roles.
 * Must be used after protect middleware.
 * 
 * @param {...string} roles - Allowed roles
 * @returns {Function} - Middleware function
 * 
 * @example
 * router.delete('/user/:id', protect, authorize('admin'), deleteUser);
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        // Check if user's role is in the allowed roles
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Role '${req.user.role}' is not authorized to access this resource`,
            });
        }
        next();
    };
};

module.exports = {
    protect,
    authorize,
};



