const Application = require('../models/applicationModel');
const firebaseService = require('../services/firebaseService');
const cvParser = require('../services/cvParser');
const googleSheetsService = require('../services/googleSheetsService');
const webhookService = require('../services/webhookService');
const emailService = require('../services/emailService');

/**
 * Submit a new job application
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with status and data
 */
const submitApplication = async (req, res) => {
  try {
    // Extract data from request
    const { name, email, phone } = req.body;
    const cvFile = req.file;
    
    // Validate application data
    const application = new Application({
      name,
      email,
      phone
    });
    
    // Upload CV to Firebase Storage
    const cvUrl = await firebaseService.uploadFile(
      cvFile.buffer,
      cvFile.originalname,
      cvFile.mimetype
    );
    
    // Update application with CV URL
    application.cvUrl = cvUrl;
    
    // Parse the CV content
    const userInfo = {
      name,
      email,
      phone
    };
    
    const cvData = await cvParser.parseCV(cvFile.buffer, cvFile.mimetype, userInfo);
    application.cvData = cvData;
    
    // Prepare data for Google Sheets
    const sheetData = {
      name,
      email,
      phone,
      cvUrl,
      personalInfo: cvData.personalInfo,
      education: cvData.education,
      qualifications: cvData.qualifications,
      projects: cvData.projects
    };
    
    // Save to Google Sheets
    await googleSheetsService.saveToGoogleSheets(sheetData);
    
    // Send webhook notification
    await webhookService.sendWebhook({
      personalInfo: cvData.personalInfo,
      education: cvData.education,
      qualifications: cvData.qualifications,
      projects: cvData.projects,
      cvUrl,
      timestamp: application.timestamp.toISOString()
    });
    
    // Schedule follow-up email
    await emailService.scheduleFollowUpEmail(email, name);
    
    // Return success response
    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        name,
        email,
        cvUrl
      }
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    
    return res.status(400).json({
      success: false,
      message: error.message || 'Error submitting application',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Get application status by email
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with status and data
 */
const getApplicationStatus = async (req, res) => {
  try {
    const { email } = req.params;
    
    // Here you would normally query a database
    // Since we're using Google Sheets, this is a placeholder
    // In a real implementation, you would query the Google Sheet
    
    return res.status(200).json({
      success: true,
      message: 'Application status retrieved',
      data: {
        email,
        status: 'Under Review', // Placeholder
        submitDate: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting application status:', error);
    
    return res.status(400).json({
      success: false,
      message: error.message || 'Error getting application status'
    });
  }
};

module.exports = {
  submitApplication,
  getApplicationStatus
};