// app.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const multer = require('multer');
const fs = require('fs');
// At the top of app.js, where you define PORT
const PORT = process.env.PORT || 5000;
// Add this function near the top of your app.js file, after your requires
const killProcessOnPort = (port) => {
  return new Promise((resolve, reject) => {
    try {
      // Only works on Windows
      const { execSync } = require('child_process');
      console.log(`Attempting to kill process using port ${port}...`);
      
      // Get the PID using port
      const output = execSync(`netstat -ano | findstr :${port}`).toString();
      const lines = output.split('\n').filter(line => line.trim());
      
      if (lines.length > 0) {
        // Extract PID from the last column of the first line
        const match = lines[0].match(/\s+(\d+)$/);
        if (match && match[1]) {
          const pid = match[1];
          console.log(`Found process with PID ${pid} using port ${port}, attempting to kill...`);
          execSync(`taskkill /PID ${pid} /F`);
          console.log(`Successfully killed process with PID ${pid}`);
        }
      }
      resolve();
    } catch (error) {
      console.log(`No process found using port ${port} or failed to kill: ${error.message}`);
      // We'll resolve anyway and let the regular port detection handle it
      resolve();
    }
  });
};

// Start the server asynchronously
(async () => {
  try {
    // Try to kill any process using our preferred port first
    await killProcessOnPort(PORT);
    
    // Now start the server (it will still try next port if needed)
    const server = await startServer(PORT);
    console.log(`Server initialized and ready to accept connections on port ${server.address().port}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();
// Load environment variables first (before any other code)
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Initialize Express app
const app = express();

// Define allowed origins for CORS
const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];

// Improved CORS configuration
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // Cache CORS preflight for 1 day
}));

// Pre-flight requests handler
app.options('*', cors());

// Increase body parser limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CRITICAL: Serve static files from the 'public' directory
// This allows files in public/uploads to be accessed via HTTP
app.use(express.static(path.join(__dirname, 'public')));

// Ensure uploads directory exists with proper permissions
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o755 });
  console.log('Created uploads directory at:', uploadsDir);
}

// Debug middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Log headers for POST requests to help debug connection issues
  if (req.method === 'POST') {
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
  }
  
  next();
});

// Special handling for JSON parsing errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Bad JSON:', err);
    return res.status(400).send({ success: false, message: 'Invalid JSON in request body' });
  }
  next(err);
});

// Configure multer for file uploads with increased limits
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB limit
    fieldSize: 10 * 1024 * 1024 // Also increase field size limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only PDF and DOCX files
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'), false);
    }
  }
});

// Import application controller
const applicationController = require('./server/controllers/applicationController');

// Application routes with better error handling
app.post('/api/applications/submit', (req, res, next) => {
  upload.single('cv')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File size exceeds the limit (10MB maximum)'
          });
        }
        return res.status(400).json({
          success: false,
          message: `File upload error: ${err.message}`
        });
      }
      
      return res.status(400).json({
        success: false,
        message: err.message || 'Unknown file upload error'
      });
    }
    
    // Continue to the controller if no multer errors
    console.log('File uploaded successfully, proceeding to controller');
    applicationController.submitApplication(req, res, next);
  });
});

// Status route
app.get('/api/applications/status/:email', applicationController.getApplicationStatus);

// Route to test if the server is running
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    port: server.address().port
  });
});

// Add a simple file upload test endpoint
app.post('/api/test-upload', upload.single('testFile'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    console.log('Test file received:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
    
    return res.status(200).json({
      success: true,
      message: 'Test file upload successful',
      file: {
        name: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Test upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Test upload failed',
      error: error.message
    });
  }
});

// Improved error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  
  // Return cleaner error response
  res.status(err.status || 500).json({ 
    success: false, 
    message: err.message || 'Internal server error', 
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined 
  });
});

// Catch 404 errors
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.url}`
  });
});



// Modified server start code with port fallback
// This goes at the bottom of app.js 

// Port detection with better handling
const startServer = (port) => {
  return new Promise((resolve, reject) => {
    try {
      // First check if port is in use
      const net = require('net');
      const tester = net.createServer()
        .once('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is already in use, trying port ${port + 1}`);
            // Try next port recursively
            startServer(port + 1).then(resolve).catch(reject);
          } else {
            reject(err);
          }
        })
        .once('listening', () => {
          tester.close(() => {
            // Port is free, create the actual server
            const server = app.listen(port, () => {
              console.log(`Server running on port ${port}`);
              console.log(`CORS enabled for origins: ${allowedOrigins.join(', ')}`);
              console.log(`Static files served from: ${path.join(__dirname, 'public')}`);
              
              // Set up graceful shutdown
              setupShutdownHandlers(server);
              
              // Resolve with the server instance
              resolve(server);
            });
          });
        })
        .listen(port);
    } catch (error) {
      reject(error);
    }
  });
};

// Extract shutdown handlers to a separate function
function setupShutdownHandlers(server) {
  // Graceful shutdown for Ctrl+C
  process.on('SIGINT', () => {
    console.log('\nReceived SIGINT, shutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
    
    // Force shutdown after 5 seconds
    setTimeout(() => {
      console.log('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 5000);
  });
  
  // Graceful shutdown for kill command
  process.on('SIGTERM', () => {
    console.log('\nReceived SIGTERM, shutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
    
    // Force shutdown after 5 seconds
    setTimeout(() => {
      console.log('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 5000);
  });
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    server.close(() => process.exit(1));
  });
  
  // Handle nodemon restarts
  process.once('SIGUSR2', () => {
    console.log('\nReceived SIGUSR2 (nodemon restart)');
    server.close(() => {
      console.log('Server shut down for nodemon restart');
      process.kill(process.pid, 'SIGUSR2');
    });
  });
}

// Start the server asynchronously
(async () => {
  try {
    const server = await startServer(PORT);
    console.log(`Server initialized and ready to accept connections on port ${server.address().port}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();