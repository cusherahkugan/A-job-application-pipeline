// config/sendgridConfig.js
const sgMail = require('@sendgrid/mail');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Validate SendGrid API key
if (!process.env.SENDGRID_API_KEY) {
  console.warn('WARNING: SendGrid API key is not set in environment variables');
}

// Set SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Default email sender address
const DEFAULT_FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@yourdomain.com';

module.exports = {
  sgMail,
  DEFAULT_FROM_EMAIL
};