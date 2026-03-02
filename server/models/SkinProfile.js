/**
 * SkinProfile Model
 * 
 * Defines the schema for user skin profile documents in MongoDB.
 * Each user can have only ONE skin profile (enforced by unique user reference).
 * Stores skin type, concerns, allergies, and skincare goals.
 * 
 * @module models/SkinProfile
 */

const mongoose = require('mongoose');

/**
 * SkinProfile Schema Definition
 * 
 * Fields:
 * - user: Reference to the User who owns this profile (unique, one profile per user)
 * - skinType: User's skin type (required, from predefined options)
 * - concerns: Array of skin concerns (e.g., acne, wrinkles, dark spots)
 * - allergies: Array of known allergies to skincare ingredients
 * - goals: Array of skincare goals the user wants to achieve
 */
const skinProfileSchema = new mongoose.Schema(
    {
        // Reference to the User model - ensures one profile per user
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User reference is required'],
            unique: true, // Enforces one profile per user at database level
        },

        // User's skin type - required field with predefined options
        skinType: {
            type: String,
            enum: {
                values: ['oily', 'dry', 'combination', 'normal', 'sensitive'],
                message: 'Skin type must be one of: oily, dry, combination, normal, sensitive',
            },
            required: [true, 'Please select your skin type'],
        },

        // Array of skin concerns (optional, defaults to empty array)
        concerns: {
            type: [String],
            default: [],
        },

        // Array of known allergies (optional, defaults to empty array)
        allergies: {
            type: [String],
            default: [],
        },

        // Array of skincare goals (optional, defaults to empty array)
        goals: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields automatically
    }
);

/**
 * Index for faster queries by user
 * The unique constraint on 'user' field also creates an index
 */
skinProfileSchema.index({ user: 1 });

/**
 * Transform Output
 * 
 * Removes internal fields when converting to JSON for API responses.
 */
skinProfileSchema.methods.toJSON = function () {
    const profile = this.toObject();
    delete profile.__v;
    return profile;
};

// Create and export the SkinProfile model
const SkinProfile = mongoose.model('SkinProfile', skinProfileSchema);

module.exports = SkinProfile;
