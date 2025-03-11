// firebase.js

const admin = require('firebase-admin');
const { initializeApp } = require('firebase/app');
const { getStorage } = require('firebase/storage');

// Initialize Firebase Admin SDK for server-side operations
let serviceAccount;
try {
  // Try to parse the service account credentials from env variable
  serviceAccount = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS 
    ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS)
    : require('../config/google-credentials.json'); // Fallback to file
} catch (error) {
  console.error('Error parsing service account credentials:', error);
  // Use a minimal configuration to allow the app to start (won't work fully)
  serviceAccount = { projectId: 'cv-processor-fc6b9' };
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'cv-processor-fc6b9.appspot.com'
});

// Firebase configuration for client-side operations
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyDd4xkIsahreZQXpxIk0vd7J8Vc1p5fCbg',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'cv-processor-fc6b9.firebaseapp.com',
  projectId: process.env.FIREBASE_PROJECT_ID || 'cv-processor-fc6b9',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'cv-processor-fc6b9.appspot.com',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '621718757234',
  appId: process.env.FIREBASE_APP_ID || '1:621718757234:web:06b88034d8bb92c5a9c7eb'
};

// Initialize Firebase client
const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

// Export the admin bucket for server-side operations
const bucket = admin.storage().bucket();

module.exports = {
  admin,
  bucket,
  storage,
  firebaseApp
};