/**
 * Home Page Component
 * 
 * Landing page for WeCare skincare application.
 * Includes Hero, Features, and Testimonials sections.
 */

import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="bg-white">
            {/* HERO SECTION */}
            <section className="w-full px-8 lg:px-20 py-14">
                <div className="grid md:grid-cols-2 gap-10 items-center">
                    
                    {/* LEFT SIDE - Content */}
                    <div>
                        {/* Small Tag */}
                        <div className="inline-flex items-center bg-pink-50 text-pink-600 px-4 py-2 rounded-full text-sm mb-4">
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="h-4 w-4 mr-2" 
                                fill="none" 
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M12 6v6l4 2" 
                                />
                            </svg>
                            Your Personalized Skincare Journey
                        </div>

                        {/* Main Heading */}
                        <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-gray-800">
                            Understand Your Skin. <br />
                            <span className="text-pink-600">Build Your Perfect Routine.</span>
                        </h1>

                        {/* Description */}
                        <p className="mt-5 text-gray-600 leading-relaxed text-lg">
                            Take our personalized quiz to discover skincare products and routines tailored
                            specifically for your unique skin needs.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap gap-4 mt-8">
                            <Link 
                                to="/register"
                                className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition duration-300 font-medium"
                            >
                                Register Now
                            </Link>

                            <Link 
                                to="/features"
                                className="border-2 border-pink-500 px-8 py-3 rounded-full text-pink-600 hover:bg-pink-50 transition duration-300 font-medium"
                            >
                                Learn More
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap gap-10 mt-10">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">50K+</h2>
                                <p className="text-sm text-gray-600">Happy Users</p>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">4.9/5</h2>
                                <p className="text-sm text-gray-600">Average Rating</p>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">100+</h2>
                                <p className="text-sm text-gray-600">Products</p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE - Image */}
                    <div className="flex justify-center">
                        <img 
                            src="https://i.pinimg.com/736x/8e/34/11/8e341193c5c38567efda4986e48a211c.jpg" 
                            alt="Skincare Model"
                            className="rounded-3xl w-full max-w-lg h-[420px] object-cover shadow-xl"
                        />
                    </div>
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section className="w-full px-8 lg:px-20 py-14 border-t border-gray-100">
                {/* Section Header */}
                <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-800">
                    Everything You Need for <span className="text-pink-600">Healthy Skin</span>
                </h2>
                <p className="text-center text-gray-600 mt-3 max-w-2xl mx-auto text-lg">
                    Our comprehensive platform provides all the tools and insights you need
                    to achieve your skincare goals.
                </p>

                {/* Feature Cards Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-14">
                    
                    {/* Card 1 - Personalized Quiz */}
                    <div className="bg-white border border-pink-100 p-8 rounded-2xl shadow-sm hover:shadow-lg transition duration-300 hover:border-pink-200">
                        <div className="w-14 h-14 flex items-center justify-center bg-pink-50 rounded-xl mb-4">
                            <svg className="w-8 h-8 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                            </svg>
                        </div>
                        <h3 className="font-semibold text-lg mb-2 text-gray-800">Personalized Quiz</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Answer a few simple questions about your skin type, concerns, and goals to get product
                            recommendations.
                        </p>
                    </div>

                    {/* Card 2 - Routine Builder */}
                    <div className="bg-white border border-pink-100 p-8 rounded-2xl shadow-sm hover:shadow-lg transition duration-300 hover:border-pink-200">
                        <div className="w-14 h-14 flex items-center justify-center bg-pink-50 rounded-xl mb-4">
                            <svg className="w-8 h-8 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                        </div>
                        <h3 className="font-semibold text-lg mb-2 text-gray-800">Routine Builder</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Build and customize your perfect skincare routine with products that work together.
                        </p>
                    </div>

                    {/* Card 3 - Cultural Skincare */}
                    <div className="bg-white border border-pink-100 p-8 rounded-2xl shadow-sm hover:shadow-lg transition duration-300 hover:border-pink-200">
                        <div className="w-14 h-14 flex items-center justify-center bg-pink-50 rounded-xl mb-4">
                            <svg className="w-8 h-8 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                            </svg>
                        </div>
                        <h3 className="font-semibold text-lg mb-2 text-gray-800">Cultural Skincare</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Explore wisdom from around the world including K-beauty, J-beauty, and more.
                        </p>
                    </div>

                    {/* Card 4 - Progress Tracking */}
                    <div className="bg-white border border-pink-100 p-8 rounded-2xl shadow-sm hover:shadow-lg transition duration-300 hover:border-pink-200">
                        <div className="w-14 h-14 flex items-center justify-center bg-pink-50 rounded-xl mb-4">
                            <svg className="w-8 h-8 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/>
                            </svg>
                        </div>
                        <h3 className="font-semibold text-lg mb-2 text-gray-800">Progress Tracking</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Track your skin journey with logs, photos, and insights over time.
                        </p>
                    </div>
                </div>
            </section>

            {/* TESTIMONIAL / COMMUNITY SECTION */}
            <section className="w-full px-8 lg:px-20 py-16">
                <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white p-12 rounded-3xl shadow-xl">
                    
                    {/* Section Header */}
                    <h2 className="text-center text-2xl md:text-3xl font-bold">
                        Join Thousands of Happy Users
                    </h2>
                    <p className="text-center mt-2 text-pink-100 max-w-xl mx-auto">
                        Our community has already transformed their skincare routines and seen amazing results.
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center mt-10">
                        <div className="p-4">
                            <h3 className="text-3xl lg:text-4xl font-bold">98%</h3>
                            <p className="text-pink-100 text-sm mt-1">User Satisfaction</p>
                        </div>
                        <div className="p-4">
                            <h3 className="text-3xl lg:text-4xl font-bold">50K+</h3>
                            <p className="text-pink-100 text-sm mt-1">Active Users</p>
                        </div>
                        <div className="p-4">
                            <h3 className="text-3xl lg:text-4xl font-bold">1M+</h3>
                            <p className="text-pink-100 text-sm mt-1">Routines Created</p>
                        </div>
                        <div className="p-4">
                            <h3 className="text-3xl lg:text-4xl font-bold">24/7</h3>
                            <p className="text-pink-100 text-sm mt-1">Support</p>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <div className="text-center mt-10">
                        <Link 
                            to="/register"
                            className="inline-block bg-white text-pink-600 px-8 py-3 rounded-full font-semibold hover:bg-pink-50 transition duration-300 shadow-lg"
                        >
                            Get Started Today
                        </Link>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="w-full px-8 lg:px-20 py-10 bg-gray-50 border-t border-gray-200">
                <div className="grid md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div>
                        <h3 className="text-2xl font-bold text-pink-600 mb-4">WeCare</h3>
                        <p className="text-gray-600 text-sm">
                            Your personalized skincare companion. Discover products tailored to your unique skin needs.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link to="/" className="hover:text-pink-600 transition">Home</Link></li>
                            <li><Link to="/features" className="hover:text-pink-600 transition">Features</Link></li>
                            <li><Link to="/quiz" className="hover:text-pink-600 transition">Take Quiz</Link></li>
                            <li><Link to="/community" className="hover:text-pink-600 transition">Community</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-4">Support</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link to="/contact" className="hover:text-pink-600 transition">Contact Us</Link></li>
                            <li><Link to="/faq" className="hover:text-pink-600 transition">FAQ</Link></li>
                            <li><Link to="/privacy" className="hover:text-pink-600 transition">Privacy Policy</Link></li>
                            <li><Link to="/terms" className="hover:text-pink-600 transition">Terms of Service</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-4">Stay Updated</h4>
                        <p className="text-sm text-gray-600 mb-3">Subscribe to our newsletter for skincare tips.</p>
                        <div className="flex">
                            <input 
                                type="email" 
                                placeholder="Your email"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-full text-sm focus:outline-none focus:border-pink-500"
                            />
                            <button className="bg-pink-600 text-white px-4 py-2 rounded-r-full hover:bg-pink-700 transition">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-gray-200 mt-10 pt-6 text-center text-sm text-gray-500">
                    <p>© 2026 WeCare. All rights reserved. Built with ❤️ for healthy skin.</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;

