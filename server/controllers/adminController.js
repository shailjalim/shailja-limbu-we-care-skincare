const User = require('../models/User');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Content = require('../models/Content');
const Consultation = require('../models/Consultation');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password -resetPasswordToken -resetPasswordExpire');
        res.status(200).json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while fetching users' });
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const targetRole = role === 'admin' ? 'admin' : role === 'user' ? 'user' : role;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!['user', 'admin'].includes(targetRole)) {
            return res.status(400).json({ success: false, message: 'Invalid role' });
        }

        if (targetRole === 'admin' && user.role !== 'admin') {
            const existingAdmin = await User.findOne({ role: 'admin' });
            if (existingAdmin) {
                return res.status(400).json({ success: false, message: 'Only one admin account is allowed' });
            }
        }

        if (targetRole === 'user' && user.role === 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                return res.status(400).json({ success: false, message: 'Cannot demote the only admin account' });
            }
        }

        user.role = targetRole;
        await user.save();

        res.status(200).json({ success: true, user: { _id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while updating user role' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.role === 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                return res.status(400).json({ success: false, message: 'Cannot delete the only admin account' });
            }
        }

        await user.deleteOne();
        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while deleting user',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

exports.getAdminDashboardStats = async (req, res) => {
    try {
        const [userCount, productCount, reviewCount, contentCount, consultationCount] = await Promise.all([
            User.countDocuments(),
            Product.countDocuments(),
            Review.countDocuments(),
            Content.countDocuments(),
            Consultation.countDocuments(),
        ]);

        res.status(200).json({
            success: true,
            stats: {
                users: userCount,
                products: productCount,
                reviews: reviewCount,
                articles: contentCount,
                consultations: consultationCount,
                totalUsers: userCount,
                totalProducts: productCount,
                totalArticles: contentCount,
                totalConsultations: consultationCount,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while fetching dashboard stats' });
    }
};
