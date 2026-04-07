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

const VALID_SKIN_TYPES = ['oily', 'dry', 'combination', 'normal', 'sensitive'];
const VALID_SENSITIVITY_LEVELS = ['low', 'medium', 'high'];
const VALID_SUN_EXPOSURE_LEVELS = ['low', 'medium', 'high'];
const VALID_WATER_INTAKE_LEVELS = ['low', 'adequate', 'high'];

const stringArrayValidator = {
    validator: (value) => Array.isArray(value) && value.every((item) => typeof item === 'string'),
    message: 'Value must be an array of strings',
};

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
                values: VALID_SKIN_TYPES,
                message: 'Skin type must be one of: oily, dry, combination, normal, sensitive',
            },
            required: [true, 'Please select your skin type'],
            lowercase: true,
            trim: true,
        },

        // Array of skin concerns (optional, defaults to empty array)
        concerns: {
            type: [String],
            default: [],
            validate: stringArrayValidator,
        },

        // Array of known allergies (optional, defaults to empty array)
        allergies: {
            type: [String],
            default: [],
            validate: stringArrayValidator,
        },

        // Calculated sensitivity level from quiz score
        sensitivityLevel: {
            type: String,
            enum: {
                values: VALID_SENSITIVITY_LEVELS,
                message: 'Sensitivity level must be one of: low, medium, high',
            },
            default: 'low',
            lowercase: true,
            trim: true,
        },

        // Lifestyle context for recommendation personalization
        lifestyle: {
            sunExposure: {
                type: String,
                enum: {
                    values: VALID_SUN_EXPOSURE_LEVELS,
                    message: 'Sun exposure must be one of: low, medium, high',
                },
                default: 'medium',
                lowercase: true,
                trim: true,
            },
            waterIntake: {
                type: String,
                enum: {
                    values: VALID_WATER_INTAKE_LEVELS,
                    message: 'Water intake must be one of: low, adequate, high',
                },
                default: 'adequate',
                lowercase: true,
                trim: true,
            },
        },

        // Routine completion metrics for progress tracking
        routineStats: {
            totalCompleted: {
                type: Number,
                default: 0,
                min: [0, 'totalCompleted cannot be negative'],
            },
            weeklyCompleted: {
                type: Number,
                default: 0,
                min: [0, 'weeklyCompleted cannot be negative'],
            },
            lastCompletedDate: {
                type: Date,
                default: null,
            },
        },

        // Most recent quiz completion date
        lastQuizDate: {
            type: Date,
            default: Date.now,
        },

        // Array of skincare goals (optional, defaults to empty array)
        goals: {
            type: [String],
            default: [],
            validate: stringArrayValidator,
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields automatically
    }
);

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
