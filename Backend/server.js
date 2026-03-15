// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();  
const PORT = process.env.PORT || 5001;


// Import database connections
console.log('Initializing database connections...');
const mysqlDb = require('./config/mysql/db'); // Make sure this path is correct
const { admin, firestore } = require('./config/firebase');



// Routes import
const authRoute = require("./routes/authRoute.js");
const protectedRoute = require("./routes/protectedRoutes.js");
const projectRoute = require("./routes/projectRoute.js");
const userRoute = require("./routes/userRoute.js");

// Middlewares
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Test endpoints
app.get('/api/test-firebase', (req, res) => {
    res.json({
        firebaseAdminInitialized: !!admin,
        firestoreInitialized: !!firestore,
        mysqlInitialized: !!mysqlDb,
        message: 'Status check',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/test-connections', async (req, res) => {
    const results = {
        mysql: 'unknown',
        firestore: 'unknown',
        timestamp: new Date().toISOString()
    };
    
    // Test MySQL
    try {
        if (mysqlDb) {
            const [result] = await mysqlDb.promise().query('SELECT 1 as test');
            results.mysql = result[0].test === 1 ? 'connected' : 'error';
        } else {
            results.mysql = 'error: mysqlDb is not defined';
        }
    } catch (error) {
        results.mysql = 'error: ' + error.message;
    }
    
    // Test Firestore
    try {
        if (firestore) {
            const testDoc = await firestore.collection('test').doc('test').get();
            results.firestore = 'connected';
        } else {
            results.firestore = 'error: firestore not defined';
        }
    } catch (error) {
        results.firestore = 'error: ' + error.message;
    }
    
    res.json(results);
});

// Routes
app.get('/', (req, res) => {
    res.json({ 
        message: 'Hello from TaskFlowPro Backend!',
        status: 'running',
        timestamp: new Date().toISOString()
    });
});

app.use("/api/auth", authRoute);
app.use("/api/protected", protectedRoute);
app.use('/api/project', projectRoute);
app.use('/api/user', userRoute);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});