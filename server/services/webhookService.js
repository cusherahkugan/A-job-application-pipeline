const axios = require('axios');
const { updateWebhookStatus } = require('./googleSheetsService');

/**
 * Send webhook notification with CV data
 * 
 * @param {Object} data - CV data and metadata
 * @param {String} status - Submission status (testing/prod)
 * @returns {Promise<Object>} Webhook response
 */
const sendWebhook = async (data, status = 'prod') => {
  try {
    const {
      personalInfo,
      education,
      qualifications,
      projects,
      cvUrl,
      timestamp = new Date().toISOString()
    } = data;
    
    // Construct webhook payload
    const payload = {
      cv_data: {
        personal_info: personalInfo,
        education: education,
        qualifications: qualifications,
        projects: projects,
        cv_public_link: cvUrl
      },
      metadata: {
        applicant_name: personalInfo.name,
        email: personalInfo.email,
        status: status, // 'testing' or 'prod'
        cv_processed: true,
        processed_timestamp: timestamp
      }
    };
    
    // Send webhook
    const response = await axios.post(
      process.env.WEBHOOK_URL,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Candidate-Email': process.env.CANDIDATE_EMAIL
        }
      }
    );
    
    // Update webhook status in Google Sheets
    await updateWebhookStatus(personalInfo.email, 'Sent');
    
    return {
      success: true,
      statusCode: response.status,
      data: response.data
    };
  } catch (error) {
    console.error('Error sending webhook:', error);
    
    // Update webhook status in Google Sheets if possible
    if (data && data.personalInfo && data.personalInfo.email) {
      await updateWebhookStatus(data.personalInfo.email, 'Failed');
    }
    
    throw new Error('Failed to send webhook notification');
  }
};

module.exports = {
  sendWebhook
};