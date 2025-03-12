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
    
    // Log what we're sending (for debugging)
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value}`);
    }
    
    const response = await fetch(`${API_URL}/applications/submit`, {
      method: 'POST',
      body: formData,
      mode: 'cors',
      credentials: 'same-origin',
      // Don't set Content-Type - browser sets it automatically for FormData
    });
    
    // Check if response was received
    if (!response) {
      throw new Error('No response received from server');
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `Server error: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    
    if (error.message === 'Failed to fetch') {
      throw new Error('Server connection failed. Is the server running?');
    }
    
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