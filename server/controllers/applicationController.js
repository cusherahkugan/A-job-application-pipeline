// controllers/applicationController.js
const Application = require('../models/applicationModel');
const storageService = require('../services/storageService');
const cvParser = require('../services/cvParser');
const path = require('path');
const fs = require('fs');

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
    
    // Upload CV using our unified storage service (with Firebase + local fallback)
    console.log('Uploading CV...');
    const cvUrl = await storageService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );
    
    console.log('CV uploaded successfully. URL:', cvUrl);
    
    // Basic user info
    const userInfo = {
      name,
      email,
      phone
    };
    
    // Parse CV content (if available)
    let cvData = {
      personalInfo: { 
        name,
        email,
        phone
      },
      education: [{ institution: "Not extracted", degree: "Not extracted" }],
      qualifications: [{ skill: "Not extracted" }],
      projects: [{ name: "Not extracted", description: "Not extracted" }]
    };
    
    try {
      if (typeof cvParser.parseCV === 'function') {
        cvData = await cvParser.parseCV(req.file.buffer, req.file.mimetype, userInfo);
        console.log('CV parsed successfully');
      }
    } catch (parseError) {
      console.error('Error parsing CV:', parseError);
      // Continue with default data
    }
    
    // Update application with CV URL and data
    application.cvUrl = cvUrl;
    application.cvData = cvData;
    
    // Save application data to local JSON file
    const applicationsDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(applicationsDir)) {
      fs.mkdirSync(applicationsDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const jsonFilePath = path.join(applicationsDir, `application-${email}-${timestamp}.json`);
    
    fs.writeFileSync(
      jsonFilePath, 
      JSON.stringify({
        name,
        email,
        phone,
        cvUrl,
        timestamp: new Date().toISOString(),
        personalInfo: cvData.personalInfo,
        education: cvData.education,
        qualifications: cvData.qualifications,
        projects: cvData.projects
      }, null, 2)
    );
    
    console.log(`Application data saved to ${jsonFilePath}`);
    
    // Try to send webhook (if available)
    try {
      if (typeof require('../services/webhookService').sendWebhook === 'function') {
        const webhookService = require('../services/webhookService');
        await webhookService.sendWebhook({
          personalInfo: cvData.personalInfo,
          education: cvData.education,
          qualifications: cvData.qualifications,
          projects: cvData.projects,
          cvUrl,
          timestamp: application.timestamp.toISOString()
        }, "testing");
        console.log('Webhook notification sent');
      }
    } catch (webhookError) {
      console.error('Error sending webhook (non-fatal):', webhookError);
    }
    
    // Try to schedule follow-up email (if available)
    try {
      if (typeof require('../services/emailService').scheduleFollowUpEmail === 'function') {
        const emailService = require('../services/emailService');
        await emailService.scheduleFollowUpEmail(email, name);
        console.log('Follow-up email scheduled');
      }
    } catch (emailError) {
      console.error('Error scheduling email (non-fatal):', emailError);
    }
    
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
    
    // Try to find application data in local JSON file
    const applicationsDir = path.join(process.cwd(), 'data');
    let status = 'Not Found';
    let submitDate = null;
    
    if (fs.existsSync(applicationsDir)) {
      const files = fs.readdirSync(applicationsDir);
      
      // Find files that match this email
      const matchingFiles = files.filter(file => 
        file.includes(email) && file.endsWith('.json')
      );
      
      if (matchingFiles.length > 0) {
        // Sort by most recent
        matchingFiles.sort().reverse();
        
        // Read the most recent file
        const latestFile = path.join(applicationsDir, matchingFiles[0]);
        const appData = JSON.parse(fs.readFileSync(latestFile, 'utf8'));
        
        status = 'Under Review';
        submitDate = appData.timestamp;
      }
    }
    
    return res.status(200).json({
      success: true,
      message: 'Application status retrieved',
      data: {
        email,
        status,
        submitDate: submitDate || new Date().toISOString()
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
