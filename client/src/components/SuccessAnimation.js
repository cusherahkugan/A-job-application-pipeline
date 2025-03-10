import React, { useEffect, useState } from 'react';

const SuccessAnimation = ({ darkMode }) => {
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    // Set animation complete after 4 seconds
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="text-center py-6">
      <div className="relative h-60 mb-6">
        {/* Background confetti effects */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 rounded-full ${
                darkMode 
                  ? ['bg-lime-500', 'bg-green-400', 'bg-yellow-300'][i % 3] 
                  : ['bg-lime-500', 'bg-green-400', 'bg-blue-400'][i % 3]
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `successPop 0.5s ease-out forwards, floatBubble ${5 + Math.random() * 10}s ease-in infinite ${Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* Character animation */}
        <div 
          className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
          style={{
            animation: animationComplete ? 'wave 2.5s infinite' : 'successPop 0.8s ease-out forwards'
          }}
        >
          <svg width="120" height="160" viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Head */}
            <circle cx="60" cy="50" r="30" fill="#FFD7B5" />
            
            {/* Hair */}
            <path d="M35 30C35 30 40 15 60 15C80 15 85 30 85 30" stroke="#333" strokeWidth="4" fill="#555" />
            <path d="M30 50C30 50 25 30 35 25C45 20 40 35 40 35" stroke="#333" strokeWidth="2" fill="#555" />
            <path d="M90 50C90 50 95 30 85 25C75 20 80 35 80 35" stroke="#333" strokeWidth="2" fill="#555" />
            
            {/* Eyes - blinking animation */}
            <circle className="eye" cx="48" cy="45" r="3" fill="#333" />
            <circle className="eye" cx="72" cy="45" r="3" fill="#333" />
            
            {/* Eyebrows - happy expression */}
            <path d="M45 40C45 40 48 38 51 40" stroke="#333" strokeWidth="2" strokeLinecap="round" />
            <path d="M75 40C75 40 72 38 69 40" stroke="#333" strokeWidth="2" strokeLinecap="round" />
            
            {/* Mouth - big smile */}
            <path className="mouth" d="M50 60C55 68 65 68 70 60" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
            
            {/* Body - business casual */}
            <rect x="45" y="80" width="30" height="45" fill="#3B82F6" rx="5" /> {/* Blue shirt */}
            <rect x="40" y="125" width="40" height="30" fill="#374151" rx="2" /> {/* Dark pants */}
            
            {/* Arms */}
            <rect x="30" y="85" width="15" height="40" fill="#FFD7B5" rx="7" transform="rotate(-15 30 85)" /> {/* Left arm down */}
            
            {/* Right arm waving */}
            <rect 
              className="origin-bottom animate-wave" 
              x="75" y="83" width="15" height="40" 
              fill="#FFD7B5" rx="7" 
              transform={animationComplete ? "rotate(30 82 90)" : "rotate(-15 82 83)"}
            /> 
            
            {/* Hands */}
            <circle cx="25" cy="125" r="6" fill="#FFD7B5" />
            <circle 
              className="origin-bottom" 
              cx="95" cy="102" r="6" 
              fill="#FFD7B5"
              style={{
                transform: animationComplete ? "translateY(-10px)" : "translateY(0)",
                animation: animationComplete ? "wave 2.5s infinite" : ""
              }}
            />
            
            {/* Tie */}
            <path d="M60 80L65 90L60 110L55 90L60 80Z" fill="#10B981" />
            
            {/* Success check mark - animated */}
            <g style={{ animation: "successPop 1s ease-out 0.5s forwards", opacity: 0 }}>
              <circle cx="90" cy="40" r="12" fill="#10B981" />
              <path d="M84 40L88 44L96 36" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </svg>
        </div>
      </div>

      <h2 
        className="text-2xl font-bold mb-2 text-gray-800"
        style={{ animation: "successPop 0.5s ease-out 0.3s forwards", opacity: 0 }}
      >
        Application Submitted!
      </h2>
      
      <p 
        className="text-gray-600 mb-6"
        style={{ animation: "successPop 0.5s ease-out 0.6s forwards", opacity: 0 }}
      >
        Thank you for your application. We'll be in touch soon!
      </p>
      
      <div style={{ animation: "successPop 0.5s ease-out 0.9s forwards", opacity: 0 }}>
        <svg className="inline-block w-32 h-32 text-lime-500 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
};

export default SuccessAnimation;