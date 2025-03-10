const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

// Function to send webhook notification about processed CV
exports.sendWebhookNotification = async function(data) {
  try {
    const response = await axios.post(
      process.env.WEBHOOK_URL,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Candidate-Email': process.env.CANDIDATE_EMAIL
        }
      }
    );
    
    console.log('Webhook notification sent successfully');
    return response.data;
  } catch (error) {
    console.error('Error sending webhook notification:', error);
    throw error;
  }
};