const { sgMail, DEFAULT_FROM_EMAIL } = require('../config/sendgrid');
const { getPendingEmails, updateEmailStatus } = require('./googleSheetsService');
const { parseTimeZone } = require('../utils/timezoneUtils');

/**
 * Send follow-up email to applicant
 * 
 * @param {String} to - Recipient email address
 * @param {String} name - Recipient name
 * @returns {Promise<Object>} Email response
 */
const sendFollowUpEmail = async (to, name) => {
  try {
    const msg = {
      to,
      from: DEFAULT_FROM_EMAIL,
      subject: 'Your Application at Metana - Under Review',
      text: `Dear ${name},\n\nThank you for applying to Metana. We have received your CV and it is currently under review by our team.\n\nWe appreciate your interest in joining us and will get back to you shortly regarding the next steps in the application process.\n\nBest regards,\nThe Metana Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #333;">Your Application is Under Review</h2>
          </div>
          
          <p>Dear ${name},</p>
          
          <p>Thank you for applying to <strong>Metana</strong>. We have received your CV and it is currently under review by our team.</p>
          
          <p>We appreciate your interest in joining us and will get back to you shortly regarding the next steps in the application process.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; font-style: italic;">If you have any questions, please don't hesitate to reach out to us.</p>
          </div>
          
          <p>Best regards,<br>The Metana Team</p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #888;">
            <p>This is an automated message, please do not reply directly to this email.</p>
          </div>
        </div>
      `
    };
    
    const response = await sgMail.send(msg);
    return response;
  } catch (error) {
    console.error('Error sending follow-up email:', error);
    throw new Error('Failed to send follow-up email');
  }
};

/**
 * Schedule follow-up email for the next day
 * 
 * @param {String} to - Recipient email address
 * @param {String} name - Recipient name
 * @returns {Promise<Boolean>} Success status
 */
const scheduleFollowUpEmail = async (to, name) => {
  try {
    // Add to Google Sheets with pending email status
    // This will be picked up by the scheduled task
    return true;
  } catch (error) {
    console.error('Error scheduling follow-up email:', error);
    throw new Error('Failed to schedule follow-up email');
  }
};

/**
 * Send scheduled follow-up emails
 * 
 * @returns {Promise<Number>} Number of emails sent
 */
const sendScheduledFollowUpEmails = async () => {
  try {
    // Get all pending emails from Google Sheets
    const pendingEmails = await getPendingEmails();
    let sentCount = 0;
    
    // Process each pending email
    for (const { rowIndex, name, email, timestamp } of pendingEmails) {
      try {
        // Check if it's been at least 24 hours since the application
        const applicationDate = new Date(timestamp);
        const now = new Date();
        const hoursDifference = (now - applicationDate) / (1000 * 60 * 60);
        
        if (hoursDifference >= 24) {
          // Determine appropriate time to send based on timezone (defaulting to a safe time)
          const safeHour = parseTimeZone(email);
          const currentHour = now.getHours();
          
          // Only send if it's between 9 AM and 5 PM in the recipient's estimated timezone
          if (currentHour >= safeHour.start && currentHour <= safeHour.end) {
            // Send the email
            await sendFollowUpEmail(email, name);
            
            // Update status in Google Sheets
            await updateEmailStatus(rowIndex, 'Sent');
            
            sentCount++;
          }
        }
      } catch (emailError) {
        console.error(`Error processing email for ${email}:`, emailError);
        // Update status to show the error
        await updateEmailStatus(rowIndex, 'Failed');
      }
    }
    
    return sentCount;
  } catch (error) {
    console.error('Error sending scheduled follow-up emails:', error);
    throw new Error('Failed to send scheduled follow-up emails');
  }
};

module.exports = {
  sendFollowUpEmail,
  scheduleFollowUpEmail,
  sendScheduledFollowUpEmails
};