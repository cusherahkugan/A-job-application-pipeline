// config/webhookConfig.js
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Validate webhook configuration
const validateWebhookConfig = () => {
  const requiredVars = [
    'WEBHOOK_URL', 
    'CANDIDATE_EMAIL'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`WARNING: Missing webhook configuration: ${missingVars.join(', ')}`);
  }
};

// Validate configuration on import
validateWebhookConfig();

module.exports = {
  WEBHOOK_URL: process.env.WEBHOOK_URL,
  CANDIDATE_EMAIL: process.env.CANDIDATE_EMAIL
};