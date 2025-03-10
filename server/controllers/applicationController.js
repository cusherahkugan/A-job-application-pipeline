const applicationService = require('../services/applicationService');
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
    await scheduleFollowUpEmail(email, name);

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