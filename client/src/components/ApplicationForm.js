import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Common country codes with flags
const countryCodes = [
  { code: '+1', flag: '🇺🇸', name: 'United States' },
  { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+81', flag: '🇯🇵', name: 'Japan' },
  { code: '+86', flag: '🇨🇳', name: 'China' },
  { code: '+7', flag: '🇷🇺', name: 'Russia' },
  { code: '+55', flag: '🇧🇷', name: 'Brazil' },
  { code: '+52', flag: '🇲🇽', name: 'Mexico' },
  { code: '+34', flag: '🇪🇸', name: 'Spain' },
  { code: '+39', flag: '🇮🇹', name: 'Italy' },
  { code: '+82', flag: '🇰🇷', name: 'South Korea' },
  { code: '+65', flag: '🇸🇬', name: 'Singapore' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+27', flag: '🇿🇦', name: 'South Africa' },
  { code: '+234', flag: '🇳🇬', name: 'Nigeria' },
  { code: '+94', flag: '🇱🇰', name: 'Sri Lanka' },
];

const ApplicationForm = ({ darkMode, onSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneCountryCode: '+94', // Default to Sri Lanka
    phoneNumber: '',
    cv: null
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [validFields, setValidFields] = useState({});
  const [fileName, setFileName] = useState('');
  const [countryCodeDropdownOpen, setCountryCodeDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);

  // Enhanced error feedback state
  const [showErrorAnimation, setShowErrorAnimation] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Find the default country code object
  const selectedCountry = countryCodes.find(country => country.code === formData.phoneCountryCode);

  // Filter countries based on search term
  const filteredCountries = countryCodes.filter(country => 
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    country.code.includes(searchTerm)
  );

  // Check form validity whenever form data changes
  useEffect(() => {
    const { name, email, phoneNumber, cv } = formData;
    const valid = 
      name.trim() !== '' && 
      email.trim() !== '' && 
      /\S+@\S+\.\S+/.test(email) && 
      phoneNumber.trim() !== '' && 
      /^[0-9\s\-()]{8,15}$/.test(phoneNumber) &&
      cv !== null;
    
    setIsFormValid(valid);
  }, [formData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only close if the click is outside the dropdown
      if (countryCodeDropdownOpen && !event.target.closest('.country-dropdown-container')) {
        setCountryCodeDropdownOpen(false);
      }
    };

    if (countryCodeDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [countryCodeDropdownOpen]);

  // Handle form field changes with improved feedback
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Validate field and show appropriate feedback
    let hasError = false;
    let errorMsg = '';
    let isValid = false;
    
    // Only validate if there's input (don't show errors for empty fields during typing)
    if (value.trim() !== '') {
      if (name === 'email') {
        if (!/\S+@\S+\.\S+/.test(value)) {
          hasError = true;
          errorMsg = "Invalid email format";
        } else {
          isValid = true;
        }
      } else if (name === 'phoneNumber') {
        if (!/^[0-9\s\-()]{8,15}$/.test(value)) {
          hasError = true;
          errorMsg = "8-15 digits required";
        } else {
          isValid = true;
        }
      } else if (name === 'name' && value.trim().length >= 2) {
        // Name field is valid if it has at least 2 characters
        isValid = true;
      }
    }
    
    // Update errors state
    if (hasError) {
      setErrors(prev => ({ ...prev, [name]: errorMsg }));
      setValidFields(prev => ({ ...prev, [name]: false }));
    } else {
      // Remove error if it exists
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
      
      // Set valid status
      setValidFields(prev => ({ ...prev, [name]: isValid }));
    }
  };

  // Handle country code selection
  const handleCountryCodeSelect = (code) => {
    setFormData({
      ...formData,
      phoneCountryCode: code
    });
    setCountryCodeDropdownOpen(false);
    setSearchTerm('');
  };

  // Toggle dropdown
  const toggleDropdown = (e) => {
    e.stopPropagation();
    setCountryCodeDropdownOpen(!countryCodeDropdownOpen);
  };
  
  // Handle search input
  const handleSearchChange = (e) => {
    e.stopPropagation();
    setSearchTerm(e.target.value);
  };

  // Handle file upload with improved validation
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      const fileType = file.type;
      if (fileType !== 'application/pdf' && 
          fileType !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setErrors({
          ...errors,
          cv: 'PDF or DOCX only'
        });
        setValidFields(prev => ({ ...prev, cv: false }));
        
        // Show friendly error message
        setErrorMessage("Please upload your CV in PDF or DOCX format.");
        setShowErrorAnimation(true);
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({
          ...errors,
          cv: 'Max 5MB file size'
        });
        setValidFields(prev => ({ ...prev, cv: false }));
        
        // Show friendly error message
        setErrorMessage("Please keep your CV file under 5MB.");
        setShowErrorAnimation(true);
        return;
      }

      setFormData({
        ...formData,
        cv: file
      });
      setFileName(file.name);
      
      // Clear error for CV if it exists
      if (errors.cv) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.cv;
          return newErrors;
        });
      }
      
      // Set CV as valid
      setValidFields(prev => ({ ...prev, cv: true }));
    }
  };

  // Get personalized but professional error message
  const getPersonalizedErrorMessage = () => {
    if (!formData.name.trim()) {
      return "Please provide your full name.";
    } else if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      return "Please enter a valid email address.";
    } else if (!formData.phoneNumber.trim() || !/^[0-9\s\-()]{8,15}$/.test(formData.phoneNumber)) {
      return "Please provide a valid phone number.";
    } else if (!formData.cv) {
      return "Please upload your CV to complete your application.";
    } else {
      return "Please complete all required fields.";
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone required';
    } else if (!/^[0-9\s\-()]{8,15}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = '8-15 digits required';
    }

    if (!formData.cv) {
      newErrors.cv = 'CV required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 // Modification for the handleSubmit function in client/src/components/ApplicationForm.js

// Replace the existing handleSubmit function with this one
const handleSubmit = async (e) => {
  e.preventDefault();

  if (validateForm()) {
    setLoading(true);
    
    try {
      // Create form data for file upload
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('phone', `${formData.phoneCountryCode}${formData.phoneNumber}`);
      data.append('cv', formData.cv);

      // Submit form to API
      const response = await fetch('/api/applications/submit', {
        method: 'POST',
        body: data
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit application');
      }
      
      const result = await response.json();
      console.log('Submission successful:', result);
      
      // Show success message
      toast.success('Application submitted successfully!');
      
      // Trigger success animation
      if (onSubmitSuccess) {
        onSubmitSuccess(result.data);
      }
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phoneCountryCode: '+94',
        phoneNumber: '',
        cv: null
      });
      setFileName('');
      setValidFields({});
      
    } catch (error) {
      console.error('Error submitting application:', error);
      
      // Handle error
      toast.error(error.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  } else {
    // Show enhanced error dialog with personalized message
    setErrorMessage(getPersonalizedErrorMessage());
    setShowErrorAnimation(true);
    
    // Highlight invalid fields
    Object.keys(errors).forEach(fieldName => {
      setValidFields(prev => ({ ...prev, [fieldName]: false }));
    });
  }
};
  // Get input field class based on validation status
  const getInputClass = (fieldName) => {
    const baseClass = "w-full px-3 py-2 border rounded-md transition-all duration-300 ";
    
    if (errors[fieldName]) {
      return baseClass + (darkMode 
        ? 'border-red-500 bg-gray-900 text-white focus:border-red-500 focus:ring focus:ring-red-200/30' 
        : 'border-red-500 focus:border-red-500 focus:ring focus:ring-red-200');
    } 
    
    if (validFields[fieldName]) {
      return baseClass + (darkMode 
        ? 'border-lime-500 bg-gray-900 text-white focus:border-lime-500 focus:ring focus:ring-lime-200/30' 
        : 'border-lime-500 focus:border-lime-500 focus:ring focus:ring-lime-200');
    }
    
    return baseClass + (darkMode 
      ? 'border-gray-600 bg-gray-900 text-white focus:border-lime-500 focus:ring focus:ring-lime-500/30' 
      : 'border-gray-300 focus:border-lime-500 focus:ring focus:ring-lime-500/50');
  };

  return (
    <div className={`max-w-md mx-auto ${darkMode ? 'text-white' : 'text-gray-800'} transition-colors`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field with validation */}
        <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <label className={`block ${darkMode ? 'text-white' : 'text-gray-700'} text-sm font-bold mb-2`} htmlFor="name">
            Full Name
          </label>
          <div className="relative">
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={getInputClass('name')}
              placeholder="Cusherah Kugananthan"
            />
            {validFields.name && (
              <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-lime-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Email Field with validation */}
        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <label className={`block ${darkMode ? 'text-white' : 'text-gray-700'} text-sm font-bold mb-2`} htmlFor="email">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={getInputClass('email')}
              placeholder="cusherahkugan@gmail.com"
            />
            {validFields.email && (
              <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-lime-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        {/* Phone Field with Country Code Dropdown and validation */}
        <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <label className={`block ${darkMode ? 'text-white' : 'text-gray-700'} text-sm font-bold mb-2`} htmlFor="phoneNumber">
            Phone Number
          </label>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            {/* Country code dropdown */}
            <div className="relative country-dropdown-container">
              <button
                type="button"
                onClick={toggleDropdown}
                className={`flex items-center justify-between w-full sm:w-32 px-3 py-2 border ${
                  errors.phoneNumber 
                    ? 'border-red-500' 
                    : darkMode 
                      ? 'border-gray-600 bg-gray-900 text-white' 
                      : 'border-gray-300 bg-white text-gray-700'
                } transition-all duration-300 focus:outline-none focus:border-lime-500 focus:ring focus:ring-lime-500/50 rounded-md`}
              >
                <span className="flex items-center">
                  {selectedCountry ? (
                    <>
                      <span className="mr-1">{selectedCountry.flag}</span>
                      <span>{selectedCountry.code}</span>
                    </>
                  ) : "Select"}
                </span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-4 w-4 ml-1 transition-transform duration-300 ${countryCodeDropdownOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown */}
              {countryCodeDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full sm:w-64 p-2 bg-white border border-gray-200 rounded-md shadow-lg max-h-52 overflow-y-auto animate-fade-in">
                  <div className="sticky top-0 bg-white pb-2">
                    <input
                      type="text"
                      placeholder="Search country..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-lime-500 transition-all duration-300"
                    />
                  </div>
                  
                  {filteredCountries.length === 0 ? (
                    <div className="p-2 text-center text-gray-500">No country found</div>
                  ) : (
                    <div>
                      {filteredCountries.map((country) => (
                        <div
                          key={country.code}
                          className={`flex items-center p-2 cursor-pointer hover:bg-gray-100 rounded-md transition-all duration-200 ${
                            formData.phoneCountryCode === country.code ? 'bg-lime-100' : ''
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCountryCodeSelect(country.code);
                          }}
                        >
                          <span className="mr-2">{country.flag}</span>
                          <span className="flex-1">{country.name}</span>
                          <span className="text-gray-500">{country.code}</span>
                          {formData.phoneCountryCode === country.code && (
                            <svg className="w-4 h-4 ml-2 text-lime-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Phone number input with validation */}
            <div className="relative flex-1">
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={getInputClass('phoneNumber')}
                placeholder="766741405"
              />
              {validFields.phoneNumber && (
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-lime-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
          {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
        </div>

        {/* CV Upload Field with validation */}
        <div className="mt-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <label className={`block ${darkMode ? 'text-white' : 'text-gray-700'} text-sm font-bold mb-2`} htmlFor="cv">
            CV/Resume
          </label>
          <div className={`relative border-dashed border-2 rounded-lg p-4 sm:p-6 mt-1 transition-all duration-300 ${
            errors.cv 
              ? darkMode ? 'border-red-500 bg-gray-900' : 'border-red-500 bg-red-50'
              : validFields.cv
                ? darkMode ? 'border-lime-500 bg-gray-900' : 'border-lime-500 bg-lime-50'
                : darkMode
                  ? 'border-gray-600 hover:border-gray-400 bg-gray-900'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}>
            <input
              type="file"
              id="cv"
              name="cv"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            />
            <div className="text-center">
              {fileName ? (
                <div className="flex items-center justify-center animate-fade-in">
                  <svg 
                    className="h-8 w-8 text-lime-500 mr-2" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{fileName}</span>
                </div>
              ) : (
                <>
                  <svg 
                    className={`mx-auto h-10 w-10 ${
                      errors.cv 
                        ? 'text-red-500' 
                        : darkMode 
                          ? 'text-gray-400' 
                          : 'text-gray-500'
                    } transition-all duration-300`}
                    stroke="currentColor" 
                    fill="none" 
                    viewBox="0 0 48 48"
                  >
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4h-4m-12 4h-8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className={`mt-1 text-sm ${
                    errors.cv 
                      ? 'text-red-600' 
                      : darkMode 
                        ? 'text-gray-300' 
                        : 'text-gray-600'
                  } transition-all duration-300`}>
                    Click to upload your CV (PDF or DOCX)
                  </p>
                  <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Max file size: 5MB
                  </p>
                </>
              )}
            </div>
          </div>
          {errors.cv && <p className="text-red-500 text-xs mt-1">{errors.cv}</p>}
        </div>

        {/* Submit Button with Gradient */}
        <div className="flex items-center justify-center mt-6">
          <button
            type="submit"
            disabled={loading}
            className={`bg-gradient-to-r from-lime-500 to-green-600 text-white font-bold py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-all transform duration-300 ${
              loading ? 'opacity-70' : 'hover:scale-105 hover:shadow-lg'
            }`}
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </div>
            ) : 'Submit Application'}
          </button>
        </div>
   
        {/* Error Modal */}
        {showErrorAnimation && (
          <div className="fixed -top-4 left-0 right-0 bottom-0 flex items-center justify-center" style={{ zIndex: 10000 }}>
            <div 
              className="absolute inset-0 bg-black"
              style={{ opacity: 0.7 }}
              onClick={() => setShowErrorAnimation(false)}
            ></div>
            <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full mx-4 transform transition-all animate-bounce-in" style={{ zIndex: 10001 }}>
              <button 
                onClick={() => setShowErrorAnimation(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
                aria-label="Close"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <svg width="80" height="80" viewBox="0 0 120 120" className="animate-pulse">
                    <circle cx="60" cy="60" r="40" fill="#4ADE80" />
                    <circle cx="60" cy="60" r="35" fill="#F9FAFB" />
                    <ellipse cx="48" cy="55" rx="5" ry="6" fill="#1F2937" className="animate-blink" />
                    <ellipse cx="72" cy="55" rx="5" ry="6" fill="#1F2937" className="animate-blink" />
                    <path d="M43 45C46 42 52 44 54 45" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
                    <path d="M77 45C74 42 68 44 66 45" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
                    <path d="M45 70C50 78 70 78 75 70" stroke="#1F2937" strokeWidth="2.5" fill="none" strokeLinecap="round" className="animate-talking" />
                    <circle cx="40" cy="65" r="5" fill="#FBCFE8" fillOpacity="0.5" />
                    <circle cx="80" cy="65" r="5" fill="#FBCFE8" fillOpacity="0.5" />
                  </svg>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-lime-600 mb-2">Oops!</h3>
                  <p className="text-gray-700">{errorMessage}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>

      <ToastContainer 
        position="bottom-center"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default ApplicationForm;