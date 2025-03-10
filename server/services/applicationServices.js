const { s3, textract, bucketName } = require('../config/awsconfig');
const { appendToSheet } = require('../config/googleSheetsConfig');
const { extractCvData } = require('../utils/cvParser');
const { sendWebhookNotification } = require('../utils/WebhookService');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Function to upload file to S3
async function uploadToS3(file) {
  const fileExtension = path.extname(file.originalname);
  const fileName = `${uuidv4()}${fileExtension}`;
  
  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read' // Make file publicly accessible
  };

  const uploadResult = await s3.upload(params).promise();
  return uploadResult.Location; // Return the public URL
}

// Function to process a job application
exports.processApplication = async (name, email, phone, cvFile) => {
  // 1. Upload CV to S3
  const cvPublicLink = await uploadToS3(cvFile);
  
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
      status: "prod", // Change to "testing" during development
      cv_processed: true,
      processed_timestamp: new Date().toISOString()
    }
  };
  
  await sendWebhookNotification(webhookData);
  
  return {
    cvPublicLink,
    cvData
  };
};