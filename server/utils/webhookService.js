// utils/webhookService.js
const axios = require('axios');
require('dotenv').config();

// Constants
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const CANDIDATE_EMAIL = process.env.CANDIDATE_EMAIL;

// Function to send webhook notification
async function sendWebhookNotification(data, isTest = false) {
  try {
    // Set submission status based on whether this is a test
    if (isTest) {
      data.metadata.status = 'testing';
    } else {
      data.metadata.status = 'prod';
    }
    
    // Make POST request to webhook endpoint
    const response = await axios.post(WEBHOOK_URL, data, {
      headers: {
        'Content-Type': 'application/json',
        'X-Candidate-Email': CANDIDATE_EMAIL // Use the candidate's email as identifier
      }
    });
    
    console.log('Webhook notification sent successfully:', response.status);
    return response.data;
  } catch (error) {
    console.error('Error sending webhook notification:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  sendWebhookNotification
};