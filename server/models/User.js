/**
 * User Model
 * 
 * Defines the schema for user documents in MongoDB.
 * Includes password hashing and comparison methods.
 * 
 * @module models/User
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * User Schema Definition
 * 
 * Fields:
 * - name: User's full name
 * - email: Unique email address (stored in lowercase)
 * - password: Hashed password (minimum 6 characters)
 * - role: User role for authorization (default: "user")
 */
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide your name'],
            trim: true,
            maxlength: [50, 'Name cannot exceed 50 characters'],
        },
        email: {
            type: String,
            required: [true, 'Please provide your email'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email address',
            ],
        },
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false, // Don't include password in queries by default
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        resetPasswordToken: {
            type: String,
            select: false,
        },
        resetPasswordExpire: {
            type: Date,
            select: false,
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields
    }
);

/**
 * Pre-save Middleware
 * 
 * Automatically hashes the password before saving to database.
 * Only runs if password field has been modified.
 */
userSchema.pre('save', async function (next) {
    // Only hash if password is modified (or new)
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // Generate salt with cost factor of 10
        const salt = await bcrypt.genSalt(10);
        
        // Hash the password with the salt
        this.password = await bcrypt.hash(this.password, salt);
        
        next();
    } catch (error) {
        next(error);
    }
});

/**
 * Compare Password Method
 * 
 * Compares a candidate password with the stored hashed password.
 * 
 * @param {string} candidatePassword - The password to compare
 * @returns {Promise<boolean>} - True if passwords match, false otherwise
 */
userSchema.methods.matchPassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Transform Output
 * 
 * Removes sensitive fields when converting to JSON.
 */
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    delete user.__v;
    return user;
};

/**
 * Generate Password Reset Token
 * 
 * Creates a random token for password reset.
 * Hashes the token and stores it in the database.
 * Returns the unhashed token to be sent via email.
 * 
 * @returns {string} - Unhashed reset token
 */
userSchema.methods.getResetPasswordToken = function () {
    // Generate random token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire time (10 minutes)
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

// Create and export the User model
const User = mongoose.model('User', userSchema);

module.exports = User;



