// controllers/applicationController.js
const Application = require('../models/applicationModel');
const firebaseService = require('../services/firebaseService');
const cvParser = require('../services/cvParser');
const googleSheetsService = require('../services/googleSheetsService');
const webhookService = require('../services/webhookService');
const emailService = require('../services/emailService');

/**
 * Submit a new job application
 * 
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @returns {Object} Response
 */
const submitApplication = async (req, res) => {
  console.log('Processing application submission');
  
  // Log request details (for debugging)
  console.log('Request body:', req.body);
  console.log('File info:', req.file ? {
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size
  } : 'No file');
  
  try {
    // Check if the file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'CV file is required'
      });
    }
    
    // Extract data from request
    const { name, email, phone } = req.body;
    
    // Validate required fields
    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, email, and phone are required'
      });
    }
    
    // Create application instance for validation
    const application = new Application({
      name,
      email,
      phone
    });
    
    console.log('Validated application data:', application.toObject());
    
    // Upload CV to Firebase Storage
    console.log('Uploading CV to Firebase Storage...');
    const cvUrl = await firebaseService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );
    
    console.log('CV uploaded successfully. URL:', cvUrl);
    
    // Parse CV content
    console.log('Parsing CV content...');
    const userInfo = {
      name,
      email,
      phone
    };
    
    const cvData = await cvParser.parseCV(req.file.buffer, req.file.mimetype, userInfo);
    
    // Update application with CV URL and data
    application.cvUrl = cvUrl;
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
    console.log('Saving to Google Sheets...');
    await googleSheetsService.saveToGoogleSheets(sheetData);
    
    // Send webhook notification
    console.log('Sending webhook notification...');
    const webhookResult = await webhookService.sendWebhook({
      personalInfo: cvData.personalInfo,
      education: cvData.education,
      qualifications: cvData.qualifications,
      projects: cvData.projects,
      cvUrl,
      timestamp: application.timestamp.toISOString()
    }, "testing");
    
    console.log('Webhook notification result:', webhookResult.success ? 'Success' : 'Failed');
    
    // Schedule follow-up email
    console.log('Scheduling follow-up email...');
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
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @returns {Object} Response
 */
const getApplicationStatus = async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email parameter is required'
      });
    }
    
    // Simple placeholder implementation
    // In a real app, you would query a database or Google Sheets
    
    return res.status(200).json({
      success: true,
      message: 'Application status retrieved',
      data: {
        email,
        status: 'Under Review',
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