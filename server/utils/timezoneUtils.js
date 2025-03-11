/**
 * Estimate a safe time window to send emails based on email domain or phone country code
 * 
 * @param {String} email - Email address to analyze
 * @param {String} phone - Phone number with country code (optional)
 * @returns {Object} Time window with start and end hours
 */
const parseTimeZone = (email, phone = '') => {
    // Default safe window (9 AM to 5 PM)
    const defaultWindow = {
      start: 9, 
      end: 17
    };
    
    try {
      // Extract domain from email
      const domain = email.split('@')[1].toLowerCase();
      
      // Major email domain mapping to regions (very simplified)
      const domainMapping = {
        // Indian domains
        'gmail.co.in': 'India',
        'yahoo.co.in': 'India',
        'rediffmail.com': 'India',
        // UK domains
        'gmail.co.uk': 'UK',
        'yahoo.co.uk': 'UK',
        // US domains generally don't have geographical identifiers
      };
      
      // Country code mapping (if available)
      const phoneMapping = {
        '+1': 'US',
        '+44': 'UK',
        '+91': 'India',
        '+61': 'Australia',
        '+64': 'New Zealand',
        '+81': 'Japan',
        '+86': 'China'
      };
      
      // Time zone windows (approximate hours that would be 9 AM to 5 PM local time)
      const timeZoneWindows = {
        'US': { start: 14, end: 22 },       // Assuming EST (UTC-5)
        'UK': { start: 9, end: 17 },        // Assuming GMT/BST
        'India': { start: 3, end: 11 },     // Assuming IST (UTC+5:30)
        'Australia': { start: 23, end: 7 }, // Assuming AEST (UTC+10)
        'New Zealand': { start: 21, end: 5 },// Assuming NZST (UTC+12)
        'Japan': { start: 0, end: 8 },      // Assuming JST (UTC+9)
        'China': { start: 1, end: 9 }       // Assuming CST (UTC+8)
      };
      
      // Try to determine region
      let region = null;
      
      // Check domain mapping first
      for (const [domainPattern, mappedRegion] of Object.entries(domainMapping)) {
        if (domain.includes(domainPattern)) {
          region = mappedRegion;
          break;
        }
      }
      
      // If no region found from domain, check phone
      if (!region && phone) {
        for (const [countryCode, mappedRegion] of Object.entries(phoneMapping)) {
          if (phone.startsWith(countryCode)) {
            region = mappedRegion;
            break;
          }
        }
      }
      
      // Return appropriate time window or default
      return region && timeZoneWindows[region] ? timeZoneWindows[region] : defaultWindow;
    } catch (error) {
      console.error('Error parsing time zone:', error);
      return defaultWindow;
    }
  };
  
  module.exports = {
    parseTimeZone
  };