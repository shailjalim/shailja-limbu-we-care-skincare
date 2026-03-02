/**
 * Test Controller
 * 
 * Contains handler functions for test routes.
 * Used to verify server functionality and connectivity.
 */

const { getConnectionStatus } = require('../config/db');

/**
 * Get Test Message
 * Returns a simple message to verify the backend is running
 * Includes database connection status
 * 
 * @route   GET /api/test
 * @access  Public
 */
const getTestMessage = (req, res) => {
    try {
        const dbStatus = getConnectionStatus();
        
        res.status(200).json({
            success: true,
            message: 'Backend is running',
            timestamp: new Date().toISOString(),
            database: {
                connected: dbStatus.isConnected,
                status: dbStatus.status,
                name: dbStatus.database
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error in test route',
            error: error.message
        });
    }
};

/**
 * Get Health Status
 * Returns detailed health status of the server
 * Useful for monitoring and debugging
 * 
 * @route   GET /api/health
 * @access  Public
 */
const getHealthStatus = (req, res) => {
    try {
        const dbStatus = getConnectionStatus();
        
        res.status(200).json({
            success: true,
            status: 'healthy',
            server: 'We Care API',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            database: {
                connected: dbStatus.isConnected,
                status: dbStatus.status,
                name: dbStatus.database,
                host: dbStatus.host
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Health check failed',
            error: error.message
        });
    }
};

module.exports = {
    getTestMessage,
    getHealthStatus
};

