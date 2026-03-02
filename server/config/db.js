/**
 * MongoDB Database Connection Configuration
 * 
 * This file handles the connection to MongoDB using Mongoose.
 * It exports a function that can be called to establish the database connection.
 */

const mongoose = require('mongoose');

// Track connection status
let isConnected = false;

/**
 * Connects to MongoDB database
 * Uses the connection string from environment variables
 * Falls back to 127.0.0.1 if localhost fails (IPv6 issue)
 */
const connectDB = async () => {
    // Use 127.0.0.1 to avoid IPv6 issues with localhost
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wecare';
    
    try {
        // Attempt to connect to MongoDB with timeout
        const conn = await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000, // 5 second timeout
        });

        // Log successful connection
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📦 Database: ${conn.connection.name}`);
        isConnected = true;
        return true;
    } catch (error) {
        // Log the error
        console.error(`⚠️ MongoDB Connection Error: ${error.message}`);
        console.log('📢 Server will continue without database connection.');
        console.log('📢 Please ensure MongoDB is running for full functionality.');
        
        isConnected = false;
        return false;
    }
};

/**
 * Get current database connection status
 */
const getConnectionStatus = () => {
    return {
        isConnected: mongoose.connection.readyState === 1,
        status: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown',
        database: mongoose.connection.name || null,
        host: mongoose.connection.host || null
    };
};

module.exports = { connectDB, getConnectionStatus };

