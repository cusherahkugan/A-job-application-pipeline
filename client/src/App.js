import React, { useState, useEffect } from 'react';
import ApplicationForm from './components/ApplicationForm';
import SuccessAnimation from './components/SuccessAnimation';
import AnimatedErrorMessage from './components/AnimatedErrorMessage';
import {  JobAnimationBackground, PulsatingGradient } from './components/BackgroundAnimation';
import './index.css';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Check user's preferred color scheme on initial load
  useEffect(() => {
    // Default to light mode
    setDarkMode(false);
    
    // Add class for animations
    document.body.classList.add('transitions-enabled');
    
    return () => {
      document.body.classList.remove('transitions-enabled');
    };
  }, []);
  
  // Toggle between light and dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  // Handle successful form submission
  const handleFormSubmitSuccess = () => {
    setFormSubmitted(true);
    
    // Reset form submitted state after animation completes
    setTimeout(() => {
      setFormSubmitted(false);
    }, 6000);
  };
  
  // Handle error message display
  const handleError = (message) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 5000);
  };

  return (
    <div 
      className={`min-h-screen transition-colors duration-500 ease-in-out ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
      } py-6 flex flex-col justify-center sm:py-12 overflow-hidden relative`}
    >
      {/* Enhanced animated backgrounds */}
      <JobAnimationBackground darkMode={darkMode} />
      
      {/* Improved dark mode toggle with animation */}
      <div className="absolute top-4 right-4 flex items-center space-x-2 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg z-50 transition-all duration-300 hover:shadow-xl">
        <button 
          onClick={toggleDarkMode}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
            darkMode ? 'bg-lime-500' : 'bg-gray-300'
          }`}
        >
          <span 
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 ${
              darkMode ? 'translate-x-6' : 'translate-x-1'
            }`} 
          />
          <span className="sr-only">Toggle Dark Mode</span>
        </button>
        
        <div className="flex items-center justify-center w-6 h-6 text-gray-700 dark:text-yellow-300">
          {darkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform transition-transform hover:rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform transition-transform hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </div>
      </div>
      
      <div className="relative py-3 px-4 sm:px-0 w-full max-w-xl mx-auto">
        {/* Improved background gradient */}
        <PulsatingGradient darkMode={darkMode} />
        
        {/* Enhanced job icons animation */}
        <JobAnimationBackground darkMode={darkMode} />
        
        {/* Form container with consistent styling */}
        <div 
          className="relative px-6 py-8 sm:px-8 md:p-10 bg-white shadow-xl sm:rounded-xl transition-all duration-300 z-10"
          style={{
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)'
          }}
        >
          <div className="max-w-md mx-auto">
            {formSubmitted ? (
              <SuccessAnimation darkMode={darkMode} />
            ) : (
              <>
                <div className="text-center animate-fade-in">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4 sm:mb-6">
                    Job Application
                  </h1>
                  <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base" style={{ animationDelay: '0.2s' }}>
                    Join our team by completing this application form below.
                  </p>
                </div>
                <ApplicationForm
                  darkMode={darkMode}
                  onSubmitSuccess={handleFormSubmitSuccess}
                  onError={handleError}
                />
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Error message component */}
      {errorMessage && (
        <AnimatedErrorMessage 
          message={errorMessage} 
          onClose={() => setErrorMessage('')}
        />
      )}
    </div>
  );
}

export default App;