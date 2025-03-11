const { GoogleSpreadsheet } = require('google-spreadsheet');

// Handle service account credentials safely
let serviceAccount;
try {
  serviceAccount = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS 
    ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS)
    : require('../config/google-credentials.json'); // Fallback to file
} catch (error) {
  console.error('Error parsing Google service account credentials:', error);
  // Provide a minimal placeholder to avoid immediate crashes
  serviceAccount = {
    client_email: 'cv-processor@cv-processor-fc6b9.iam.gserviceaccount.com',
    private_key: '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n'
  };
}

/**
 * Save application data to Google Sheets
 * 
 * @param {Object} data - Application data
 * @returns {Promise<Boolean>} Success status
 */
const saveToGoogleSheets = async (data) => {
  try {
    // Initialize the sheet
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_ID || '1IFH_Z6INfluyVtq7ErthVINDZtOn2UFsDIaeApxQ1r8');
    
    // Authenticate with Google
    await doc.useServiceAccountAuth({
      client_email: serviceAccount.client_email,
      private_key: serviceAccount.private_key,
    });
    
    // Load document properties and sheets
    await doc.loadInfo();
    
    // Get the first sheet or create it if it doesn't exist
    let sheet = doc.sheetsByIndex[0];
    if (!sheet) {
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
    }
    
    // Format the data for the sheet
    const {
      name,
      email,
      phone,
      cvUrl,
      personalInfo,
      education,
      qualifications,
      projects,
      webhookStatus = 'Pending',
      emailStatus = 'Pending'
    } = data;
    
    // Add a row to the sheet
    await sheet.addRow({
      Timestamp: new Date().toISOString(),
      Name: name,
      Email: email,
      Phone: phone,
      'CV Link': cvUrl,
      'Personal Info': JSON.stringify(personalInfo || {}),
      Education: JSON.stringify(education || []),
      Qualifications: JSON.stringify(qualifications || []),
      Projects: JSON.stringify(projects || []),
      'Webhook Status': webhookStatus,
      'Email Status': emailStatus
    });
    
    return true;
  } catch (error) {
    console.error('Error saving to Google Sheets:', error);
    throw new Error('Failed to save data to Google Sheets');
  }
};

/**
 * Get all pending emails to be sent
 * 
 * @returns {Promise<Array>} Pending emails
 */
const getPendingEmails = async () => {
  try {
    // Initialize the sheet
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_ID);
    
    // Authenticate with Google
    await doc.useServiceAccountAuth({
      client_email: serviceAccount.client_email,
      private_key: serviceAccount.private_key,
    });
    
    // Load document properties and sheets
    await doc.loadInfo();
    
    // Get the first sheet
    const sheet = doc.sheetsByIndex[0];
    if (!sheet) {
      return [];
    }
    
    // Get all rows
    const rows = await sheet.getRows();
    
    // Filter rows with pending email status
    const pendingEmails = rows
      .filter(row => row['Email Status'] === 'Pending')
      .map(row => ({
        rowIndex: row._rowNumber - 2, // Adjust for 0-indexing and header row
        name: row.Name,
        email: row.Email,
        timestamp: row.Timestamp
      }));
    
    return pendingEmails;
  } catch (error) {
    console.error('Error getting pending emails:', error);
    throw new Error('Failed to get pending emails from Google Sheets');
  }
};

/**
 * Update email status in Google Sheets
 * 
 * @param {Number} rowIndex - Row index
 * @param {String} status - New email status
 * @returns {Promise<Boolean>} Success status
 */
const updateEmailStatus = async (rowIndex, status) => {
  try {
    // Initialize the sheet
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_ID);
    
    // Authenticate with Google
    await doc.useServiceAccountAuth({
      client_email: serviceAccount.client_email,
      private_key: serviceAccount.private_key,
    });
    
    // Load document properties and sheets
    await doc.loadInfo();
    
    // Get the first sheet
    const sheet = doc.sheetsByIndex[0];
    if (!sheet) {
      return false;
    }
    
    // Get all rows
    const rows = await sheet.getRows();
    
    // Update the specific row
    if (rows[rowIndex]) {
      rows[rowIndex]['Email Status'] = status;
      await rows[rowIndex].save();
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error updating email status:', error);
    throw new Error('Failed to update email status in Google Sheets');
  }
};

/**
 * Update webhook status in Google Sheets
 * 
 * @param {String} email - Applicant email
 * @param {String} status - New webhook status
 * @returns {Promise<Boolean>} Success status
 */
const updateWebhookStatus = async (email, status) => {
  try {
    // Initialize the sheet
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_ID);
    
    // Authenticate with Google
    await doc.useServiceAccountAuth({
      client_email: serviceAccount.client_email,
      private_key: serviceAccount.private_key,
    });
    
    // Load document properties and sheets
    await doc.loadInfo();
    
    // Get the first sheet
    const sheet = doc.sheetsByIndex[0];
    if (!sheet) {
      return false;
    }
    
    // Get all rows
    const rows = await sheet.getRows();
    
    // Find and update the specific row
    for (const row of rows) {
      if (row.Email === email) {
        row['Webhook Status'] = status;
        await row.save();
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error updating webhook status:', error);
    throw new Error('Failed to update webhook status in Google Sheets');
  }
};

module.exports = {
  saveToGoogleSheets,
  getPendingEmails,
  updateEmailStatus,
  updateWebhookStatus
};