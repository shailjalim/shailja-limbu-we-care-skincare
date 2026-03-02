/**
 * Navbar Component
 * 
 * Navigation bar for the WeCare application.
 * Includes logo, navigation links, and login/logout functionality.
 * Responsive design with mobile menu support.
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout, getUser, isAuthenticated } from '../services/api';

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = () => {
            if (isAuthenticated()) {
                const userData = getUser();
                setUser(userData);
                setIsLoggedIn(true);
            } else {
                setUser(null);
                setIsLoggedIn(false);
            }
        };
        
        checkAuth();
        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);
    }, [location]);

    const handleLogout = () => {
        logout();
        setUser(null);
        setIsLoggedIn(false);
        setIsMobileMenuOpen(false);
        navigate('/');
    };

    // Public navigation links (shown when logged out)
    const publicNavLinks = [
        { name: 'Home', path: '/' },
        { name: 'Features', path: '/features' },
        { name: 'Community', path: '/community' },
        { name: 'Contact', path: '/contact' },
    ];

    // Dashboard navigation links (shown when logged in)
    const dashboardNavLinks = [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Skin Quiz', path: '/quiz' },
    ];

    // Use appropriate nav links based on auth state
    const navLinks = isLoggedIn ? dashboardNavLinks : publicNavLinks;

    const isActiveLink = (path) => {
        return location.pathname === path;
    };

    return (
        <nav className="w-full px-8 lg:px-20 py-6 flex items-center justify-between shadow-sm bg-white sticky top-0 z-50">
            {/* Logo - Links to dashboard when logged in, home when logged out */}
            <Link to={isLoggedIn ? "/dashboard" : "/"} className="text-3xl font-bold text-pink-600 tracking-wide hover:text-pink-700 transition">
                WeCare
            </Link>

            {/* Desktop Navigation Links */}
            <ul className="hidden md:flex space-x-10 font-medium">
                {navLinks.map((link) => (
                    <li key={link.name}>
                        <Link 
                            to={link.path} 
                            className={`transition duration-200 ${
                                isActiveLink(link.path) 
                                    ? 'text-pink-600 font-semibold' 
                                    : 'text-gray-700 hover:text-pink-600'
                            }`}
                        >
                            {link.name}
                        </Link>
                    </li>
                ))}
            </ul>

            {/* Auth Buttons - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
                {isLoggedIn ? (
                    <>
                        <Link 
                            to="/dashboard"
                            className="flex items-center space-x-2 text-gray-700 hover:text-pink-600 transition"
                        >
                            <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                                <span className="text-pink-600 font-semibold text-sm">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </span>
                            </div>
                            <span className="font-medium">{user?.name || 'User'}</span>
                        </Link>
                        <button 
                            onClick={handleLogout}
                            className="px-5 py-2 border-2 border-pink-600 text-pink-600 rounded-full hover:bg-pink-600 hover:text-white transition duration-200"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link 
                            to="/login"
                            className="px-5 py-2 text-pink-600 font-medium hover:text-pink-700 transition duration-200"
                        >
                            Login
                        </Link>
                        <Link 
                            to="/register"
                            className="px-6 py-2 bg-pink-600 text-white rounded-full shadow hover:bg-pink-700 transition duration-200"
                        >
                            Register
                        </Link>
                    </>
                )}
            </div>

            {/* Mobile Menu Button */}
            <button 
                className="md:hidden p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle mobile menu"
            >
                {isMobileMenuOpen ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                )}
            </button>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-white shadow-lg md:hidden border-t">
                    <ul className="flex flex-col py-4">
                        {navLinks.map((link) => (
                            <li key={link.name}>
                                <Link 
                                    to={link.path}
                                    className={`block px-8 py-3 transition ${
                                        isActiveLink(link.path)
                                            ? 'text-pink-600 bg-pink-50 font-semibold'
                                            : 'text-gray-700 hover:text-pink-600 hover:bg-pink-50'
                                    }`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            </li>
                        ))}
                        {isLoggedIn ? (
                            <>
                                <li className="px-8 py-3 border-t border-gray-100">
                                    <Link 
                                        to="/dashboard"
                                        className="flex items-center space-x-3 text-gray-700"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                                            <span className="text-pink-600 font-semibold">
                                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium">{user?.name || 'User'}</p>
                                            <p className="text-sm text-gray-500">{user?.email || ''}</p>
                                        </div>
                                    </Link>
                                </li>
                                <li className="px-8 py-3">
                                    <button 
                                        onClick={handleLogout}
                                        className="block w-full text-center px-6 py-2 border-2 border-pink-600 text-pink-600 rounded-full hover:bg-pink-600 hover:text-white transition"
                                    >
                                        Logout
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="px-8 py-3">
                                    <Link 
                                        to="/login"
                                        className="block w-full text-center px-6 py-2 border-2 border-pink-600 text-pink-600 rounded-full hover:bg-pink-50 transition"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Login
                                    </Link>
                                </li>
                                <li className="px-8 py-3">
                                    <Link 
                                        to="/register"
                                        className="block w-full text-center px-6 py-2 bg-pink-600 text-white rounded-full shadow hover:bg-pink-700 transition"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Register
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            )}
        </nav>
    );
};

export default Navbar;

