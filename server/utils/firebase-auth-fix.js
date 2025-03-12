// firebase-auth-fix.js
// This is a utility to properly format and fix the Firebase private key

/**
 * Clean and properly format the Firebase private key
 * This is critical for JWT authentication to work correctly
 * 
 * @param {string} key - The Firebase private key from environment variable
 * @returns {string} Properly formatted private key
 */
const formatFirebasePrivateKey = (key) => {
    if (!key) return null;
    
    // First, replace any escaped newlines with actual newlines
    let formattedKey = key.replace(/\\n/g, '\n');
    
    // Remove any surrounding quotes added by .env parsing
    formattedKey = formattedKey.replace(/^["']/, '').replace(/["']$/, '');
    
    // Ensure key has the proper format
    if (!formattedKey.includes('-----BEGIN PRIVATE KEY-----')) {
      formattedKey = `-----BEGIN PRIVATE KEY-----\n${formattedKey}`;
    }
    
    if (!formattedKey.includes('-----END PRIVATE KEY-----')) {
      formattedKey = `${formattedKey}\n-----END PRIVATE KEY-----`;
    }
    
    return formattedKey.trim();
  };
  
  /**
   * Generate a properly formatted service account credential object
   * 
   * @returns {Object} Firebase service account credentials
   */
// utils/firebase-auth-fix.js
const getFirebaseServiceAccount = () => {
    try {
      // Get service account from environment variables
      if (process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS) {
        // If JSON string is provided in env var
        return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS);
      } else {
        // If individual credentials are provided
        return {
          type: "service_account",
          project_id: process.env.FIREBASE_PROJECT_ID,
          private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
          private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          client_id: process.env.FIREBASE_CLIENT_ID,
          auth_uri: "https://accounts.google.com/o/oauth2/auth",
          token_uri: "https://oauth2.googleapis.com/token",
          auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
          client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL)}`,
          universe_domain: "googleapis.com"
        };
      }
    } catch (error) {
      console.error('Error getting Firebase service account credentials:', error);
      return null;
    }
  };
  
  module.exports = { getFirebaseServiceAccount };
  
  module.exports = {
    formatFirebasePrivateKey,
    getFirebaseServiceAccount
  };