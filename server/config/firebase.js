// config/firebaseConfig.js
const admin = require('firebase-admin');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Helper to format the private key correctly
const formatPrivateKey = (key) => {
  if (!key) return null;
  // Replace escaped newlines with actual newlines
  return key.replace(/\\n/g, '\n').trim();
};

// Initialize Firebase Admin SDK
const initializeFirebaseAdmin = () => {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length) {
      console.log('Firebase Admin already initialized');
      return admin;
    }
    
    // Prepare service account from environment variables
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL)}`
    };
    
    // Log info (without sensitive data)
    console.log('Initializing Firebase with project:', serviceAccount.project_id);
    
    // Initialize admin SDK
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
    
    console.log('Firebase Admin initialized successfully');
    return admin;
  } catch (error) {
    console.error('Firebase initialization error:', error.message);
    
    // Helpful error message for common issues
    if (error.message.includes('private_key')) {
      console.error('Private key format appears to be invalid. Check your .env file.');
    }
    
    // Return null instead of throwing to allow fallback to local storage
    return null;
  }
};

// Try to initialize and get bucket
let adminInstance = null;
let bucket = null;

try {
  adminInstance = initializeFirebaseAdmin();
  if (adminInstance) {
    bucket = adminInstance.storage().bucket();
    console.log('Firebase Storage bucket initialized successfully');
  }
} catch (error) {
  console.error('Failed to initialize Firebase bucket:', error.message);
  // Proceeding without Firebase storage (will use local fallback)
}

/**
 * Upload a file to Firebase Storage
 * 
 * @param {Buffer} buffer - File buffer
 * @param {String} originalName - Original file name
 * @param {String} mimeType - File MIME type
 * @returns {Promise<String>} Public URL of the uploaded file
 */
const uploadToFirebase = async (buffer, originalName, mimeType) => {
  if (!bucket) {
    throw new Error('Firebase Storage not initialized');
  }
  
  try {
    console.log(`Uploading file to Firebase: ${originalName} (${mimeType}, ${buffer.length} bytes)`);
    
    // Generate unique filename
    const fileExt = path.extname(originalName);
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}${fileExt}`;
    const filePath = `cvs/${fileName}`;
    
    // Create file reference
    const file = bucket.file(filePath);
    
    // Upload options
    const options = {
      metadata: {
        contentType: mimeType
      },
      resumable: false
    };
    
    // Return a promise that resolves when upload is complete
    return new Promise((resolve, reject) => {
      const blobStream = file.createWriteStream(options);
      
      blobStream.on('error', (error) => {
        console.error('Firebase upload stream error:', error);
        reject(error);
      });
      
      blobStream.on('finish', async () => {
        try {
          // Make file publicly accessible
          await file.makePublic();
          
          // Generate a public URL
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
          console.log('File uploaded successfully to Firebase. URL:', publicUrl);
          resolve(publicUrl);
        } catch (error) {
          console.error('Error making file public:', error);
          reject(error);
        }
      });
      
      // Write buffer to stream
      blobStream.end(buffer);
    });
  } catch (error) {
    console.error('Firebase upload error:', error);
    throw error;
  }
};

module.exports = {
  admin: adminInstance,
  bucket,
  uploadToFirebase
};