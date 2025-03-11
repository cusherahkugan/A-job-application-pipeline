// config/firebaseConfig.js
const admin = require('firebase-admin');
const { initializeApp } = require('firebase/app');
const { getStorage } = require('firebase/storage');
const path = require('path');
const dotenv = require('dotenv');
const { getFirebaseServiceAccount } = require('../utils/firebase-auth-fix');

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Initialize Firebase Admin
 */
function initializeFirebaseAdmin() {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length) {
      console.log('Firebase Admin already initialized');
      return admin;
    }
    
    // Get service account credentials using our utility
    const serviceAccount = getFirebaseServiceAccount();
    
    if (!serviceAccount) {
      throw new Error('Could not get valid Firebase service account credentials');
    }
    
    // Log service account details (omitting private key)
    console.log('Firebase Service Account Details:');
    console.log('Project ID:', serviceAccount.project_id);
    console.log('Client Email:', serviceAccount.client_email);
    console.log('Private Key Present:', !!serviceAccount.private_key);
    
    // Create a new admin app instance
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });

    console.log('Firebase Admin initialized successfully');
    return admin;
  } catch (error) {
    console.error('Firebase Initialization Error:', {
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}

// Firebase client configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Client-side Firebase initialization
const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

// Initialize admin and get bucket
let bucket = null;

try {
  const admin_instance = initializeFirebaseAdmin();
  bucket = admin_instance.storage().bucket();
} catch (error) {
  console.error('Failed to initialize Firebase admin and bucket:', error);
  // Allow the app to continue without Firebase Storage if needed
}

module.exports = {
  initializeFirebaseAdmin,
  firebaseApp,
  storage,
  bucket,
  admin: admin.apps.length ? admin : null
};