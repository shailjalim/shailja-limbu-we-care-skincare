const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const crypto = require('crypto');

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

const ESEWA_MERCHANT_ID = process.env.ESEWA_MERCHANT_ID || 'EPAYTEST';
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q';
const ESEWA_PAYMENT_URL = process.env.ESEWA_PAYMENT_URL || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
const ESEWA_VERIFY_URL = process.env.ESEWA_VERIFY_URL || 'https://rc.esewa.com.np/api/epay/transaction/status/';
const FRONTEND_BASE_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const SIGNED_FIELD_NAMES = 'total_amount,transaction_uuid,product_code';

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

  user.subscriptionStatus = 'premium';
  user.subscriptionPlan = plan;
  user.subscriptionExpires = expiryDate;
};

const createEsewaSignature = (message) => {
  return crypto
    .createHmac('sha256', ESEWA_SECRET_KEY)
    .update(message)
    .digest('base64');
};

const parseEsewaAmount = (value) => {
  const parsed = Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : NaN;
};

const activateVerifiedPayment = async (payment, refId, verificationRaw) => {
  const user = await User.findById(payment.userId);
  if (!user) {
    return { ok: false, status: 404, payload: { success: false, message: 'User not found' } };
  }

  const startDate = new Date();
  const expiryDate = getExpiryDateFromPlan(payment.plan);

  applySubscriptionToUser(user, payment.plan, startDate, expiryDate);
  await user.save();

  await Subscription.create({
    user: user._id,
    plan: payment.plan,
    status: 'active',
    paymentMethod: 'eSewa',
    amount: payment.amount,
    transactionId: String(refId),
    startDate,
    endDate: expiryDate,
  });

  payment.status = 'verified';
  payment.refId = String(refId);
  payment.verificationRaw = verificationRaw;
  await payment.save();

  return {
    ok: true,
    payload: {
      success: true,
      message: 'Payment verified and subscription activated',
      plan: payment.plan,
      expiryDate,
    },
  };
};

exports.initiateEsewaPayment = async (req, res) => {
  try {
    const { plan } = req.body;

    if (!plan || !PLAN_AMOUNTS[plan]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan. Allowed plans: monthly, half-yearly, yearly',
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const pid = `order_${Date.now()}_${String(Math.random()).slice(2, 8)}`;
    const amount = PLAN_AMOUNTS[plan];
    const totalAmount = Number(amount).toFixed(2);

    await Payment.create({
      userId: user._id,
      pid,
      amount,
      plan,
      status: 'pending',
      gateway: 'esewa',
    });

    const successUrl = `${FRONTEND_BASE_URL}/payment-success`;
    const failureUrl = `${FRONTEND_BASE_URL}/payment-failure`;
    const signatureMessage = `total_amount=${totalAmount},transaction_uuid=${pid},product_code=${ESEWA_MERCHANT_ID}`;
    const signature = createEsewaSignature(signatureMessage);

    return res.status(200).json({
      success: true,
      paymentUrl: ESEWA_PAYMENT_URL,
      payload: {
        amount: String(amount),
        tax_amount: '0',
        total_amount: totalAmount,
        transaction_uuid: pid,
        product_code: ESEWA_MERCHANT_ID,
        product_service_charge: '0',
        product_delivery_charge: '0',
        success_url: successUrl,
        failure_url: failureUrl,
        signed_field_names: SIGNED_FIELD_NAMES,
        signature,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error initiating eSewa payment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.verifyEsewaPayment = async (req, res) => {
  try {
    const { data, pid, amount, refId } = req.body;

    if (data) {
      let decoded;
      try {
        const normalizedData = String(data).replace(/ /g, '+').trim();
        decoded = JSON.parse(Buffer.from(normalizedData, 'base64').toString('utf-8'));
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid eSewa callback payload',
        });
      }

      const transactionUuid = decoded.transaction_uuid;
      const totalAmountRaw = decoded.total_amount;
      const status = decoded.status;
      const transactionCode = decoded.transaction_code;
      const signedFieldNames = decoded.signed_field_names;
      const signature = decoded.signature;

      if (!transactionUuid || !totalAmountRaw || !status || !transactionCode || !signedFieldNames || !signature) {
        return res.status(400).json({
          success: false,
          message: 'Missing eSewa callback parameters',
        });
      }

      const payment = await Payment.findOne({ pid: transactionUuid, userId: req.user._id });
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment request not found',
        });
      }

      if (payment.status === 'verified') {
        return res.status(200).json({
          success: true,
          message: 'Payment already verified',
          plan: payment.plan,
        });
      }

      const names = String(signedFieldNames)
        .split(',')
        .map((field) => field.trim())
        .filter(Boolean);
      const signedMessage = names.map((field) => `${field}=${decoded[field] ?? ''}`).join(',');
      const expectedSignature = createEsewaSignature(signedMessage);

      if (expectedSignature !== signature) {
        payment.status = 'failed';
        payment.verificationRaw = 'Signature mismatch';
        await payment.save();

        return res.status(400).json({
          success: false,
          message: 'Invalid eSewa signature',
        });
      }

      const receivedAmount = parseEsewaAmount(totalAmountRaw);
      if (!Number.isFinite(receivedAmount) || Number(payment.amount) !== receivedAmount) {
        payment.status = 'failed';
        payment.verificationRaw = 'Amount mismatch';
        await payment.save();

        return res.status(400).json({
          success: false,
          message: 'Amount mismatch for payment verification',
        });
      }

      if (String(status).toUpperCase() !== 'COMPLETE') {
        payment.status = 'failed';
        payment.refId = String(transactionCode);
        payment.verificationRaw = JSON.stringify(decoded);
        await payment.save();

        return res.status(400).json({
          success: false,
          message: 'Payment not completed in eSewa',
        });
      }

      const verifyUrl = `${ESEWA_VERIFY_URL}?product_code=${encodeURIComponent(ESEWA_MERCHANT_ID)}&total_amount=${encodeURIComponent(totalAmountRaw)}&transaction_uuid=${encodeURIComponent(transactionUuid)}`;
      const verificationResponse = await fetch(verifyUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!verificationResponse.ok) {
        payment.status = 'failed';
        payment.refId = String(transactionCode);
        payment.verificationRaw = `Status verification failed with ${verificationResponse.status}`;
        await payment.save();

        return res.status(400).json({
          success: false,
          message: 'Unable to verify payment status with eSewa',
        });
      }

      const verificationJson = await verificationResponse.json();
      const verificationStatus = String(verificationJson?.status || '').toUpperCase();
      if (verificationStatus !== 'COMPLETE') {
        payment.status = 'failed';
        payment.refId = String(transactionCode);
        payment.verificationRaw = JSON.stringify(verificationJson);
        await payment.save();

        return res.status(400).json({
          success: false,
          message: 'Payment status is not complete',
        });
      }

      const result = await activateVerifiedPayment(payment, transactionCode, JSON.stringify(verificationJson));
      if (!result.ok) {
        return res.status(result.status).json(result.payload);
      }

      return res.status(200).json(result.payload);
    }

    if (pid && (!amount || !refId)) {
      const payment = await Payment.findOne({ pid, userId: req.user._id });
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment request not found',
        });
      }

      if (payment.status === 'verified') {
        return res.status(200).json({
          success: true,
          message: 'Payment already verified',
          plan: payment.plan,
        });
      }

      const totalAmountRaw = Number(payment.amount).toFixed(2);
      const verifyUrl = `${ESEWA_VERIFY_URL}?product_code=${encodeURIComponent(ESEWA_MERCHANT_ID)}&total_amount=${encodeURIComponent(totalAmountRaw)}&transaction_uuid=${encodeURIComponent(pid)}`;
      const verificationResponse = await fetch(verifyUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!verificationResponse.ok) {
        payment.status = 'failed';
        payment.verificationRaw = `Status verification failed with ${verificationResponse.status}`;
        await payment.save();

        return res.status(400).json({
          success: false,
          message: 'Unable to verify payment status with eSewa',
        });
      }

      const verificationJson = await verificationResponse.json();
      const verificationStatus = String(verificationJson?.status || '').toUpperCase();
      if (verificationStatus !== 'COMPLETE') {
        payment.status = 'failed';
        payment.verificationRaw = JSON.stringify(verificationJson);
        await payment.save();

        return res.status(400).json({
          success: false,
          message: 'Payment status is not complete',
        });
      }

      const transactionCode = String(verificationJson?.transaction_code || pid);
      const result = await activateVerifiedPayment(payment, transactionCode, JSON.stringify(verificationJson));
      if (!result.ok) {
        return res.status(result.status).json(result.payload);
      }

      return res.status(200).json(result.payload);
    }

    if (!pid || !amount || !refId) {
      return res.status(400).json({
        success: false,
        message: 'data or pid, amount and refId are required',
      });
    }

    const payment = await Payment.findOne({ pid, userId: req.user._id });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment request not found',
      });
    }

    if (payment.status === 'verified') {
      return res.status(200).json({
        success: true,
        message: 'Payment already verified',
        plan: payment.plan,
      });
    }

    const receivedAmount = Number(amount);
    if (!Number.isFinite(receivedAmount) || Number(payment.amount) !== receivedAmount) {
      payment.status = 'failed';
      payment.verificationRaw = 'Amount mismatch';
      await payment.save();

      return res.status(400).json({
        success: false,
        message: 'Amount mismatch for payment verification',
      });
    }

    const verificationPayload = new URLSearchParams({
      amt: String(receivedAmount),
      rid: String(refId),
      pid: String(pid),
      scd: ESEWA_MERCHANT_ID,
    });

    const verificationResponse = await fetch(ESEWA_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: verificationPayload.toString(),
    });

    if (!verificationResponse.ok) {
      payment.status = 'failed';
      payment.refId = String(refId);
      payment.verificationRaw = `Verification request failed with status ${verificationResponse.status}`;
      await payment.save();

      return res.status(400).json({
        success: false,
        message: 'Unable to verify payment with eSewa at the moment',
      });
    }

    const verificationText = await verificationResponse.text();

    if (!verificationText.includes('Success')) {
      payment.status = 'failed';
      payment.refId = String(refId);
      payment.verificationRaw = verificationText;
      await payment.save();

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
      });
    }

    const result = await activateVerifiedPayment(payment, refId, verificationText);
    if (!result.ok) {
      return res.status(result.status).json(result.payload);
    }

    return res.status(200).json(result.payload);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error verifying eSewa payment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
