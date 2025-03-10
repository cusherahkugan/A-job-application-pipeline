// app.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./server/routes/api');
require('dotenv').config();

// Create Express app
const app = express();

// Set up middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the client build folder
app.use(express.static(path.join(__dirname, 'client/build')));

// API routes
app.use('/api', apiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.message === 'Only PDF and DOCX files are allowed') {
    return res.status(400).json({ message: 'Only PDF and DOCX files are allowed' });
  }
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File size limit exceeded (max 5MB)' });
  }
  
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});