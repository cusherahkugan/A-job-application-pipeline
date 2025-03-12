// services/storageService.js
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { format } = require('util');

// Import Firebase config (safely with fallback)
let firebaseConfig = null;
try {
  firebaseConfig = require('../config/firebase');
  console.log('Firebase config loaded successfully');
} catch (error) {
  console.warn('Firebase config not available, will use local storage only:', error.message);
}

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o755 });
  console.log('Created uploads directory at:', uploadsDir);
}

/**
 * Store file in local filesystem and return accessible URL
 * 
 * @param {Buffer} fileBuffer - File buffer
 * @param {String} originalName - Original file name
 * @param {String} mimeType - File MIME type
 * @returns {Promise<String>} Public URL for the file
 */
const storeFileLocally = async (fileBuffer, originalName, mimeType) => {
  try {
    console.log(`Storing file locally: ${originalName} (${mimeType}, ${fileBuffer.length} bytes)`);
    
    // Generate unique filename to avoid collisions
    const fileExt = path.extname(originalName);
    const timestamp = Date.now();
    const randomId = uuidv4();
    const fileName = `${timestamp}-${randomId}${fileExt}`;
    const filePath = path.join(uploadsDir, fileName);
    
    // Write file to disk
    fs.writeFileSync(filePath, fileBuffer);
    console.log(`File saved locally at: ${filePath}`);
    
    // Generate publicly accessible URL
    // This works in development if you serve static files from 'public' directory
    const port = process.env.PORT || 5000; 
    const publicUrl = `http://localhost:${port}/uploads/${fileName}`;
    
    return publicUrl;
  } catch (error) {
    console.error('Error storing file locally:', error);
    throw new Error(`Failed to store file locally: ${error.message}`);
  }
};

/**
 * Try to upload file to Firebase Storage
 * 
 * @param {Buffer} fileBuffer - File buffer
 * @param {String} originalName - Original file name
 * @param {String} mimeType - File MIME type
 * @returns {Promise<String>} Public URL for the file
 */
const uploadToFirebase = async (fileBuffer, originalName, mimeType) => {
  try {
    console.log(`Attempting to upload to Firebase: ${originalName}`);
    
    // Check if Firebase config is available
    if (!firebaseConfig || !firebaseConfig.uploadToFirebase) {
      throw new Error('Firebase configuration not available');
    }
    
    // Use the uploadToFirebase function from the config
    return await firebaseConfig.uploadToFirebase(fileBuffer, originalName, mimeType);
  } catch (error) {
    console.error('Firebase upload failed:', error);
    throw error;
  }
};

/**
 * Upload file with Firebase and local fallback
 * 
 * @param {Buffer} fileBuffer - File buffer
 * @param {String} originalName - Original file name
 * @param {String} mimeType - File MIME type
 * @returns {Promise<String>} Public URL for the file
 */
const uploadFile = async (fileBuffer, originalName, mimeType) => {
  try {
    console.log(`Processing file upload: ${originalName} (${mimeType}, ${fileBuffer.length} bytes)`);
    
    // Try Firebase upload first
    try {
      console.log('Attempting Firebase upload...');
      const firebaseUrl = await uploadToFirebase(fileBuffer, originalName, mimeType);
      console.log('Firebase upload successful:', firebaseUrl);
      return firebaseUrl;
    } catch (firebaseError) {
      console.warn('Firebase upload failed, using local storage fallback:', firebaseError.message);
      // Fall back to local storage
      const localUrl = await storeFileLocally(fileBuffer, originalName, mimeType);
      console.log('Local storage successful:', localUrl);
      return localUrl;
    }
  } catch (error) {
    console.error('All storage methods failed:', error);
    throw new Error(`Failed to store file: ${error.message}`);
  }
};

module.exports = {
  uploadFile,
  storeFileLocally,
  uploadToFirebase
};