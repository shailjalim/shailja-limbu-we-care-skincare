/**
 * Main Server Entry Point
 * 
 * This file initializes the Express server, connects to MongoDB,
 * and sets up all middleware and routes.
 * 
 * @module server
 */

// Load environment variables from .env file
require('dotenv').config();

// Import required packages
const express = require('express');
const cors = require('cors');

// Import database connection function
const { connectDB, getConnectionStatus } = require('./config/db');

// Import routes
const testRoutes = require('./routes/testRoutes');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const quizRoutes = require('./routes/quizRoutes');

// Initialize Express application
const app = express();

// Define the port (from .env or default to 5000)
const PORT = process.env.PORT || 5000;

// ================== MIDDLEWARE ==================

/**
 * CORS Middleware
 * Enables Cross-Origin Resource Sharing
 * Allows frontend to communicate with backend
 */
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

/**
 * JSON Body Parser
 * Parses incoming JSON request bodies
 * Makes data available in req.body
 */
app.use(express.json());

/**
 * URL-Encoded Body Parser
 * Parses incoming URL-encoded request bodies
 * Useful for form submissions
 */
app.use(express.urlencoded({ extended: true }));

// ================== ROUTES ==================

/**
 * Authentication Routes
 * Base path: /api/auth
 * Handles user registration, login, and profile
 */
app.use('/api/auth', authRoutes);

/**
 * Skin Profile Routes
 * Base path: /api/profile
 * Handles user skin profile CRUD operations
 */
app.use('/api/profile', profileRoutes);

/**
 * Skin Quiz Routes
 * Base path: /api/quiz
 * Handles skin type quiz submission and calculation
 */
app.use('/api/quiz', quizRoutes);

/**
 * Test Routes
 * Base path: /api
 * Used to verify backend is running correctly
 */
app.use('/api', testRoutes);

// ================== ROOT ROUTE ==================

/**
 * Root endpoint
 * Simple welcome message to verify server is running
 */
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to We Care API',
        version: '1.0.0',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                me: 'GET /api/auth/me',
                forgotPassword: 'POST /api/auth/forgot-password',
                resetPassword: 'POST /api/auth/reset-password',
            },
            profile: {
                getProfile: 'GET /api/profile/me',
                createOrUpdate: 'POST /api/profile',
            },
            quiz: {
                submit: 'POST /api/quiz',
            },
            test: '/api/test',
            health: '/api/health',
        },
    });
});

// ================== ERROR HANDLING ==================

/**
 * 404 Handler
 * Catches requests to undefined routes
 */
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

/**
 * Global Error Handler
 * Catches all unhandled errors
 */
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
});

// ================== SERVER STARTUP ==================

/**
 * Start the server
 * First attempts MongoDB connection, then starts listening on the specified port
 * Server will run even if MongoDB connection fails (for testing purposes)
 */
const startServer = async () => {
    try {
        // Attempt to connect to MongoDB (non-blocking)
        const dbConnected = await connectDB();

        // Start listening for requests
        app.listen(PORT, () => {
            console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
            console.log(`📡 API available at http://localhost:${PORT}/api`);
            console.log(`🔐 Auth endpoints at http://localhost:${PORT}/api/auth`);
            if (!dbConnected) {
                console.log(`⚠️  Database not connected - authentication will not work`);
            }
            console.log('');
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

// Call the startup function
startServer();
