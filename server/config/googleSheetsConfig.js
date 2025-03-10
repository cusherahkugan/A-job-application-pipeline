// config/googleSheetsConfig.js
const { GoogleSpreadsheet } = require('google-spreadsheet');
require('dotenv').config();

let credentials;
try {
  // Parse credentials from environment variable
  credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS);
  console.log("Google credentials loaded successfully");
} catch (error) {
  console.error('Error parsing Google service account credentials:', error);
  process.exit(1);
}

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_ID);

// Function to append data to the Google Sheet
async function appendToSheet(rowData) {
  try {
    // Authenticate with Google
    await doc.useServiceAccountAuth(credentials);
    
    // Load sheet info
    await doc.loadInfo();
    
    // Select the first sheet
    const sheet = doc.sheetsByIndex[0];
    
    // Make sure headers exist, if not add them
    const rows = await sheet.getRows();
    if (rows.length === 0) {
      // Add headers if sheet is empty
      await sheet.setHeaderRow([
        'Name', 
        'Email', 
        'Phone', 
        'CV Link', 
        'Education', 
        'Qualifications', 
        'Projects',
        'Timestamp'
      ]);
    }
    
    // Append the new row
    await sheet.addRow(rowData);
    
    console.log('Data added to Google Sheet successfully');
    return true;
  } catch (error) {
    console.error('Error adding data to Google Sheet:', error);
    throw error;
  }
}

module.exports = {
  appendToSheet
};