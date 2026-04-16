import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const PaymentFailure = () => {
    const [searchParams] = useSearchParams();
    const plan = searchParams.get('plan');

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-xl rounded-3xl border border-gray-200 bg-white p-8 shadow-sm text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="w-9 h-9 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mt-4">Payment Failed</h1>
                <p className="text-gray-600 mt-3">
                    Your eSewa payment was not completed. Please try again.
                    {plan ? ` Selected plan: ${plan}.` : ''}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Link to="/subscription" className="px-5 py-2 rounded-full bg-pink-600 text-white hover:bg-pink-700">
                        Retry Payment
                    </Link>
                    <Link to="/contact" className="px-5 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50">
                        Contact Support
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentFailure;
