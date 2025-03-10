import React, { useState, useEffect } from 'react';

const AnimatedErrorMessage = ({ message, onClose }) => {
  const [animationState, setAnimationState] = useState('enter');
  
  useEffect(() => {
    // Start talking animation after entering
    const talkingTimer = setTimeout(() => {
      setAnimationState('talking');
    }, 600);
    
    // Auto close after 5 seconds
    const closeTimer = setTimeout(() => {
      setAnimationState('exit');
      
      // Remove component after exit animation completes
      setTimeout(() => {
        if (onClose) onClose();
      }, 500);
    }, 5000);
    
    return () => {
      clearTimeout(talkingTimer);
      clearTimeout(closeTimer);
    };
  }, [onClose]);
  
  // Generate personalized messages based on the error
  const getErrorTitle = () => {
    if (message.includes("name")) {
      return "Hello There!";
    } else if (message.includes("email")) {
      return "Quick Note";
    } else if (message.includes("phone")) {
      return "One Moment";
    } else if (message.includes("CV")) {
      return "Almost Complete";
    } else {
      return "Attention Required";
    }
  };
  
  return (
    // Using fixed positioning with inset-0 to ensure full viewport coverage
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ position: 'fixed' }}>
      {/* Full-screen backdrop with proper fixed positioning */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300" 
        style={{ 
          opacity: animationState === 'exit' ? 0 : 1,
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: 40
        }}
        onClick={() => setAnimationState('exit')}
      />
      
      <div 
        className={`bg-white rounded-lg p-4 sm:p-6 shadow-xl max-w-sm w-full mx-4 z-50 relative transition-all duration-500 transform flex
          ${animationState === 'enter' ? 'translate-y-0 scale-100' : ''} 
          ${animationState === 'exit' ? 'translate-y-16 scale-95 opacity-0' : ''}
          ${animationState === 'talking' ? 'scale-100' : 'scale-95'}
        `}
        style={{
          animation: animationState === 'enter' ? 'pop-in 0.6s ease-in-out' : ''
        }}
      >
        {/* Close button */}
        <button 
          onClick={() => setAnimationState('exit')}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 z-50"
          aria-label="Close"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        
        {/* Character and speech bubble layout */}
        <div className="flex w-full">
          {/* Animated character */}
          <div 
            className="w-1/3 flex items-center justify-center"
            style={{
              animation: animationState === 'talking' ? 'headShake 1s ease-in-out 3s' : ''
            }}
          >
            <svg width="80" height="120" viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Head */}
              <circle cx="60" cy="50" r="30" fill="#FFD7B5" />
              
              {/* Hair */}
              <path d="M35 30C35 30 40 15 60 15C80 15 85 30 85 30" stroke="#333" strokeWidth="4" fill="#555" />
              <path d="M30 50C30 50 25 30 35 25C45 20 40 35 40 35" stroke="#333" strokeWidth="2" fill="#555" />
              <path d="M90 50C90 50 95 30 85 25C75 20 80 35 80 35" stroke="#333" strokeWidth="2" fill="#555" />
              
              {/* Eyes with blinking */}
              <circle className="eye" cx="48" cy="45" r="3" fill="#333" />
              <circle className="eye" cx="72" cy="45" r="3" fill="#333" />
              
              {/* Eyebrows - friendly expression */}
              <path d="M45 38C45 38 48 36 51 38" stroke="#333" strokeWidth="2" strokeLinecap="round" />
              <path d="M69 38C69 38 72 36 75 38" stroke="#333" strokeWidth="2" strokeLinecap="round" />
              
              {/* Mouth - talking animation */}
              <path className="mouth" d="M53 60C57 65 63 65 67 60" stroke="#333" strokeWidth="2" strokeLinecap="round" />
              
              {/* Body - business casual */}
              <rect x="45" y="80" width="30" height="45" fill="#3B82F6" rx="5" /> {/* Blue shirt */}
              <rect x="40" y="125" width="40" height="30" fill="#374151" rx="2" /> {/* Dark pants */}
              
              {/* Arms */}
              <rect x="30" y="85" width="15" height="40" fill="#FFD7B5" rx="7" transform="rotate(-15 30 85)" />
              <rect x="82" y="83" width="15" height="40" fill="#FFD7B5" rx="7" transform="rotate(-15 82 83)" />
              
              {/* Hands */}
              <circle cx="25" cy="125" r="6" fill="#FFD7B5" />
              <circle cx="95" cy="125" r="6" fill="#FFD7B5" />
              
              {/* Tie */}
              <path d="M60 80L65 90L60 110L55 90L60 80Z" fill="#EF4444" />
            </svg>
          </div>
          
          {/* Message bubble */}
          <div className="w-2/3 flex flex-col pl-2">
            <div
              className="px-3 py-2 bg-gray-100 rounded-lg rounded-tl-none mt-2"
              style={{
                animation: animationState === 'talking' ? 'pulse 2s infinite' : ''
              }}
            >
              <h3 className="font-bold text-gray-800">{getErrorTitle()}</h3>
              <p className="text-gray-700 text-sm">{message}</p>
            </div>
            
            {/* Typing animation dots */}
            {animationState === 'talking' && (
              <div className="flex space-x-1 mt-2 ml-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedErrorMessage;