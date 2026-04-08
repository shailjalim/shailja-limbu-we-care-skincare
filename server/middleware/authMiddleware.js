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

/**
 * User Only Middleware
 * 
 * Restricts access to regular users only.
 * Blocks admin users from accessing user-only features.
 * Must be used after protect middleware.
 * 
 * Usage: Add as middleware to user-only routes
 * 
 * @example
 * router.post('/', protect, userOnly, createRoutine);
 */
const userOnly = (req, res, next) => {
    if (req.user.role === 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin accounts cannot access user features',
        });
    }
    next();
};

/**
 * Check Subscription Middleware
 *
 * Ensures active subscription is still valid and auto-expires outdated subscriptions.
 * Must be used after protect middleware.
 */
const checkSubscription = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, user not found on request',
            });
        }

        const subscription = req.user.subscription || {};
        if (subscription.isActive && subscription.expiryDate) {
            const isExpired = Date.now() > new Date(subscription.expiryDate).getTime();

            if (isExpired) {
                req.user.subscription = {
                    isActive: false,
                    plan: null,
                    startDate: null,
                    expiryDate: null,
                };

                // Keep legacy fields synchronized.
                req.user.subscriptionStatus = 'free';
                req.user.subscriptionPlan = 'none';
                req.user.subscriptionExpires = null;

                await req.user.save();
            }
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error while checking subscription',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

/**
 * Premium Only Middleware
 *
 * Blocks access when user does not have an active premium subscription.
 * Must be used after checkSubscription middleware.
 */
const premiumOnly = (req, res, next) => {
    if (!req.user?.subscription?.isActive) {
        return res.status(403).json({
            success: false,
            message: 'Premium subscription required',
        });
    }

    next();
};

// Aliases for clearer role-based middleware naming
const verifyToken = protect;
const adminOnly = authorize('admin');

module.exports = {
    protect,
    authorize,
    verifyToken,
    adminOnly,
    userOnly,
    checkSubscription,
    premiumOnly,
};



