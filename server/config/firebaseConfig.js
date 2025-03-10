const firebase = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Add debugging to check environment variables
console.log("FIREBASE_PROJECT_ID:", process.env.FIREBASE_PROJECT_ID);
console.log("FIREBASE_CLIENT_EMAIL exists:", !!process.env.FIREBASE_CLIENT_EMAIL);
console.log("FIREBASE_PRIVATE_KEY exists:", !!process.env.FIREBASE_PRIVATE_KEY);

// Initialize Firebase with environment variables
if (!firebase.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY 
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') 
      : undefined;
      
    if (!privateKey) {
      console.error("Firebase private key is missing or invalid");
    }
    
    firebase.initializeApp({
      credential: firebase.credential.cert({
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key: privateKey,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
      }),
      storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
    });
    
    console.log("Firebase initialized successfully");
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
}

const bucket = firebase.storage().bucket();

// Function to upload a file to Firebase Storage
async function uploadToFirebase(file) {
  try {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `cvs/${uuidv4()}.${fileExtension}`;
    const fileRef = bucket.file(fileName);
    
    const stream = fileRef.createWriteStream({
      metadata: { contentType: file.mimetype },
      public: true, // Make file publicly accessible
    });

    return new Promise((resolve, reject) => {
      stream.on('error', reject);

      stream.on('finish', async () => {
        await fileRef.makePublic(); // Make file publicly accessible
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        resolve(publicUrl);
      });

      stream.end(file.buffer);
    });
  } catch (error) {
    console.error('Error uploading to Firebase:', error);
    throw error;
  }
}

module.exports = { uploadToFirebase, bucket };