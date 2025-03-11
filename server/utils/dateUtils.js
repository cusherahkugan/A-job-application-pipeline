/**
 * Format a date as an ISO string
 * 
 * @param {Date} date - Date object
 * @returns {String} Formatted ISO date string
 */
const formatISO = (date) => {
    return date.toISOString();
  };
  
  /**
   * Check if a date is at least 24 hours in the past
   * 
   * @param {Date|String} date - Date to check
   * @returns {Boolean} True if more than 24 hours old
   */
  const isOlderThan24Hours = (date) => {
    const timestamp = date instanceof Date ? date : new Date(date);
    const now = new Date();
    
    // Calculate difference in milliseconds
    const diffMs = now - timestamp;
    
    // Convert to hours
    const diffHours = diffMs / (1000 * 60 * 60);
    
    return diffHours >= 24;
  };
  
  /**
   * Get a date for the next day at a specific hour
   * 
   * @param {Number} hour - Hour (0-23)
   * @returns {Date} Date for tomorrow at the specified hour
   */
  const getTomorrowAtHour = (hour = 9) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(hour, 0, 0, 0);
    
    return tomorrow;
  };
  
  module.exports = {
    formatISO,
    isOlderThan24Hours,
    getTomorrowAtHour
  };