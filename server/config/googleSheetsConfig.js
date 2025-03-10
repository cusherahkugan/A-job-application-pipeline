// config/googleSheetsConfig.js
const { GoogleSpreadsheet } = require('google-spreadsheet');
const fs = require('fs');
require('dotenv').config();

// Load credentials from the downloaded key file
let credentials;
try {
  credentials = JSON.parse(fs.readFileSync('./googleSheetsConfig.json'));
} catch (error) {
  console.error('Error loading Google Sheets credentials:', error);
  process.exit(1);
}

// Initialize the Google Sheet
const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);

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