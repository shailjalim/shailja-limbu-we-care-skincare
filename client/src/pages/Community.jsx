/**
 * Community Page Component
 * 
 * Community hub for WeCare users to connect and share.
 */

import React from 'react';
import { Link } from 'react-router-dom';

const Community = () => {
    const testimonials = [
        {
            name: 'Sarah Johnson',
            role: 'Skincare Enthusiast',
            image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
            quote: 'WeCare completely transformed my skincare routine. My skin has never looked better!',
            rating: 5,
        },
        {
            name: 'Emily Chen',
            role: 'Beauty Blogger',
            image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
            quote: 'The personalized recommendations are spot-on. I finally found products that work for my sensitive skin.',
            rating: 5,
        },
        {
            name: 'Maria Garcia',
            role: 'Wellness Coach',
            image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
            quote: 'I recommend WeCare to all my clients. The progress tracking feature is amazing!',
            rating: 5,
        },
    ];

    const communityStats = [
        { number: '50K+', label: 'Active Members' },
        { number: '100K+', label: 'Discussions' },
        { number: '500+', label: 'Expert Tips' },
        { number: '24/7', label: 'Support' },
    ];

    return (
        <div className="bg-white min-h-screen">
            {/* Hero Section */}
            <section className="w-full px-8 lg:px-20 py-16 bg-gradient-to-br from-pink-50 to-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
                        Join Our <span className="text-pink-600">Skincare Community</span>
                    </h1>
                    <p className="text-xl text-gray-600 leading-relaxed">
                        Connect with thousands of skincare enthusiasts, share your journey, and learn from experts.
                    </p>
                </div>
            </section>

            {/* Stats Section */}
            <section className="w-full px-8 lg:px-20 py-12">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {communityStats.map((stat, index) => (
                            <div key={index} className="text-center p-6 bg-pink-50 rounded-2xl">
                                <h3 className="text-3xl lg:text-4xl font-bold text-pink-600">{stat.number}</h3>
                                <p className="text-gray-600 mt-2">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="w-full px-8 lg:px-20 py-16">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-800 mb-12">
                        What Our Community Says
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div 
                                key={index}
                                className="bg-white border border-gray-100 p-8 rounded-2xl shadow-sm hover:shadow-lg transition duration-300"
                            >
                                <div className="flex items-center mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="text-gray-600 italic mb-6">"{testimonial.quote}"</p>
                                <div className="flex items-center">
                                    <img 
                                        src={testimonial.image} 
                                        alt={testimonial.name}
                                        className="w-12 h-12 rounded-full object-cover mr-4"
                                    />
                                    <div>
                                        <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
                                        <p className="text-sm text-gray-500">{testimonial.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Community Features */}
            <section className="w-full px-8 lg:px-20 py-16 bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-800 mb-12">
                        Community Features
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
                            <div className="w-16 h-16 mx-auto flex items-center justify-center bg-pink-100 rounded-full mb-4">
                                <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Discussion Forums</h3>
                            <p className="text-gray-600">Ask questions, share tips, and connect with other skincare enthusiasts.</p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
                            <div className="w-16 h-16 mx-auto flex items-center justify-center bg-pink-100 rounded-full mb-4">
                                <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Expert Articles</h3>
                            <p className="text-gray-600">Learn from dermatologists and skincare experts with exclusive content.</p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
                            <div className="w-16 h-16 mx-auto flex items-center justify-center bg-pink-100 rounded-full mb-4">
                                <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Success Stories</h3>
                            <p className="text-gray-600">Get inspired by real transformations and skincare journeys from our members.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="w-full px-8 lg:px-20 py-16">
                <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-pink-500 to-pink-600 text-white p-12 rounded-3xl">
                    <h2 className="text-3xl font-bold mb-4">Ready to Join Our Community?</h2>
                    <p className="text-pink-100 mb-8">Start your skincare journey with thousands of supportive members.</p>
                    <Link 
                        to="/register"
                        className="inline-block bg-white text-pink-600 px-8 py-3 rounded-full font-semibold hover:bg-pink-50 transition duration-300 shadow-lg"
                    >
                        Join Now - It's Free!
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Community;



