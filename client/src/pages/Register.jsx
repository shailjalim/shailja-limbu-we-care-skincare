/**
 * Register Page Component
 * 
 * User registration page for WeCare.
 * Connects to backend API for user registration.
 * 
 * @module pages/Register
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register, isAuthenticated } from '../services/api';

const Register = () => {
    // Navigation hook for redirects
    const navigate = useNavigate();

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user',
    });

    // UI state
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated()) {
            navigate('/dashboard');
        }
    }, [navigate]);

    /**
     * Handle input field changes
     */
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    /**
     * Handle form submission
     * Validates inputs and calls register API
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // ============ CLIENT-SIDE VALIDATION ============

        // Check password match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        
        // Check password length
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        // Check terms agreement
        if (!agreedToTerms) {
            setError('Please agree to the Terms of Service and Privacy Policy');
            return;
        }

        // ============ API CALL ============

        setIsLoading(true);
        setError('');

        try {
            const response = await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
            });

            if (response.success) {
                // Registration successful - redirect to dashboard
                navigate('/dashboard');
            }
        } catch (err) {
            // Handle error response
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // ============ PASSWORD STRENGTH INDICATOR ============

    const getPasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z\d]/.test(password)) strength++;
        return Math.min(strength, 4);
    };

    const passwordStrength = getPasswordStrength(formData.password);
    const strengthColors = ['bg-gray-200', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500'];
    const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="text-4xl font-bold text-pink-600">WeCare</Link>
                    <p className="text-gray-600 mt-2">Create your account and start your skincare journey.</p>
                </div>

                {/* Register Card */}
                <div className="bg-white rounded-3xl shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Account</h2>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                </span>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition"
                                    placeholder="Create a strong password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {/* Password Strength Indicator */}
                            {formData.password && (
                                <div className="mt-2">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4].map((level) => (
                                            <div
                                                key={level}
                                                className={`h-1 flex-1 rounded ${
                                                    level <= passwordStrength ? strengthColors[passwordStrength] : 'bg-gray-200'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <p className={`text-xs mt-1 ${
                                        passwordStrength <= 1 ? 'text-red-500' : 
                                        passwordStrength === 2 ? 'text-yellow-600' : 
                                        passwordStrength === 3 ? 'text-blue-600' : 'text-green-600'
                                    }`}>
                                        {strengthLabels[passwordStrength]}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition"
                                    placeholder="Confirm your password"
                                />
                            </div>
                            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                            )}
                            {formData.confirmPassword && formData.password === formData.confirmPassword && formData.confirmPassword.length > 0 && (
                                <p className="text-xs text-green-500 mt-1">Passwords match</p>
                            )}
                        </div>

                        {/* Terms Agreement */}
                        <div className="rounded-xl border border-pink-100 bg-pink-50 p-3">
                            <div className="flex items-start">
                                <input
                                    type="checkbox"
                                    id="adminRole"
                                    checked={formData.role === 'admin'}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            role: e.target.checked ? 'admin' : 'user',
                                        })
                                    }
                                    className="w-4 h-4 mt-1 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                                />
                                <label htmlFor="adminRole" className="ml-2 text-sm text-gray-700">
                                    Register as admin (first account only)
                                </label>
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                                Only one admin account is allowed. If an admin already exists, admin registration will be rejected.
                            </p>
                        </div>

                        <div className="flex items-start">
                            <input 
                                type="checkbox" 
                                id="terms"
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                className="w-4 h-4 mt-1 text-pink-600 border-gray-300 rounded focus:ring-pink-500" 
                            />
                            <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                                I agree to the{' '}
                                <Link to="/terms" className="text-pink-600 hover:text-pink-700">Terms of Service</Link>
                                {' '}and{' '}
                                <Link to="/privacy" className="text-pink-600 hover:text-pink-700">Privacy Policy</Link>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-pink-400 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Creating Account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    {/* Sign In Link */}
                    <p className="text-center mt-8 text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="text-pink-600 hover:text-pink-700 font-medium">
                            Sign in
                        </Link>
                    </p>
                </div>

                {/* Back to Home */}
                <p className="text-center mt-6">
                    <Link to="/" className="text-gray-500 hover:text-pink-600 text-sm">
                        ← Back to Home
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
