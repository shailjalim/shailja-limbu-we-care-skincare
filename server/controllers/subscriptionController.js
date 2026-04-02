const Subscription = require('../models/Subscription');
const User = require('../models/User');

const calculateEndDate = (plan) => {
  const now = new Date();
  if (plan === 'yearly') {
    now.setFullYear(now.getFullYear() + 1);
  } else {
    now.setMonth(now.getMonth() + 1);
  }
  return now;
};

exports.createSubscription = async (req, res) => {
  try {
    const { plan, paymentMethod, transactionId } = req.body;
    if (!plan || !['monthly', 'yearly'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'Invalid subscription plan' });
    }

    const amount = plan === 'yearly' ? 120 : 12; // example pricing
    const endDate = calculateEndDate(plan);

    const subscription = await Subscription.create({
      user: req.user._id,
      plan,
      paymentMethod: paymentMethod || 'none',
      amount,
      transactionId: transactionId || `TXN-${Date.now()}`,
      endDate,
    });

    await User.findByIdAndUpdate(req.user._id, {
      subscriptionStatus: 'premium',
      subscriptionPlan: plan,
      subscriptionExpires: endDate,
    });

    res.status(201).json({ success: true, subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error creating subscription' });
  }
};

exports.getCurrentSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id, status: 'active' }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching subscription' });
  }
};

exports.cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status: 'cancelled' },
      { new: true }
    );
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    await User.findByIdAndUpdate(req.user._id, {
      subscriptionStatus: 'free',
      subscriptionPlan: 'none',
      subscriptionExpires: null,
    });

    res.status(200).json({ success: true, subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error cancelling subscription' });
  }
};
