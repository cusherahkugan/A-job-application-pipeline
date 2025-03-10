// services/applicationService.js
const { uploadToFirebase } = require('../config/firebaseConfig');
const { appendToSheet } = require('../config/googleSheetsConfig');
const { extractCvData } = require('../utils/cvParser');
const { sendWebhookNotification } = require('../utils/webhookService');

// Function to process a job application
async function processApplication(name, email, phone, cvFile) {
  // 1. Upload CV to Firebase Storage
  const cvPublicLink = await uploadToFirebase(cvFile);
  
  // 2. Extract data from CV
  const cvData = await extractCvData(cvFile.buffer, cvFile.mimetype);
  
  // 3. Add personal info to CV data
  cvData.personal_info = {
    name,
    email,
    phone
  };
  
  // 4. Append data to Google Sheet
  const sheetData = [
    name,
    email,
    phone,
    cvPublicLink,
    JSON.stringify(cvData.education),
    JSON.stringify(cvData.qualifications),
    JSON.stringify(cvData.projects),
    new Date().toISOString()
  ];
  
  await appendToSheet(sheetData);
  
  // 5. Send webhook notification
  const webhookData = {
    cv_data: {
      personal_info: cvData.personal_info,
      education: cvData.education,
      qualifications: cvData.qualifications,
      projects: cvData.projects,
      cv_public_link: cvPublicLink
    },
    metadata: {
      applicant_name: name,
      email: email,
      status: "testing", 
      cv_processed: true,
      processed_timestamp: new Date().toISOString()
    }
  };
  
  // Determine if this is a test or production submission
  const isTestMode = process.env.NODE_ENV === 'development' || 
                     email.includes('test') || 
                     email.endsWith('@example.com');
  
  await sendWebhookNotification(webhookData, isTestMode);
  
  return {
    cvPublicLink,
    cvData
  };
}

module.exports = {
  processApplication
};