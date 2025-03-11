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
    
    // Create a reference to the file in the bucket
    const file = bucket.file(`cvs/${fileName}`);
    
    // Create a write stream for the file
    const stream = file.createWriteStream({
      metadata: {
        contentType: mimeType,
      },
      resumable: false,
    });

    // Handle stream events
    return new Promise((resolve, reject) => {
      stream.on('error', (error) => {
        reject(error);
      });

      stream.on('finish', async () => {
        try {
          // Make the file publicly accessible
          await file.makePublic();
          
          // Get the public URL
          const publicUrl = format(
            `https://storage.googleapis.com/${bucket.name}/${file.name}`
          );
          
          resolve(publicUrl);
        } catch (error) {
          reject(error);
        }
      });

      // Write the file buffer to the stream
      stream.end(fileBuffer);
    });
  } catch (error) {
    console.error('Error uploading file to Firebase:', error);
    throw new Error('Failed to upload file to storage');
  }
};

module.exports = {
  uploadFile
};