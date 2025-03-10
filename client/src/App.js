import React, { useState, useEffect } from 'react';
import ApplicationForm from './components/ApplicationForm';
import SuccessAnimation from './components/SuccessAnimation';
import AnimatedErrorMessage from './components/AnimatedErrorMessage';
import { RotatingRingsBackground, PulsatingGradient } from './components/BackgroundAnimation';
import './index.css';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // Check user's preferred color scheme on initial load and track window size
  useEffect(() => {
    // Default to light mode
    setDarkMode(false);
    
    // Add class for animations
    document.body.classList.add('transitions-enabled');
    
    // Track window width for responsive adjustments
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Force a viewport reset to fix mobile scaling issues
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
      viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0';
    } else {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0';
      document.head.appendChild(meta);
    }
    
    return () => {
      document.body.classList.remove('transitions-enabled');
      window.removeEventListener('resize', handleResize);
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
    // ErrorMessage component now handles its own timeout via React Portal
  };

  // Determine container width and padding based on screen size
  const getContainerClasses = () => {
    if (windowWidth < 640) { // Mobile
      return "w-full max-w-full px-3";
    } else if (windowWidth < 1024) { // Tablet
      return "w-full max-w-xl px-4";
    } else { // Desktop
      return "w-full max-w-xl px-4";
    }
  };

  return (
    <div 
      className={`min-h-screen transition-colors duration-500 ease-in-out ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
      } py-4 sm:py-8 flex flex-col justify-center overflow-hidden relative`}
    >
      {/* Full viewport rotating rings background - increased z-index */}
      <div className="rotating-rings-background-container absolute inset-0 overflow-hidden" style={{ zIndex: 10 }}>
        <RotatingRingsBackground darkMode={darkMode} />
      </div>
      
      {/* Improved dark mode toggle with animation */}
      <div className="absolute top-4 right-4 flex items-center space-x-2 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg z-50 transition-all duration-300 hover:shadow-xl" style={{ zIndex: 1000 }}>
        <button 
          onClick={toggleDarkMode}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
            darkMode ? 'bg-lime-500' : 'bg-gray-300'
          }`}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          <span 
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 ${
              darkMode ? 'translate-x-6' : 'translate-x-1'
            }`} 
          />
          <span className="sr-only">Toggle Dark Mode</span>
        </button>
        
        <div className="flex items-center justify-center w-6 h-6">
          {darkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform transition-transform hover:rotate-45 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform transition-transform hover:rotate-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </div>
      </div>
      
      <div className={`relative py-3 ${getContainerClasses()} mx-auto z-20`}>
        {/* Full container pulsating gradient background - increased z-index */}
        <div className="absolute inset-0 pulsating-gradient-container" style={{ zIndex: 90 }}>
          <PulsatingGradient darkMode={darkMode} />
        </div>
        
        {/* Form container with consistent styling - increased z-index */}
        <div 
          className={`form-container relative px-4 py-6 sm:px-8 md:p-10 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl sm:rounded-xl transition-all duration-300`}
          style={{
            zIndex: 100,
            boxShadow: darkMode ? '0 10px 25px rgba(0, 0, 0, 0.5)' : '0 10px 25px rgba(0, 0, 0, 0.2)',
            width: windowWidth < 640 ? '92%' : 'auto',
            margin: '0 auto',
            backdropFilter: darkMode ? 'none' : 'blur(4px)'
          }}
        >
          <div className="max-w-md mx-auto">
            {formSubmitted ? (
              <SuccessAnimation darkMode={darkMode} />
            ) : (
              <>
                <div className="text-center animate-fade-in">
                  <h1 className={`text-2xl sm:text-3xl font-extrabold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4 sm:mb-6`}>
                    Job Application
                  </h1>
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6 sm:mb-8 text-sm sm:text-base`} style={{ animationDelay: '0.2s' }}>
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
      
      {/* Error message component - will be rendered via React Portal with high z-index */}
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