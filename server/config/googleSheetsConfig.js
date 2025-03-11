// config/googleSheetsConfig.js
const { GoogleSpreadsheet } = require('google-spreadsheet');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Safely parse Google service account credentials
let serviceAccount;
try {
  // Parse credentials from environment variable
  serviceAccount = JSON.parse(
    process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS
      .replace(/\\n/g, '\n')   // Replace escaped newlines
      .replace(/^"/, '')        // Remove leading quote if present
      .replace(/"$/, '')        // Remove trailing quote if present
  );

  // Validate required credentials
  const requiredFields = ['client_email', 'private_key', 'project_id'];
  requiredFields.forEach(field => {
    if (!serviceAccount[field]) {
      throw new Error(`Missing required credential field: ${field}`);
    }
  });

  console.log('Google Sheets credentials loaded successfully');
} catch (error) {
  console.error('Error parsing Google service account credentials:', error);
  serviceAccount = null;
}

/**
 * Create a new Google Spreadsheet instance
 * 
 * @returns {GoogleSpreadsheet} Configured Google Spreadsheet instance
 */
const createSpreadsheetInstance = () => {
  if (!serviceAccount) {
    throw new Error('Google service account credentials are not configured');
  }

  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_ID);
  
  return {
    doc,
    authenticate: async () => {
      await doc.useServiceAccountAuth({
        client_email: serviceAccount.client_email,
        private_key: serviceAccount.private_key.replace(/\\n/g, '\n')
      });
      return doc;
    }
  };
};

/**
 * Save data to Google Sheets
 * 
 * @param {Object} data - Data to save
 * @returns {Promise<boolean>} Success status
 */
const saveToGoogleSheets = async (data) => {
  try {
    const { doc, authenticate } = createSpreadsheetInstance();
    
    // Authenticate and load sheet info
    await authenticate();
    await doc.loadInfo();
    
    // Get the first sheet
    const sheet = doc.sheetsByIndex[0];
    
    // Add a new row
    await sheet.addRow(data);
    
    console.log('Data saved to Google Sheets successfully');
    return true;
  } catch (error) {
    console.error('Error saving to Google Sheets:', error);
    throw error;
  }
};

module.exports = {
  createSpreadsheetInstance,
  saveToGoogleSheets
};