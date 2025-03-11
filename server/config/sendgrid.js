const sgMail = require('@sendgrid/mail');

// Set SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Default email sender address
const DEFAULT_FROM_EMAIL = process.env.EMAIL_FROM || 'cusherahkugan@gmail.com';

module.exports = {
  sgMail,
  DEFAULT_FROM_EMAIL
};