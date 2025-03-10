const { google } = require('googleapis');
const sheets = google.sheets('v4');

// Load service account credentials
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

// Create client
async function getGoogleSheetsClient() {
  const authClient = await auth.getClient();
  return google.sheets({ version: 'v4', auth: authClient });
}

// Function to append data to Google Sheet
async function appendToSheet(values) {
  const client = await getGoogleSheetsClient();
  
  return client.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range: 'Sheet1!A1', // Assuming first sheet
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    resource: {
      values: [values]
    }
  });
}

module.exports = {
  appendToSheet
};