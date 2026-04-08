const Subscription = require('../models/Subscription');
const User = require('../models/User');

const PLAN_DAYS = {
  monthly: 30,
  'half-yearly': 180,
  yearly: 365,
};

const PLAN_AMOUNTS = {
  monthly: 12,
  'half-yearly': 60,
  yearly: 120,
};

const getExpiryDateFromPlan = (plan) => {
  const days = PLAN_DAYS[plan];
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};

const applySubscriptionToUser = (user, plan, startDate, expiryDate) => {
  user.subscription = {
    isActive: true,
    plan,
    startDate,
    expiryDate,
  };

  // Keep legacy fields synchronized for backward compatibility.
  user.subscriptionStatus = 'premium';
  user.subscriptionPlan = plan;
  user.subscriptionExpires = expiryDate;
};

const clearUserSubscription = (user) => {
  user.subscription = {
    isActive: false,
    plan: null,
    startDate: null,
    expiryDate: null,
  };

  // Keep legacy fields synchronized for backward compatibility.
  user.subscriptionStatus = 'free';
  user.subscriptionPlan = 'none';
  user.subscriptionExpires = null;
};

const buildStatusResponse = (subscription = {}) => {
  const expiryDate = subscription.expiryDate || null;
  const isActive = !!subscription.isActive;
  const daysRemaining = isActive && expiryDate
    ? Math.max(0, Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return {
    isActive,
    plan: subscription.plan || null,
    expiryDate,
    daysRemaining,
  };
};

const ensureActiveSubscriptionNotExpired = async (user) => {
  if (!user?.subscription?.isActive || !user.subscription.expiryDate) {
    return user;
  }

  if (Date.now() > new Date(user.subscription.expiryDate).getTime()) {
    clearUserSubscription(user);
    await user.save();

    await Subscription.updateMany(
      { user: user._id, status: 'active' },
      { $set: { status: 'expired' } }
    );
  }

  return user;
};

exports.activateSubscription = async (req, res) => {
  try {
    const { plan, paymentMethod, transactionId } = req.body;

    if (!plan || !PLAN_DAYS[plan]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan. Allowed plans: monthly, half-yearly, yearly',
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const startDate = new Date();
    const expiryDate = getExpiryDateFromPlan(plan);

    applySubscriptionToUser(user, plan, startDate, expiryDate);
    await user.save();

    await Subscription.create({
      user: user._id,
      plan,
      status: 'active',
      paymentMethod: paymentMethod || 'simulation',
      amount: PLAN_AMOUNTS[plan],
      transactionId: transactionId || `SIM-${Date.now()}`,
      startDate,
      endDate: expiryDate,
    });

    return res.status(200).json({
      success: true,
      message: 'Subscription activated',
      plan,
      expiryDate,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error creating subscription',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.getSubscriptionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await ensureActiveSubscriptionNotExpired(user);

    return res.status(200).json({
      success: true,
      ...buildStatusResponse(user.subscription || {}),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error fetching subscription status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.createSubscription = async (req, res) => {
  return exports.activateSubscription(req, res);
};

exports.getCurrentSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await ensureActiveSubscriptionNotExpired(user);

    const { isActive, plan, expiryDate, daysRemaining } = buildStatusResponse(user.subscription || {});

    const subscription = isActive
      ? {
          plan,
          status: 'active',
          startDate: user.subscription.startDate,
          endDate: expiryDate,
          daysRemaining,
        }
      : null;

    return res.status(200).json({ success: true, subscription });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error fetching subscription',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.cancelSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let subscription = null;
    if (req.params.id) {
      subscription = await Subscription.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        { status: 'cancelled' },
        { new: true }
      );
    }

    if (!subscription) {
      subscription = await Subscription.findOneAndUpdate(
        { user: req.user._id, status: 'active' },
        { status: 'cancelled' },
        { new: true, sort: { createdAt: -1 } }
      );
    }

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    clearUserSubscription(user);
    await user.save();

    return res.status(200).json({ success: true, subscription });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error cancelling subscription',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
