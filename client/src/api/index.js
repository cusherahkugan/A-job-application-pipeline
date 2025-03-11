// Base API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Submit a job application
 * 
 * @param {FormData} formData - Form data with name, email, phone, and CV file
 * @returns {Promise<Object>} Response data
 */
export const submitApplication = async (formData) => {
  try {
    console.log('Submitting to:', `${API_URL}/applications/submit`);
    
    const response = await fetch(`${API_URL}/applications/submit`, {
      method: 'POST',
      body: formData, // FormData for file upload
      // No Content-Type header - browser sets it with boundary for FormData
      mode: 'cors', // Explicitly set CORS mode
      credentials: 'same-origin', // Changed from 'include' to 'same-origin'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit application');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * Get application status
 * 
 * @param {String} email - Applicant email
 * @returns {Promise<Object>} Response data
 */
export const getApplicationStatus = async (email) => {
  try {
    const response = await fetch(`${API_URL}/applications/status/${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get application status');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};