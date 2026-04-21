const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const {
    sendPasswordResetEmail,
    sendWelcomeEmail,
} = require('../utils/emailService');

const MAX_NAME_LENGTH = 50;

const sanitizeName = (value) => String(value || '').replace(/\s+/g, ' ').trim();

const deleteLocalUpload = (relativePath) => {
    if (!relativePath || typeof relativePath !== 'string' || !relativePath.startsWith('/uploads/')) {
        return;
    }

    const cleanedRelativePath = relativePath.replace(/^\/uploads\/?/, '');
    const absolutePath = path.join(__dirname, '..', 'uploads', cleanedRelativePath);

    try {
        if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
        }
    } catch (error) {
        console.warn('Failed to remove local upload:', error.message);
    }
};
const generateToken = (user) => {
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};
const formatUserResponse = (user, token) => {
    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage || null,
        isActive: user.isActive !== false,
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
        const { name, email, password, role } = req.body;
        const requestedRole = role === 'admin' ? 'admin' : 'user';

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

        if (requestedRole === 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Only one admin account is allowed',
                });
            }
        }

        // ============ CREATE USER ============

        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password,
            role: requestedRole,
        });

        try {
            await sendWelcomeEmail(user.email, user.name);
        } catch (emailError) {
            console.error('Welcome email failed:', emailError.message);
        }

        // ============ GENERATE TOKEN & RESPOND ============

        const token = generateToken(user);

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

        if (user.isActive === false) {
            return res.status(403).json({
                success: false,
                message: 'This account has been deactivated. Please contact support if you need help.',
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

    
        const token = generateToken(user);

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
                profileImage: user.profileImage || null,
                isActive: user.isActive !== false,
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
 * Get Account Profile
 *
 * @route   GET /api/auth/account
 * @desc    Get current account profile details
 * @access  Private
 */
const getAccountProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        return res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage || null,
                isActive: user.isActive !== false,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error while retrieving account profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

/**
 * Update Basic Account Profile
 *
 * @route   PATCH /api/auth/account
 * @desc    Update editable account fields (full name)
 * @access  Private
 */
const updateAccountProfile = async (req, res) => {
    try {
        const name = sanitizeName(req.body?.name);

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Full name is required',
            });
        }

        if (name.length > MAX_NAME_LENGTH) {
            return res.status(400).json({
                success: false,
                message: `Full name cannot exceed ${MAX_NAME_LENGTH} characters`,
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        user.name = name;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Account profile updated successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage || null,
                isActive: user.isActive !== false,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error while updating account profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

/**
 * Change Account Password
 *
 * @route   PATCH /api/auth/account/password
 * @desc    Change password using current password verification
 * @access  Private
 */
const changeAccountPassword = async (req, res) => {
    try {
        const currentPassword = String(req.body?.currentPassword || '');
        const newPassword = String(req.body?.newPassword || '');

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required',
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long',
            });
        }

        const user = await User.findById(req.user.id).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        const isCurrentPasswordValid = await user.matchPassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect',
            });
        }

        user.password = newPassword;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Password changed successfully',
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error while changing password',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

/**
 * Upload or Change Profile Image
 *
 * @route   PATCH /api/auth/account/profile-image
 * @desc    Upload a profile image and replace previous one if exists
 * @access  Private
 */
const uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Profile image file is required',
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        const previousImage = user.profileImage;
        user.profileImage = `/uploads/profiles/${req.file.filename}`;
        await user.save();

        if (previousImage && previousImage !== user.profileImage) {
            deleteLocalUpload(previousImage);
        }

        return res.status(200).json({
            success: true,
            message: 'Profile image updated successfully',
            profileImage: user.profileImage,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error while updating profile image',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

/**
 * Remove Profile Image
 *
 * @route   DELETE /api/auth/account/profile-image
 * @desc    Remove current profile image
 * @access  Private
 */
const removeProfileImage = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        const previousImage = user.profileImage;
        user.profileImage = null;
        await user.save();

        deleteLocalUpload(previousImage);

        return res.status(200).json({
            success: true,
            message: 'Profile image removed successfully',
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error while removing profile image',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

/**
 * Deactivate Account
 *
 * @route   DELETE /api/auth/account
 * @desc    Soft-delete account by deactivating user login access
 * @access  Private
 */
const deactivateAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        user.isActive = false;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });

        return res.status(200).json({
            success: true,
            message: 'Account deactivated successfully',
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error while deactivating account',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

/**
 * Get Admin Registration Status
 *
 * @route   GET /api/auth/admin-status
 * @desc    Check if an admin account already exists
 * @access  Public
 *
 * @returns {Object} - Admin existence status
 */
const getAdminRegistrationStatus = async (req, res) => {
    try {
        const adminExists = (await User.countDocuments({ role: 'admin' })) > 0;

        return res.status(200).json({
            success: true,
            adminExists,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error while checking admin registration status',
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

        // ============ SEND EMAIL ============

        try {
            await sendPasswordResetEmail(user.email, resetToken, user.name);

            return res.status(200).json({
                success: true,
                message: 'If an account exists with this email, a password reset link has been sent',
            });

        } catch (emailError) {
            console.error('Password reset email failed:', emailError.message);
            
            // If email fails, clear reset token from database
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(200).json({
                success: true,
                message: 'If an account exists with this email, a password reset link has been sent',
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

        const authToken = generateToken(user);

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
    getAccountProfile,
    updateAccountProfile,
    changeAccountPassword,
    uploadProfileImage,
    removeProfileImage,
    deactivateAccount,
    getAdminRegistrationStatus,
    forgotPassword,
    resetPassword,
};



