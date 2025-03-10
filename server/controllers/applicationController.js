// controllers/applicationController.js
const applicationService = require('../services/applicationServices');
const { scheduleFollowUpEmail } = require('../services/emailService');

// Controller to handle application submissions
exports.submitApplication = async (req, res) => {
  try {
    // Extract data from request
    const { name, email, phone } = req.body;
    const cvFile = req.file;
    
    if (!name || !email || !phone || !cvFile) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Process the application
    const result = await applicationService.processApplication(name, email, phone, cvFile);
    
    // Schedule follow-up email for the next day
    await scheduleFollowUpEmail(email, name, phone);
    
    return res.status(201).json({
      message: 'Application submitted successfully',
      data: result
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    return res.status(500).json({
      message: 'Failed to process application',
      error: error.message
    });
  }
};

// Test endpoint to check functionality
exports.testSubmission = async (req, res) => {
  try {
    res.status(200).json({
      message: 'Test endpoint working correctly',
      environment: process.env.NODE_ENV,
      webhookUrl: process.env.WEBHOOK_URL?.substring(0, 15) + '...' // Show partial URL for security
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
};