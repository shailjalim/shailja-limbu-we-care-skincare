const User = require('../models/User');
const Review = require('../models/Review');
const Product = require('../models/Product');

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
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role' });
        }

        user.role = role;
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

        await user.remove();
        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while deleting user' });
    }
};

exports.getAdminDashboardStats = async (req, res) => {
    try {
        const [userCount, productCount, reviewCount] = await Promise.all([
            User.countDocuments(),
            Product.countDocuments(),
            Review.countDocuments(),
        ]);

        res.status(200).json({
            success: true,
            stats: {
                users: userCount,
                products: productCount,
                reviews: reviewCount,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while fetching dashboard stats' });
    }
};
