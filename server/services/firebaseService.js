// services/firebaseService.js
const { bucket } = require('../config/firebase');
const { format } = require('util');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Upload a file to Firebase Storage
 * 
 * @param {Buffer} fileBuffer - The file buffer
 * @param {String} originalName - Original filename
 * @param {String} mimeType - File MIME type
 * @returns {Promise<String>} Public URL of the uploaded file
 */
const uploadFile = async (fileBuffer, originalName, mimeType) => {
  try {
    // Create a unique filename
    const fileName = `${Date.now()}-${uuidv4()}${path.extname(originalName)}`;
    const filePath = `cvs/${fileName}`;
    
    console.log(`Uploading file: ${filePath} (${mimeType})`);
    
    // Create a reference to the file in the bucket
    const file = bucket.file(filePath);
    
    // Create a write stream for the file
    const options = {
      metadata: {
        contentType: mimeType,
      },
      resumable: false,
      public: true, // Make file publicly accessible
    };

    // Handle file upload
    return new Promise((resolve, reject) => {
      const blobStream = file.createWriteStream(options);

      blobStream.on('error', (error) => {
        console.error('Upload stream error:', error);
        reject(error);
      });

      blobStream.on('finish', async () => {
        try {
          // File upload completed successfully
          // Generate public URL
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
          console.log('File uploaded successfully. Public URL:', publicUrl);
          resolve(publicUrl);
        } catch (error) {
          console.error('Error making file public:', error);
          reject(error);
        }
      });

      // Write buffer to stream and end
      blobStream.end(fileBuffer);
    });
  } catch (error) {
    console.error('Error uploading file to Firebase:', error);
    throw new Error(`Failed to upload file to storage: ${error.message}`);
  }
};

module.exports = {
  uploadFile
};