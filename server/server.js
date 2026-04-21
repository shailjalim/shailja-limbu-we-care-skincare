require('dotenv').config({ path: require('path').join(__dirname, '.env') });

// Import required packages
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import database connection function
const { connectDB, getConnectionStatus } = require('./config/db');

// Import routes
const testRoutes = require('./routes/testRoutes');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const quizRoutes = require('./routes/quizRoutes');
const productRoutes = require('./routes/productRoutes');
const routineRoutes = require('./routes/routineRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const consultationRoutes = require('./routes/consultationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const contentRoutes = require('./routes/contentRoutes');
const adminProductRoutes = require('./routes/adminProductRoutes');
const adminUserRoutes = require('./routes/adminUserRoutes');
const adminArticleRoutes = require('./routes/adminArticleRoutes');
const adminConsultationRoutes = require('./routes/adminConsultationRoutes');


const app = express();


const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';
const configuredOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
const defaultDevOrigins = ['http://localhost:3000', 'http://localhost:3001'];
const allowedOrigins = isProduction
    ? configuredOrigins
    : Array.from(new Set([...defaultDevOrigins, ...configuredOrigins]));

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/routines', routineRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/articles', adminArticleRoutes);
app.use('/api/admin/consultations', adminConsultationRoutes);
app.use('/api', testRoutes);
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
            content: '/api/content',
            test: '/api/test',
            health: '/api/health',
        },
    });
});


app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});


app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
});

const startServer = async () => {
    try {
        
        const dbConnected = await connectDB();

        
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

if (require.main === module) {
    startServer();
}

module.exports = app;
