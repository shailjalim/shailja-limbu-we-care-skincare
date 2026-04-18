import React, { useEffect, useState } from 'react';
import { getSubscriptionStatus, initiateEsewaPayment } from '../services/api';

const PLAN_OPTIONS = [
    { value: 'monthly', label: 'Monthly', days: 30 },
    { value: 'half-yearly', label: 'Half-Yearly', days: 180 },
    { value: 'yearly', label: 'Yearly', days: 365 },
];

const PLAN_AMOUNTS = {
    monthly: 12,
    'half-yearly': 60,
    yearly: 120,
};

const Subscription = () => {
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);
    const [plan, setPlan] = useState('monthly');
    const [loading, setLoading] = useState(true);
    const [activating, setActivating] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const loadSubscriptionStatus = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await getSubscriptionStatus();
            setSubscriptionStatus({
                isActive: !!response.isActive,
                plan: response.plan || null,
                expiryDate: response.expiryDate || null,
                daysRemaining: Number(response.daysRemaining || 0),
            });
        } catch (err) {
            setError(err.message || 'Unable to load subscription status');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSubscriptionStatus();
    }, []);

    const handleEsewaPayment = async (selectedPlan, selectedAmount) => {
        const pid = `order_${Date.now()}`;
        const response = await initiateEsewaPayment(selectedPlan);

        const payload = response?.payload || {};
        if (!response?.paymentUrl) {
            throw new Error('eSewa payment URL is not configured. Please contact support.');
        }

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = response.paymentUrl;

        const fields = {
            amount: payload.amount ?? selectedAmount,
            tax_amount: payload.tax_amount ?? 0,
            total_amount: payload.total_amount ?? selectedAmount,
            transaction_uuid: payload.transaction_uuid || pid,
            product_code: payload.product_code || payload.scd || 'EPAYTEST',
            product_service_charge: payload.product_service_charge ?? payload.psc ?? 0,
            product_delivery_charge: payload.product_delivery_charge ?? payload.pdc ?? 0,
            success_url: payload.success_url || payload.su || 'http://localhost:3000/payment-success',
            failure_url: payload.failure_url || payload.fu || 'http://localhost:3000/payment-failure',
            signed_field_names: payload.signed_field_names,
            signature: payload.signature,
        };

        Object.entries(fields).forEach(([key, value]) => {
            if (value === undefined || value === null || value === '') return;
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = String(value);
            form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        form.remove();
    };

    const handleActivate = async () => {
        setError('');
        setMessage('');
        setActivating(true);
        try {
            await handleEsewaPayment(plan, PLAN_AMOUNTS[plan]);
        } catch (err) {
            setError(err.message || 'Unable to activate subscription');
        } finally {
            setActivating(false);
        }
    };

    const activePlanLabel = PLAN_OPTIONS.find((item) => item.value === subscriptionStatus?.plan)?.label || subscriptionStatus?.plan;
    const isExpired = !!subscriptionStatus && !subscriptionStatus.isActive && !!subscriptionStatus.expiryDate;

    return (
        <div className="max-w-5xl mx-auto px-4 py-10">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-pink-600">Subscription Plans</h1>
                <p className="text-gray-600 mt-2">Choose a premium plan to unlock consultation access and personalized care.</p>
            </div>
            {error && <div className="mb-4 rounded-3xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
            {message && <div className="mb-4 rounded-3xl border border-green-200 bg-green-50 p-4 text-green-700">{message}</div>}
            {isExpired && <div className="mb-4 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-amber-800">Subscription expired. Please activate a new plan.</div>}
            <div className="grid gap-8 lg:grid-cols-2">
                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Current Subscription</h2>
                    {loading ? (
                        <p className="text-gray-500">Loading subscription...</p>
                    ) : subscriptionStatus?.isActive ? (
                        <div className="space-y-4">
                            <div className="rounded-3xl bg-pink-50 p-4">
                                <p className="text-sm text-gray-600">Plan</p>
                                <p className="text-xl font-semibold text-pink-700">{activePlanLabel}</p>
                            </div>
                            <div className="rounded-3xl bg-gray-50 p-4">
                                <p className="text-sm text-gray-600">Status</p>
                                <p className="text-lg font-semibold text-green-700">Premium Active</p>
                            </div>
                            <div className="rounded-3xl bg-gray-50 p-4">
                                <p className="text-sm text-gray-600">Expires</p>
                                <p className="text-lg font-semibold text-gray-900">{new Date(subscriptionStatus.expiryDate).toLocaleDateString()}</p>
                            </div>
                            <div className="rounded-3xl bg-gray-50 p-4">
                                <p className="text-sm text-gray-600">Days Remaining</p>
                                <p className="text-lg font-semibold text-gray-900">{subscriptionStatus.daysRemaining}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-3xl bg-gray-50 p-6">
                            <p className="text-gray-500">You are currently on a free plan.</p>
                        </div>
                    )}
                </div>
                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Upgrade to Premium</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Plan</label>
                            <select
                                value={plan}
                                onChange={(e) => setPlan(e.target.value)}
                                className="w-full rounded-3xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-200"
                            >
                                {PLAN_OPTIONS.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label} ({item.days} days)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="button"
                            onClick={handleActivate}
                            disabled={activating}
                            className="w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-pink-50 hover:border-pink-300 disabled:opacity-60"
                        >
                            {activating ? 'Redirecting to eSewa...' : 'Pay with eSewa'}
                        </button>
                    </div>
                    <div className="mt-6 rounded-3xl bg-pink-50 p-4 text-sm text-pink-700">
                        eSewa gateway verification is required to activate premium subscription.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Subscription;
