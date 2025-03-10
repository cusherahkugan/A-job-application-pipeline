// services/emailService.js
const sgMail = require('@sendgrid/mail');
const moment = require('moment-timezone');
require('dotenv').config();

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Function to guess timezone from phone number (simplified)
function guessTimezone(phone) {
  // This is a very simplified approach - in a real implementation,
  // you would use a more sophisticated method or a third-party service
  
  // Default to UTC
  let timezone = 'UTC';
  
  // Look for country codes
  if (phone.startsWith('+1')) {
    timezone = 'America/New_York'; // US
  } else if (phone.startsWith('+44')) {
    timezone = 'Europe/London'; // UK
  } else if (phone.startsWith('+91')) {
    timezone = 'Asia/Kolkata'; // India
  } else if (phone.startsWith('+94')) {
    timezone = 'Asia/Colombo'; // Sri Lanka
  } else if (phone.startsWith('+61')) {
    timezone = 'Australia/Sydney'; // Australia
  } else if (phone.startsWith('+49')) {
    timezone = 'Europe/Berlin'; // Germany
  } else if (phone.startsWith('+33')) {
    timezone = 'Europe/Paris'; // France
  } else if (phone.startsWith('+81')) {
    timezone = 'Asia/Tokyo'; // Japan
  } else if (phone.startsWith('+86')) {
    timezone = 'Asia/Shanghai'; // China
  }
  
  return timezone;
}

// Function to schedule follow-up email for the next day
async function scheduleFollowUpEmail(email, name, phone) {
  try {
    // Get timezone from phone number
    const timezone = guessTimezone(phone);
    
    // Calculate next day at 10:00 AM in recipient's timezone
    const tomorrow = moment().tz(timezone).add(1, 'days').hour(10).minute(0).second(0);
    
    // Calculate delay in milliseconds
    const now = moment();
    const delayMs = tomorrow.diff(now);
    
    // Prepare email
    const msg = {
      to: email,
      from: process.env.EMAIL_FROM,
      subject: 'Your Job Application - Under Review',
      text: `Dear ${name},

Thank you for submitting your application. We are pleased to inform you that your CV is currently under review by our team.

We appreciate your interest in joining our company and will get back to you as soon as possible with an update on your application status.

Best regards,
HR Team`,
      html: `<p>Dear ${name},</p>
<p>Thank you for submitting your application. We are pleased to inform you that your CV is currently under review by our team.</p>
<p>We appreciate your interest in joining our company and will get back to you as soon as possible with an update on your application status.</p>
<p>Best regards,<br>HR Team</p>`
    };
    
    // Schedule email
    setTimeout(async () => {
      try {
        await sgMail.send(msg);
        console.log(`Follow-up email sent to ${email}`);
      } catch (err) {
        console.error('Error sending follow-up email:', err);
      }
    }, delayMs);
    
    console.log(`Follow-up email scheduled for ${tomorrow.format()} (${timezone})`);
    return true;
  } catch (error) {
    console.error('Error scheduling follow-up email:', error);
    throw error;
  }
}

// Function to send a test email immediately
async function sendTestEmail(email, name) {
  try {
    const msg = {
      to: email,
      from: process.env.EMAIL_FROM,
      subject: 'Test Email - Job Application System',
      text: `Dear ${name},
      
This is a test email from the job application system. If you received this, the email functionality is working correctly.

Best regards,
HR Team`,
      html: `<p>Dear ${name},</p>
<p>This is a test email from the job application system. If you received this, the email functionality is working correctly.</p>
<p>Best regards,<br>HR Team</p>`
    };
    
    await sgMail.send(msg);
    console.log(`Test email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending test email:', error);
    throw error;
  }
}

module.exports = {
  scheduleFollowUpEmail,
  sendTestEmail
};