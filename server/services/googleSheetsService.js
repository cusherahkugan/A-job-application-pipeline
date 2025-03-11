// services/googleSheetsService.js
const { GoogleSpreadsheet } = require('google-spreadsheet');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Parse and validate service account credentials
 * @returns {Object} Service account credentials
 */
const getServiceAccountCredentials = () => {
  try {
    // First try to get credentials from JSON string in environment variable
    if (process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS) {
      let credentials;
      try {
        credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS);
      } catch (parseError) {
        console.error('Error parsing GOOGLE_SERVICE_ACCOUNT_CREDENTIALS as JSON:', parseError);
        credentials = null;
      }

      if (credentials && credentials.client_email && credentials.private_key) {
        console.log('Using Google credentials from environment variable');
        return credentials;
      }
    }

    // Fallback to individual environment variables
    if (process.env.GOOGLE_SHEETS_CLIENT_EMAIL && process.env.GOOGLE_SHEETS_PRIVATE_KEY) {
      console.log('Using Google credentials from individual environment variables');
      return {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n')
      };
    }

    // Last resort - use Firebase service account if it exists
    if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      console.log('Using Firebase service account credentials for Google Sheets');
      return {
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      };
    }

    console.error('No valid Google service account credentials found');
    return null;
  } catch (error) {
    console.error('Error processing Google service account credentials:', error);
    return null;
  }
};

/**
 * Create a Google Sheets instance
 * @returns {Promise<GoogleSpreadsheet>} Google Sheet document instance
 */
const getGoogleSheet = async () => {
  try {
    const sheetId = process.env.GOOGLE_SHEETS_ID;
    if (!sheetId) {
      throw new Error('Google Sheets ID is not defined');
    }

    const credentials = getServiceAccountCredentials();
    if (!credentials) {
      throw new Error('Google service account credentials not available');
    }

    // Create a new document
    const doc = new GoogleSpreadsheet(sheetId);
    
    // Authenticate
    await doc.useServiceAccountAuth({
      client_email: credentials.client_email,
      private_key: credentials.private_key,
    });
    
    // Load document info
    await doc.loadInfo();
    
    return doc;
  } catch (error) {
    console.error('Error creating Google Sheets instance:', error);
    throw new Error(`Failed to initialize Google Sheets: ${error.message}`);
  }
};

/**
 * Get or create the applications sheet
 * @param {GoogleSpreadsheet} doc - Google Sheets document
 * @returns {Promise<Object>} Sheet object
 */
const getOrCreateApplicationsSheet = async (doc) => {
  try {
    // Try to get the first sheet
    let sheet = doc.sheetsByIndex[0];
    
    // If no sheet exists or it's not properly set up, create a new one
    if (!sheet || !sheet.headerValues || sheet.headerValues.length < 5) {
      // Archive the old sheet if it exists but doesn't have the right headers
      if (sheet) {
        await sheet.updateProperties({ title: `Archive-${new Date().toISOString()}` });
      }
      
      // Create a new sheet with proper headers
      sheet = await doc.addSheet({
        title: 'Applications',
        headerValues: [
          'Timestamp',
          'Name',
          'Email',
          'Phone',
          'CV Link',
          'Personal Info',
          'Education',
          'Qualifications',
          'Projects',
          'Webhook Status',
          'Email Status'
        ],
      });
      
      console.log('Created new Applications sheet with proper headers');
    }
    
    return sheet;
  } catch (error) {
    console.error('Error getting or creating Applications sheet:', error);
    throw error;
  }
};

/**
 * Save application data to Google Sheets
 * @param {Object} data - Application data
 * @returns {Promise<Boolean>} Success status
 */
const saveToGoogleSheets = async (data) => {
  try {
    // Get Google Sheet document
    const doc = await getGoogleSheet();
    
    // Get or create Applications sheet
    const sheet = await getOrCreateApplicationsSheet(doc);
    
    // Format the data
    const rowData = {
      Timestamp: new Date().toISOString(),
      Name: data.name || '',
      Email: data.email || '',
      Phone: data.phone || '',
      'CV Link': data.cvUrl || '',
      'Personal Info': JSON.stringify(data.personalInfo || {}),
      Education: JSON.stringify(data.education || []),
      Qualifications: JSON.stringify(data.qualifications || []),
      Projects: JSON.stringify(data.projects || []),
      'Webhook Status': data.webhookStatus || 'Pending',
      'Email Status': data.emailStatus || 'Pending'
    };
    
    // Add the row
    const result = await sheet.addRow(rowData);
    
    console.log('Successfully saved data to Google Sheets');
    return true;
  } catch (error) {
    console.error('Error saving to Google Sheets:', error);
    
    // Attempt to save to a local file as fallback
    try {
      const fs = require('fs');
      const localData = JSON.stringify({
        timestamp: new Date().toISOString(),
        data
      }, null, 2);
      
      fs.writeFileSync(
        path.resolve(process.cwd(), 'fallback-data.json'),
        localData
      );
      
      console.log('Saved data to fallback local file');
    } catch (fallbackError) {
      console.error('Failed to save fallback data:', fallbackError);
    }
    
    // Re-throw the original error
    throw new Error(`Failed to save data to Google Sheets: ${error.message}`);
  }
};

/**
 * Get pending emails to be sent
 * @returns {Promise<Array>} List of pending emails
 */
const getPendingEmails = async () => {
  try {
    // Get Google Sheet document
    const doc = await getGoogleSheet();
    
    // Get Applications sheet
    const sheet = doc.sheetsByIndex[0];
    if (!sheet) {
      return [];
    }
    
    // Get rows
    const rows = await sheet.getRows();
    
    // Filter for pending emails
    const pendingEmails = rows
      .filter(row => row['Email Status'] === 'Pending')
      .map((row, index) => ({
        rowIndex: index,
        name: row.Name || '',
        email: row.Email || '',
        timestamp: row.Timestamp || new Date().toISOString()
      }));
    
    return pendingEmails;
  } catch (error) {
    console.error('Error getting pending emails:', error);
    return [];
  }
};

/**
 * Update email status in Google Sheets
 * @param {Number} rowIndex - Row index
 * @param {String} status - New status
 * @returns {Promise<Boolean>} Success status
 */
const updateEmailStatus = async (rowIndex, status) => {
  try {
    // Get Google Sheet document
    const doc = await getGoogleSheet();
    
    // Get Applications sheet
    const sheet = doc.sheetsByIndex[0];
    if (!sheet) {
      return false;
    }
    
    // Get rows
    const rows = await sheet.getRows();
    
    // Update status if row exists
    if (rows[rowIndex]) {
      rows[rowIndex]['Email Status'] = status;
      await rows[rowIndex].save();
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error updating email status:', error);
    return false;
  }
};

/**
 * Update webhook status in Google Sheets
 * @param {String} email - Applicant email
 * @param {String} status - New status
 * @returns {Promise<Boolean>} Success status
 */
const updateWebhookStatus = async (email, status) => {
  try {
    // Get Google Sheet document
    const doc = await getGoogleSheet();
    
    // Get Applications sheet
    const sheet = doc.sheetsByIndex[0];
    if (!sheet) {
      return false;
    }
    
    // Get rows
    const rows = await sheet.getRows();
    
    // Find row with matching email
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].Email === email) {
        rows[i]['Webhook Status'] = status;
        await rows[i].save();
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error updating webhook status:', error);
    return false;
  }
};

module.exports = {
  saveToGoogleSheets,
  getPendingEmails,
  updateEmailStatus,
  updateWebhookStatus
};