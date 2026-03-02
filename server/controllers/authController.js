/**
 * Authentication Controller
 * 
 * Handles user registration and login operations.
 * Generates JWT tokens for authenticated sessions.
 * 
 * @module controllers/authController
 */

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail, generateResetPasswordEmail } = require('../utils/sendEmail');

/**
 * Generate JWT Token
 * 
 * Creates a signed JWT token for user authentication.
 * 
 * @param {string} id - User's MongoDB ObjectId
 * @returns {string} - Signed JWT token
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};

/**
 * Format User Response
 * 
 * Formats the user data and token for API response.
 * 
 * @param {Object} user - User document
 * @param {string} token - JWT token
 * @returns {Object} - Formatted response object
 */
const formatUserResponse = (user, token) => {
    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        token,
    };
};

/**
 * Register User
 * 
 * @route   POST /api/auth/register
 * @desc    Register a new user account
 * @access  Public
 * 
 * @param {Object} req.body - { name, email, password }
 * @returns {Object} - User info with JWT token
 */
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // ============ VALIDATION ============

        // Check for required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields (name, email, password)',
            });
        }

        // Validate email format
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address',
            });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long',
            });
        }

        // ============ CHECK EXISTING USER ============

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'An account with this email already exists',
            });
        }

        // ============ CREATE USER ============

        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password,
        });

        // ============ GENERATE TOKEN & RESPOND ============

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            user: formatUserResponse(user, token),
        });

    } catch (error) {
        // Handle MongoDB duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'An account with this email already exists',
            });
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', '),
            });
        }

        // Handle other errors
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

/**
 * Login User
 * 
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return token
 * @access  Public
 * 
 * @param {Object} req.body - { email, password }
 * @returns {Object} - User info with JWT token
 */
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // ============ VALIDATION ============

        // Check for required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password',
            });
        }

        // ============ FIND USER ============

        // Include password field for comparison (excluded by default)
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        // ============ VERIFY PASSWORD ============

        const isPasswordMatch = await user.matchPassword(password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        // ============ GENERATE TOKEN & RESPOND ============

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: formatUserResponse(user, token),
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

/**
 * Get Current User
 * 
 * @route   GET /api/auth/me
 * @desc    Get currently logged in user
 * @access  Private
 * 
 * @returns {Object} - Current user info
 */
const getCurrentUser = async (req, res) => {
    try {
        // User is attached by auth middleware
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
            },
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

/**
 * Forgot Password
 * 
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 * 
 * @param {Object} req.body - { email }
 * @returns {Object} - Success message
 */
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // ============ VALIDATION ============

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email address',
            });
        }

        // ============ FIND USER ============

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Don't reveal if user exists or not for security
            return res.status(200).json({
                success: true,
                message: 'If an account exists with this email, a password reset link has been sent',
            });
        }

        // ============ GENERATE RESET TOKEN ============

        const resetToken = user.getResetPasswordToken();

        // Save user with reset token (skip validation)
        await user.save({ validateBeforeSave: false });

        // ============ CREATE RESET URL ============

        // Frontend reset password page URL
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

        // ============ SEND EMAIL ============

        try {
            const htmlMessage = generateResetPasswordEmail(user.name, resetUrl);

            const emailResult = await sendEmail({
                email: user.email,
                subject: 'WeCare - Password Reset Request',
                message: `You requested a password reset. Please go to: ${resetUrl}`,
                html: htmlMessage,
            });

            // Include preview URL for test emails (Ethereal)
            const responseData = {
                success: true,
                message: 'Password reset email sent successfully',
            };

            if (emailResult.previewUrl) {
                responseData.previewUrl = emailResult.previewUrl;
                console.log('📧 Email preview:', emailResult.previewUrl);
            }

            res.status(200).json(responseData);

        } catch (emailError) {
            // Log email error for debugging
            console.error('Email Error:', emailError.message);
            
            // If email fails, clear reset token from database
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({
                success: false,
                error: process.env.NODE_ENV === 'development' ? emailError.message : undefined,
                message: 'Email could not be sent. Please try again later.',
            });
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error during password reset request',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

/**
 * Reset Password
 * 
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using token
 * @access  Public
 * 
 * @param {Object} req.body - { token, password }
 * @returns {Object} - Success message with new token
 */
const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        // ============ VALIDATION ============

        if (!token || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide token and new password',
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long',
            });
        }

        // ============ HASH TOKEN & FIND USER ============

        // Hash the token from URL to compare with database
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find user with matching token and valid expiry
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        }).select('+resetPasswordToken +resetPasswordExpire');

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token',
            });
        }

        // ============ UPDATE PASSWORD ============

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        // ============ GENERATE NEW AUTH TOKEN ============

        const authToken = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Password reset successful',
            user: formatUserResponse(user, authToken),
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error during password reset',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getCurrentUser,
    forgotPassword,
    resetPassword,
};



