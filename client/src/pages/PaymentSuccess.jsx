import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { verifyEsewaPayment } from '../services/api';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [message, setMessage] = useState('Verifying payment with eSewa...');

    useEffect(() => {
        const verifyPayment = async () => {
            const rawDataMatch = window.location.href.match(/[?&]data=([^&#]+)/i);
            const encodedData = rawDataMatch
                ? decodeURIComponent(rawDataMatch[1]).replace(/ /g, '+')
                : (searchParams.get('data') || '').replace(/ /g, '+');
            const transactionUuid =
                searchParams.get('transaction_uuid') ||
                searchParams.get('pid') ||
                searchParams.get('oid');
            const totalAmount = searchParams.get('total_amount') || searchParams.get('amt');
            const transactionCode = searchParams.get('transaction_code') || searchParams.get('refId');

            if (!encodedData && !transactionUuid) {
                setSuccess(false);
                setMessage('Missing eSewa callback parameters. Please try again.');
                setLoading(false);
                return;
            }

            try {
                const response = await verifyEsewaPayment({
                    data: encodedData,
                    pid: transactionUuid,
                    amount: totalAmount,
                    refId: transactionCode,
                });

                setSuccess(true);
                setMessage(response?.message || 'Payment verified and subscription activated.');
            } catch (error) {
                setSuccess(false);
                setMessage(error?.message || 'Payment verification failed.');
            } finally {
                setLoading(false);
            }
        };

        verifyPayment();
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-xl rounded-3xl border border-gray-200 bg-white p-8 shadow-sm text-center">
                {loading ? (
                    <div>
                        <div className="w-12 h-12 mx-auto border-4 border-pink-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-700 mt-4">{message}</p>
                    </div>
                ) : (
                    <>
                        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${success ? 'bg-green-100' : 'bg-red-100'}`}>
                            {success ? (
                                <svg className="w-9 h-9 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-9 h-9 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mt-4">{success ? 'Payment Successful' : 'Verification Failed'}</h1>
                        <p className="text-gray-600 mt-3">{message}</p>
                        <div className="mt-6 flex flex-wrap justify-center gap-3">
                            <Link to="/subscription" className="px-5 py-2 rounded-full bg-pink-600 text-white hover:bg-pink-700">
                                Back to Subscription
                            </Link>
                            <Link to="/dashboard" className="px-5 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50">
                                Go to Dashboard
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccess;
