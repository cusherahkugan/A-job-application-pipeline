const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { initializeFirebaseAdmin } = require('./server/config/firebase');

// Load environment variables ONCE
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Initialize Firebase Admin
try {
  initializeFirebaseAdmin();
  console.log('Firebase Admin initialized successfully');
} catch (err) {
  console.error('Failed to initialize Firebase:', err);
}

const app = express();

// Define allowed origins
const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Pre-flight requests handler
app.options('*', cors());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

// Import routes
const applicationRoutes = require('./server/routes/applicationRoutes');

// API routes
app.use('/api/applications', applicationRoutes);

// Serve static files from the client build folder
app.use(express.static(path.join(__dirname, 'client/build')));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  
  // Return structured error response
  res.status(err.status || 500).json({ 
    success: false, 
    message: err.message || 'Internal server error', 
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined 
  });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS enabled for origins: ${allowedOrigins.join(', ')}`);
});