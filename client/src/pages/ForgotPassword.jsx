/**
 * ForgotPassword Page
 * 
 * Password recovery page for users who forgot their password.
 * Sends a password reset email to the user's registered email address.
 * 
 * @module pages/ForgotPassword
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/api';

/**
 * Email validation regex pattern
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * ForgotPassword Component
 * 
 * Handles the forgot password flow by collecting user email
 * and requesting a password reset link.
 */
const ForgotPassword = () => {
    // ============ STATE MANAGEMENT ============

    // Form state
    const [email, setEmail] = useState('');
    
    // UI state
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [fieldError, setFieldError] = useState('');

    // ============ VALIDATION ============

    /**
     * Validate email format
     * @param {string} emailValue - Email to validate
     * @returns {boolean} - True if valid
     */
    const validateEmail = (emailValue) => {
        if (!emailValue.trim()) {
            setFieldError('Email is required');
            return false;
        }
        if (!EMAIL_REGEX.test(emailValue)) {
            setFieldError('Please enter a valid email address');
            return false;
        }
        setFieldError('');
        return true;
    };

    /**
     * Handle email input change
     */
    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        setError('');
        
        // Clear field error when user starts typing
        if (fieldError && value.trim()) {
            setFieldError('');
        }
    };

    /**
     * Handle email input blur - validate on blur
     */
    const handleEmailBlur = () => {
        if (email.trim()) {
            validateEmail(email);
        }
    };

    // ============ FORM SUBMISSION ============

    /**
     * Handle form submission
     * Validates email and sends reset request to API
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate email before submission
        if (!validateEmail(email)) {
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await forgotPassword(email);

            if (response.success) {
                setSuccess(true);
            }
        } catch (err) {
            setError(err.message || 'Failed to send reset email. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // ============ SUCCESS STATE ============

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center px-4 py-12">
                <div className="max-w-md w-full">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <Link to="/" className="text-4xl font-bold text-pink-600">WeCare</Link>
                    </div>

                    {/* Success Card */}
                    <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
                        {/* Success Icon */}
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Check Your Email</h2>
                        
                        <p className="text-gray-600 mb-6">
                            We've sent a password reset link to <span className="font-semibold text-pink-600">{email}</span>. 
                            Please check your inbox and follow the instructions to reset your password.
                        </p>

                        <div className="bg-pink-50 rounded-xl p-4 mb-6">
                            <p className="text-sm text-gray-600">
                                <span className="font-semibold">Didn't receive the email?</span>
                                <br />
                                Check your spam folder or try again with a different email.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <Link 
                                to="/login"
                                className="block w-full px-6 py-3 bg-pink-600 text-white rounded-xl font-medium hover:bg-pink-700 transition"
                            >
                                Back to Login
                            </Link>
                            
                            <button
                                onClick={() => {
                                    setSuccess(false);
                                    setEmail('');
                                }}
                                className="block w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
                            >
                                Try Different Email
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ============ FORGOT PASSWORD FORM ============

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="text-4xl font-bold text-pink-600">WeCare</Link>
                    <p className="text-gray-600 mt-2">Reset your password</p>
                </div>

                {/* Forgot Password Card */}
                <div className="bg-white rounded-3xl shadow-xl p-8">
                    {/* Header Icon */}
                    <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Forgot Password?</h2>
                    <p className="text-gray-500 text-center mb-6">
                        No worries! Enter your email and we'll send you a reset link.
                    </p>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-start">
                            <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        {/* Email Field */}
                        <div className="mb-6">
                            <label 
                                htmlFor="email" 
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={email}
                                    onChange={handleEmailChange}
                                    onBlur={handleEmailBlur}
                                    placeholder="Enter your email address"
                                    className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition ${
                                        fieldError 
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                            : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
                                    }`}
                                    disabled={isLoading}
                                    aria-label="Email address"
                                    aria-describedby={fieldError ? "email-error" : undefined}
                                />
                            </div>
                            {/* Field Error */}
                            {fieldError && (
                                <p id="email-error" className="mt-2 text-sm text-red-600 flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {fieldError}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3 rounded-xl font-medium transition flex items-center justify-center ${
                                isLoading
                                    ? 'bg-pink-400 cursor-not-allowed'
                                    : 'bg-pink-600 hover:bg-pink-700 shadow-lg hover:shadow-xl'
                            } text-white`}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Send Reset Link
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="my-6 flex items-center">
                        <div className="flex-1 border-t border-gray-200"></div>
                        <span className="px-4 text-sm text-gray-500">or</span>
                        <div className="flex-1 border-t border-gray-200"></div>
                    </div>

                    {/* Back to Login */}
                    <div className="text-center">
                        <Link 
                            to="/login" 
                            className="inline-flex items-center text-pink-600 hover:text-pink-700 font-medium transition"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Login
                        </Link>
                    </div>
                </div>

                {/* Home Link */}
                <div className="text-center mt-6">
                    <Link 
                        to="/" 
                        className="text-gray-500 hover:text-gray-700 text-sm transition"
                    >
                        ← Return to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
