/**
 * Main App Component
 * 
 * Root component of the WeCare application.
 * Handles routing, layout, and authentication state.
 * 
 * @module App
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';

// Components
import Navbar from './components/Navbar';
import ChatbotWidget from './components/ChatbotWidget';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';

// Pages
import Home from './pages/Home';
import Features from './pages/Features';
import Community from './pages/Community';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SkinQuiz from './pages/SkinQuiz';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import ContentList from './pages/ContentList';
import ContentDetail from './pages/ContentDetail';
import RoutineTracker from './pages/RoutineTracker';
import Chatbot from './pages/Chatbot';
import Subscription from './pages/Subscription';
import Consultation from './pages/Consultation';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminUsers from './pages/AdminUsers';
import AdminArticles from './pages/AdminArticles';
import AdminConsultations from './pages/AdminConsultations';

/**
 * Layout Component
 * 
 * Conditionally renders the Navbar based on current route.
 * Hides navbar on authentication pages for cleaner UI.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 */
const Layout = ({ children }) => {
    const location = useLocation();
    
    // Routes where navbar should be hidden
    const hideNavbarRoutes = ['/login', '/register', '/forgot-password', '/quiz'];
    const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);
    
    return (
        <div className="min-h-screen bg-white">
            {/* Navigation Bar - Hidden on auth pages */}
            {!shouldHideNavbar && <Navbar />}
            {!shouldHideNavbar && <ChatbotWidget />}
            
            {/* Main Content */}
            {children}
        </div>
    );
};

/**
 * NotFound Component
 * 
 * 404 error page for undefined routes.
 */
const NotFound = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
            <h1 className="text-6xl font-bold text-pink-600">404</h1>
            <p className="text-xl text-gray-600 mt-4">Page not found</p>
            <p className="text-gray-500 mt-2">The page you're looking for doesn't exist.</p>
            <Link 
                to="/" 
                className="inline-block mt-6 px-6 py-2 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition"
            >
                Go Home
            </Link>
        </div>
    </div>
);

/**
 * Main App Component
 * 
 * Sets up routing for the entire application.
 * Includes public routes, protected routes, and auth routes.
 */
function App() {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Layout>
                <Routes>
                    {/* ============ PUBLIC ROUTES ============ */}
                    
                    {/* Home / Landing Page */}
                    <Route path="/" element={<Home />} />
                    
                    {/* Information Pages */}
                    <Route path="/features" element={<Features />} />
                    <Route path="/community" element={<Community />} />
                    <Route path="/contact" element={<Contact />} />
                    
                    {/* ============ AUTH ROUTES ============ */}
                    
                    {/* Login Page */}
                    <Route path="/login" element={<Login />} />
                    
                    {/* Register Page */}
                    <Route path="/register" element={<Register />} />
                    
                    {/* Forgot Password Page */}
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    
                    {/* Reset Password Page (with token from email) */}
                    <Route path="/reset-password/:token" element={<ResetPassword />} />
                    
                    {/* ============ PROTECTED ROUTES ============ */}
                    
                    {/* User Dashboard - Requires Authentication */}
                    <Route 
                        path="/dashboard" 
                        element={
                            <PrivateRoute>
                                <Dashboard />
                            </PrivateRoute>
                        } 
                    />
                    
                    {/* Skin Quiz - Requires Authentication */}
                    <Route 
                        path="/quiz" 
                        element={
                            <PrivateRoute>
                                <SkinQuiz />
                            </PrivateRoute>
                        } 
                    />
                    
                    {/* Product Catalog */}
                    <Route path="/products" element={<ProductList />} />
                    <Route path="/products/:id" element={<ProductDetail />} />

                    {/* Educational Content */}
                    <Route path="/content" element={<ContentList />} />
                    <Route path="/content/:id" element={<ContentDetail />} />

                    {/* Skincare Routine Tracker */}
                    <Route
                        path="/routines"
                        element={
                            <PrivateRoute>
                                <RoutineTracker />
                            </PrivateRoute>
                        }
                    />

                    {/* Subscription Page */}
                    <Route
                        path="/subscription"
                        element={
                            <PrivateRoute>
                                <Subscription />
                            </PrivateRoute>
                        }
                    />

                    {/* Dermatologist Consultation */}
                    <Route
                        path="/consultation"
                        element={
                            <PrivateRoute>
                                <Consultation />
                            </PrivateRoute>
                        }
                    />

                    {/* AI Chatbot - Requires Authentication */}
                    <Route
                        path="/chatbot"
                        element={
                            <PrivateRoute>
                                <Chatbot />
                            </PrivateRoute>
                        }
                    />

                    {/* Admin Dashboard - Requires admin access */}
                    <Route
                        path="/admin"
                        element={
                            <AdminRoute>
                                <AdminLayout />
                            </AdminRoute>
                        }
                    >
                        <Route index element={<AdminDashboard />} />
                        <Route path="products" element={<AdminProducts />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="articles" element={<AdminArticles />} />
                        <Route path="consultations" element={<AdminConsultations />} />
                    </Route>

                    {/* ============ 404 NOT FOUND ============ */}
                    
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
