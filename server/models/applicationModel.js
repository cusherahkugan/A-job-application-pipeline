/**
 * Application Model
 * 
 * Represents a job application with validated fields.
 * This isn't a database model but a validation and data structure model.
 */
class Application {
    /**
     * Create a new application
     * 
     * @param {Object} data - Application data
     */
    constructor(data) {
      this.name = this.validateName(data.name);
      this.email = this.validateEmail(data.email);
      this.phone = this.validatePhone(data.phone);
      this.cvFile = data.cvFile || null;
      this.cvUrl = data.cvUrl || '';
      this.timestamp = new Date();
      this.webhookStatus = 'Pending';
      this.emailStatus = 'Pending';
      this.cvData = data.cvData || null;
    }
    
    /**
     * Validate name
     * 
     * @param {String} name - Name to validate
     * @returns {String} Validated name
     */
    validateName(name) {
      if (!name || typeof name !== 'string' || name.trim().length < 2) {
        throw new Error('Name is required and must be at least 2 characters');
      }
      return name.trim();
    }
    
    /**
     * Validate email
     * 
     * @param {String} email - Email to validate
     * @returns {String} Validated email
     */
    validateEmail(email) {
      if (!email || typeof email !== 'string') {
        throw new Error('Email is required');
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
      }
      
      return email.trim().toLowerCase();
    }
    
    /**
     * Validate phone
     * 
     * @param {String} phone - Phone to validate
     * @returns {String} Validated phone
     */
    validatePhone(phone) {
      if (!phone || typeof phone !== 'string') {
        throw new Error('Phone is required');
      }
      
      // Remove non-numeric characters except for leading +
      const cleanedPhone = phone.trim().replace(/(?!^\+)\D/g, '');
      
      // Simple validation - should start with + or a number and be at least 10 characters
      if (!/^(\+|[0-9])[0-9]{9,}$/.test(cleanedPhone)) {
        throw new Error('Invalid phone number format');
      }
      
      return cleanedPhone;
    }
    
    /**
     * Convert to object for storage
     * 
     * @returns {Object} Application data
     */
    toObject() {
      return {
        name: this.name,
        email: this.email,
        phone: this.phone,
        cvUrl: this.cvUrl,
        timestamp: this.timestamp.toISOString(),
        webhookStatus: this.webhookStatus,
        emailStatus: this.emailStatus,
        cvData: this.cvData || null
      };
    }
  }
  
  module.exports = Application;