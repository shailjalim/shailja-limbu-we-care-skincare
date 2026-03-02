/**
 * Profile Controller
 * 
 * Handles all skin profile-related operations.
 * Provides endpoints for creating, updating, and retrieving user skin profiles.
 * 
 * @module controllers/profileController
 */

const SkinProfile = require('../models/SkinProfile');

/**
 * @desc    Create or Update Skin Profile
 * @route   POST /api/profile
 * @access  Private (requires authentication)
 * 
 * Logic:
 * - Extracts user ID from authenticated request (req.user._id)
 * - Checks if a profile already exists for this user
 * - If exists: Updates the existing profile with new data
 * - If not exists: Creates a new profile for the user
 * - Returns the created/updated profile
 */
const createOrUpdateProfile = async (req, res) => {
    try {
        // Extract user ID from authenticated request
        const userId = req.user._id;

        // Extract profile data from request body
        const { skinType, concerns, allergies, goals } = req.body;

        // ============ VALIDATION ============

        // Validate required field: skinType
        if (!skinType) {
            return res.status(400).json({
                success: false,
                message: 'Skin type is required',
            });
        }

        // Validate skinType is from allowed values
        const validSkinTypes = ['oily', 'dry', 'combination', 'normal', 'sensitive'];
        if (!validSkinTypes.includes(skinType.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: `Invalid skin type. Must be one of: ${validSkinTypes.join(', ')}`,
            });
        }

        // ============ BUILD PROFILE DATA ============

        const profileData = {
            user: userId,
            skinType: skinType.toLowerCase(),
            concerns: concerns || [],
            allergies: allergies || [],
            goals: goals || [],
        };

        // ============ CHECK FOR EXISTING PROFILE ============

        let profile = await SkinProfile.findOne({ user: userId });

        if (profile) {
            // ============ UPDATE EXISTING PROFILE ============

            profile = await SkinProfile.findOneAndUpdate(
                { user: userId },
                {
                    skinType: profileData.skinType,
                    concerns: profileData.concerns,
                    allergies: profileData.allergies,
                    goals: profileData.goals,
                },
                { 
                    new: true, // Return the updated document
                    runValidators: true, // Run schema validators on update
                }
            );

            return res.status(200).json({
                success: true,
                message: 'Skin profile updated successfully',
                profile,
            });
        }

        // ============ CREATE NEW PROFILE ============

        profile = await SkinProfile.create(profileData);

        return res.status(201).json({
            success: true,
            message: 'Skin profile created successfully',
            profile,
        });

    } catch (error) {
        // Handle duplicate key error (shouldn't happen due to upsert logic, but just in case)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'A profile already exists for this user. Use update instead.',
            });
        }

        // Handle validation errors from Mongoose
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', '),
            });
        }

        // Handle other server errors
        return res.status(500).json({
            success: false,
            message: 'Server error while processing skin profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

/**
 * @desc    Get Current User's Skin Profile
 * @route   GET /api/profile/me
 * @access  Private (requires authentication)
 * 
 * Logic:
 * - Extracts user ID from authenticated request (req.user._id)
 * - Queries database for the user's skin profile
 * - Returns 404 if no profile found
 * - Returns the profile if found
 */
const getMyProfile = async (req, res) => {
    try {
        // Extract user ID from authenticated request
        const userId = req.user._id;

        // ============ FIND USER'S PROFILE ============

        const profile = await SkinProfile.findOne({ user: userId });

        // Check if profile exists
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Skin profile not found. Please create your profile first.',
            });
        }

        // ============ RETURN PROFILE ============

        return res.status(200).json({
            success: true,
            message: 'Skin profile retrieved successfully',
            profile,
        });

    } catch (error) {
        // Handle server errors
        return res.status(500).json({
            success: false,
            message: 'Server error while retrieving skin profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

// Export controller functions
module.exports = {
    createOrUpdateProfile,
    getMyProfile,
};
