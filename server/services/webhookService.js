// services/webhookService.js
const axios = require('axios');
const { updateWebhookStatus } = require('./googleSheetsService');

/**
 * Send webhook notification with CV data
 * 
 * @param {Object} data - CV data
 * @param {String} status - Submission status ('testing' or 'prod')
 * @returns {Promise<Object>} Webhook response
 */
const sendWebhook = async (data, status = 'testing') => {
  try {
    if (!process.env.WEBHOOK_URL) {
      console.warn('Warning: WEBHOOK_URL is not configured in environment variables');
      return { success: false, message: 'Webhook URL not configured' };
    }

    if (!process.env.CANDIDATE_EMAIL) {
      console.warn('Warning: CANDIDATE_EMAIL is not configured in environment variables');
      return { success: false, message: 'Candidate email not configured' };
    }

    const {
      personalInfo,
      education,
      qualifications,
      projects,
      cvUrl,
      timestamp = new Date().toISOString()
    } = data;
    
    // Ensure all required data is present
    if (!personalInfo || !personalInfo.email) {
      throw new Error('Invalid data structure: personalInfo.email is required');
    }
    
    // Format payload according to the required structure
    const payload = {
      cv_data: {
        personal_info: personalInfo || {},
        education: education || [],
        qualifications: qualifications || [],
        projects: projects || [],
        cv_public_link: cvUrl || ''
      },
      metadata: {
        applicant_name: personalInfo.name || '',
        email: personalInfo.email || '',
        status: status, // 'testing' or 'prod'
        cv_processed: true,
        processed_timestamp: timestamp
      }
    };
    
    console.log('Sending webhook to:', process.env.WEBHOOK_URL);
    console.log('Webhook payload:', JSON.stringify(payload, null, 2));
    
    // Send webhook request
    const response = await axios.post(
      process.env.WEBHOOK_URL,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Candidate-Email': process.env.CANDIDATE_EMAIL
        },
        timeout: 10000 // 10 second timeout
      }
    );
    
    console.log('Webhook response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });
    
    // Update status in Google Sheets
    try {
      await updateWebhookStatus(personalInfo.email, 'Sent');
    } catch (updateError) {
      console.error('Error updating webhook status in Google Sheets:', updateError);
    }
    
    return {
      success: true,
      statusCode: response.status,
      data: response.data
    };
  } catch (error) {
    console.error('Error sending webhook:', error.message);
    
    // Try to update webhook status in Google Sheets
    if (data && data.personalInfo && data.personalInfo.email) {
      try {
        await updateWebhookStatus(data.personalInfo.email, 'Failed');
      } catch (updateError) {
        console.error('Error updating webhook status after failure:', updateError);
      }
    }
    
    // Return error information
    return {
      success: false,
      message: error.message,
      error: error
    };
  }
};

module.exports = {
  sendWebhook
};