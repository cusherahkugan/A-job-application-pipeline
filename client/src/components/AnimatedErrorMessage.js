import React, { useState, useEffect } from 'react';

const AnimatedErrorMessage = ({ message, onClose }) => {
  const [animationState, setAnimationState] = useState('enter');
  
  useEffect(() => {
    // Start talking animation after entering
    const talkingTimer = setTimeout(() => {
      setAnimationState('talking');
    }, 600);
    
    // Auto close after 4 seconds
    const closeTimer = setTimeout(() => {
      setAnimationState('exit');
      
      // Remove component after exit animation completes
      setTimeout(() => {
        if (onClose) onClose();
      }, 500);
    }, 4000);
    
    // Disable body scrolling when error message is visible
    document.body.style.overflow = 'hidden';
    
    return () => {
      clearTimeout(talkingTimer);
      clearTimeout(closeTimer);
      document.body.style.overflow = '';
    };
  }, [onClose]);
  
  // Generate personalized messages based on the error
  const getErrorTitle = () => {
    if (message.includes("name")) {
      return "Hey there!";
    } else if (message.includes("email")) {
      return "Oops!";
    } else if (message.includes("phone")) {
      return "Just a sec!";
    } else if (message.includes("CV")) {
      return "Almost there!";
    } else {
      return "Hmm...";
    }
  };
  
  // Get animated character expression based on error type
  const getCharacterExpression = () => {
    if (message.includes("name")) {
      return "questioning";
    } else if (message.includes("email")) {
      return "confused";
    } else if (message.includes("phone")) {
      return "thinking";
    } else if (message.includes("CV")) {
      return "pointing";
    } else {
      return "default";
    }
  };
  
  const expression = getCharacterExpression();
  
  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 10000 }}>
      {/* Background overlay with opacity but NO backdrop blur */}
      <div 
        className="absolute inset-0 bg-black"
        style={{ opacity: 0.7 }}
        onClick={() => setAnimationState('exit')}
      ></div>
     
      <div 
        className={`bg-white rounded-lg p-4 sm:p-6 shadow-xl max-w-sm w-full mx-4 z-10 transition-all duration-500 transform flex relative
          ${animationState === 'enter' ? 'translate-y-0 scale-100' : ''} 
          ${animationState === 'exit' ? 'translate-y-16 scale-95 opacity-0' : ''}
          ${animationState === 'talking' ? 'scale-100' : 'scale-95'}
        `}
        style={{
          animation: animationState === 'enter' ? 'bounceIn 0.6s ease-in-out' : '',
          zIndex: 10001 // Even higher z-index than the overlay
        }}
      >
        {/* Close button */}
        <button 
          onClick={() => setAnimationState('exit')}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 z-10"
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
            className={`w-1/3 flex items-center justify-center character-eyes
              ${animationState === 'talking' ? 'character-talking' : ''}
            `}
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
              
              {/* Eyebrows - expression based */}
              {expression === "questioning" && (
                <>
                  <path d="M45 38C45 38 48 36 51 38" stroke="#333" strokeWidth="2" strokeLinecap="round" />
                  <path d="M69 35C69 35 72 38 75 35" stroke="#333" strokeWidth="2" strokeLinecap="round" />
                </>
              )}
              
              {expression === "confused" && (
                <>
                  <path d="M45 38C45 38 48 36 51 38" stroke="#333" strokeWidth="2" strokeLinecap="round" />
                  <path d="M69 38C69 38 72 36 75 38" stroke="#333" strokeWidth="2" strokeLinecap="round" />
                </>
              )}
              
              {(expression === "thinking" || expression === "default") && (
                <>
                  <path d="M45 40C45 40 48 36 51 40" stroke="#333" strokeWidth="2" strokeLinecap="round" />
                  <path d="M69 40C69 40 72 36 75 40" stroke="#333" strokeWidth="2" strokeLinecap="round" />
                </>
              )}
              
              {expression === "pointing" && (
                <>
                  <path d="M45 38C45 38 48 36 51 38" stroke="#333" strokeWidth="2" strokeLinecap="round" />
                  <path d="M69 38C69 38 72 36 75 38" stroke="#333" strokeWidth="2" strokeLinecap="round" />
                </>
              )}
              
              {/* Mouth - talking animation */}
              {expression === "questioning" && (
                <path className="mouth" d="M53 65C55 63 65 63 67 65" stroke="#333" strokeWidth="2" strokeLinecap="round" />
              )}
              
              {expression === "confused" && (
                <path className="mouth" d="M53 65C57 67 63 67 67 65" stroke="#333" strokeWidth="2" strokeLinecap="round" />
              )}
              
              {(expression === "thinking" || expression === "default") && (
                <path className="mouth" d="M53 65C55 63 65 63 67 65" stroke="#333" strokeWidth="2" strokeLinecap="round" />
              )}
              
              {expression === "pointing" && (
                <path className="mouth" d="M55 65C55 65 60 62 65 65" stroke="#333" strokeWidth="2" strokeLinecap="round" />
              )}
              
              {/* Body - business casual */}
              <rect x="45" y="80" width="30" height="45" fill="#3B82F6" rx="5" /> {/* Blue shirt */}
              <rect x="40" y="125" width="40" height="30" fill="#374151" rx="2" /> {/* Dark pants */}
              
              {/* Arms */}
              {expression === "pointing" ? (
                // Pointing arm
                <g className={animationState === 'talking' ? 'animate-float' : ''}>
                  <rect x="30" y="85" width="15" height="40" fill="#FFD7B5" rx="7" transform="rotate(-30 30 85)" />
                  <circle cx="15" cy="118" r="6" fill="#FFD7B5" />
                </g>
              ) : (
                // Regular arm
                <rect x="30" y="85" width="15" height="40" fill="#FFD7B5" rx="7" transform="rotate(15 30 85)" />
              )}
              
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
      
      {/* Add necessary animation keyframes */}
      <style jsx>{`
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          40% { transform: scale(1.1); }
          60% { transform: scale(0.9); }
          80% { transform: scale(1.03); }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        
        @keyframes headShake {
          0% { transform: translateX(0); }
          6.5% { transform: translateX(-6px) rotateY(-9deg); }
          18.5% { transform: translateX(5px) rotateY(7deg); }
          31.5% { transform: translateX(-3px) rotateY(-5deg); }
          43.5% { transform: translateX(2px) rotateY(3deg); }
          50% { transform: translateX(0); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default AnimatedErrorMessage;