/**
 * Features Page Component
 * 
 * Showcases all features of the WeCare skincare application.
 */

import React from 'react';
import { Link } from 'react-router-dom';

const Features = () => {
    const features = [
        {
            icon: (
                <svg className="w-10 h-10 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
            ),
            title: 'Personalized Skin Quiz',
            description: 'Take our comprehensive quiz to understand your unique skin type, concerns, and goals. Get personalized recommendations based on your answers.',
        },
        {
            icon: (
                <svg className="w-10 h-10 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
            ),
            title: 'Product Recommendations',
            description: 'Discover products tailored to your skin needs from trusted brands. Our AI-powered system matches you with the perfect skincare products.',
        },
        {
            icon: (
                <svg className="w-10 h-10 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            title: 'Routine Builder',
            description: 'Create morning and evening skincare routines with step-by-step guides. Know exactly when and how to apply each product.',
        },
        {
            icon: (
                <svg className="w-10 h-10 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            title: 'Progress Tracking',
            description: 'Track your skin journey with photos and logs. See how your skin improves over time with detailed analytics and insights.',
        },
        {
            icon: (
                <svg className="w-10 h-10 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            title: 'Cultural Skincare',
            description: 'Explore skincare traditions from around the world. Discover K-beauty, J-beauty, Ayurvedic, and more cultural skincare practices.',
        },
        {
            icon: (
                <svg className="w-10 h-10 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            title: 'Community Support',
            description: 'Connect with others on their skincare journey. Share tips, ask questions, and celebrate your progress together.',
        },
    ];

    return (
        <div className="bg-white min-h-screen">
            {/* Hero Section */}
            <section className="w-full px-8 lg:px-20 py-16 bg-gradient-to-br from-pink-50 to-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
                        Powerful Features for Your <span className="text-pink-600">Skincare Journey</span>
                    </h1>
                    <p className="text-xl text-gray-600 leading-relaxed">
                        Everything you need to understand your skin, build the perfect routine, and achieve your skincare goals.
                    </p>
                </div>
            </section>

            {/* Features Grid */}
            <section className="w-full px-8 lg:px-20 py-16">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {features.map((feature, index) => (
                        <div 
                            key={index}
                            className="bg-white border border-gray-100 p-8 rounded-2xl shadow-sm hover:shadow-xl transition duration-300 hover:border-pink-200 group"
                        >
                            <div className="w-16 h-16 flex items-center justify-center bg-pink-50 rounded-2xl mb-6 group-hover:bg-pink-100 transition duration-300">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="w-full px-8 lg:px-20 py-16 bg-pink-50">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-6">
                        Ready to Transform Your Skincare?
                    </h2>
                    <p className="text-lg text-gray-600 mb-8">
                        Join thousands of users who have already discovered their perfect skincare routine.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link 
                            to="/register"
                            className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition duration-300 font-medium"
                        >
                            Get Started Free
                        </Link>
                        <Link 
                            to="/contact"
                            className="border-2 border-pink-500 px-8 py-3 rounded-full text-pink-600 hover:bg-white transition duration-300 font-medium"
                        >
                            Contact Us
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Features;



