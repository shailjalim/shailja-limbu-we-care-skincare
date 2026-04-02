import React, { useEffect, useState } from 'react';
import { subscribeToPlan, getCurrentSubscription, cancelSubscription } from '../services/api';

const Subscription = () => {
    const [subscription, setSubscription] = useState(null);
    const [plan, setPlan] = useState('monthly');
    const [paymentMethod, setPaymentMethod] = useState('eSewa');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const loadSubscription = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await getCurrentSubscription();
            setSubscription(response.subscription || null);
        } catch (err) {
            setError(err.message || 'Unable to load subscription');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSubscription();
    }, []);

    const handleSubscribe = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            await subscribeToPlan(plan, paymentMethod);
            setMessage('Subscription activated successfully.');
            loadSubscription();
        } catch (err) {
            setError(err.message || 'Unable to activate subscription');
        }
    };

    const handleCancel = async () => {
        if (!subscription) return;
        setError('');
        setMessage('');
        try {
            await cancelSubscription(subscription._id);
            setMessage('Subscription cancelled successfully.');
            loadSubscription();
        } catch (err) {
            setError(err.message || 'Unable to cancel subscription');
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-10">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-pink-600">Subscription Plans</h1>
                <p className="text-gray-600 mt-2">Choose a premium plan for extra skincare benefits and consultation access.</p>
            </div>
            {error && <div className="mb-4 rounded-3xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
            {message && <div className="mb-4 rounded-3xl border border-green-200 bg-green-50 p-4 text-green-700">{message}</div>}
            <div className="grid gap-8 lg:grid-cols-2">
                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Current Subscription</h2>
                    {loading ? (
                        <p className="text-gray-500">Loading subscription...</p>
                    ) : subscription ? (
                        <div className="space-y-4">
                            <div className="rounded-3xl bg-pink-50 p-4">
                                <p className="text-sm text-gray-600">Plan</p>
                                <p className="text-xl font-semibold text-pink-700">{subscription.plan}</p>
                            </div>
                            <div className="rounded-3xl bg-gray-50 p-4">
                                <p className="text-sm text-gray-600">Status</p>
                                <p className="text-lg font-semibold text-gray-900 capitalize">{subscription.status}</p>
                            </div>
                            <div className="rounded-3xl bg-gray-50 p-4">
                                <p className="text-sm text-gray-600">Expires</p>
                                <p className="text-lg font-semibold text-gray-900">{new Date(subscription.endDate).toLocaleDateString()}</p>
                            </div>
                            <button
                                onClick={handleCancel}
                                className="w-full rounded-3xl border border-red-300 bg-red-50 px-6 py-3 text-red-700 hover:bg-red-100 transition"
                            >
                                Cancel Subscription
                            </button>
                        </div>
                    ) : (
                        <div className="rounded-3xl bg-gray-50 p-6">
                            <p className="text-gray-500">No active subscription yet. Choose a plan to unlock premium features.</p>
                        </div>
                    )}
                </div>
                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Subscribe Now</h2>
                    <form onSubmit={handleSubscribe} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Plan</label>
                            <select
                                value={plan}
                                onChange={(e) => setPlan(e.target.value)}
                                className="w-full rounded-3xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-200"
                            >
                                <option value="monthly">Monthly - $12</option>
                                <option value="yearly">Yearly - $120</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full rounded-3xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-200"
                            >
                                <option value="eSewa">eSewa</option>
                                <option value="Khalti">Khalti</option>
                                <option value="Credit Card">Credit Card</option>
                            </select>
                        </div>
                        <button type="submit" className="w-full rounded-3xl bg-pink-600 px-6 py-3 text-white font-medium hover:bg-pink-700 transition">
                            Subscribe Now
                        </button>
                    </form>
                    <div className="mt-6 rounded-3xl bg-pink-50 p-4 text-sm text-pink-700">
                        Your subscription grants premium recommendations and dermatologist consultation access.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Subscription;
