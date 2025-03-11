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
  const getFirebaseServiceAccount = () => {
    // Try to get credentials from full JSON string first
    if (process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS) {
      try {
        console.log('Attempting to use GOOGLE_SERVICE_ACCOUNT_CREDENTIALS');
        return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS);
      } catch (err) {
        console.error('Error parsing GOOGLE_SERVICE_ACCOUNT_CREDENTIALS:', err);
      }
    }
    
    // Fall back to individual credential fields
    console.log('Using individual Firebase credential fields');
    
    // Verify required fields are present
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = formatFirebasePrivateKey(process.env.FIREBASE_PRIVATE_KEY);
    
    if (!projectId || !clientEmail || !privateKey) {
      console.error('Missing required Firebase credentials:',
        !projectId ? 'FIREBASE_PROJECT_ID' : '',
        !clientEmail ? 'FIREBASE_CLIENT_EMAIL' : '',
        !privateKey ? 'FIREBASE_PRIVATE_KEY' : ''
      );
      return null;
    }
    
    // Log key format (for debugging)
    console.log('Private key begins with:', privateKey.substring(0, 27));
    console.log('Private key ends with:', privateKey.substring(privateKey.length - 25));
    
    // Return properly formatted service account
    return {
      type: "service_account",
      project_id: projectId,
      private_key: privateKey,
      client_email: clientEmail
    };
  };
  
  module.exports = {
    formatFirebasePrivateKey,
    getFirebaseServiceAccount
  };