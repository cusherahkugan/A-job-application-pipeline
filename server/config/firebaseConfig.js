// Import firebase-admin at the top
const firebase = require('firebase-admin');
const path = require('path');

// Load dotenv with the correct path to your .env file
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Better debugging
console.log("Current directory:", __dirname);
console.log("Looking for .env at:", path.resolve(__dirname, '../.env'));
console.log("FIREBASE_PROJECT_ID:", process.env.FIREBASE_PROJECT_ID);
console.log("FIREBASE_CLIENT_EMAIL exists:", !!process.env.FIREBASE_CLIENT_EMAIL);
console.log("FIREBASE_PRIVATE_KEY exists:", !!process.env.FIREBASE_PRIVATE_KEY);

// Initialize Firebase
if (!firebase.apps.length) {
  try {
    // Ensure private key is properly formatted
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;
    
    if (!process.env.FIREBASE_PROJECT_ID) {
      throw new Error("Missing FIREBASE_PROJECT_ID environment variable");
    }
    
    if (!process.env.FIREBASE_CLIENT_EMAIL) {
      throw new Error("Missing FIREBASE_CLIENT_EMAIL environment variable");
    }
    
    if (!privateKey) {
      throw new Error("Missing or invalid FIREBASE_PRIVATE_KEY environment variable");
    }
    
    const firebaseConfig = {
      credential: firebase.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey
      }),
      storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
    };
    
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully");
  } catch (error) {
    console.error("Firebase initialization error:", error);
    // Don't continue execution if Firebase fails to initialize
    process.exit(1);
  }
}

// Export Firebase services if needed
const bucket = firebase.storage().bucket();

module.exports = { firebase, bucket };