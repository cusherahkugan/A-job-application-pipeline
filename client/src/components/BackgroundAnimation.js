import React, { useEffect, useState } from 'react';

// Animated job-related icons and interview scenarios for the background
const JobAnimationBackground = ({ darkMode }) => {
  const [animations, setAnimations] = useState([]);
  
  useEffect(() => {
    // Create random interview and work scenes
    const generateAnimations = () => {
      const scenesCount = window.innerWidth < 768 ? 3 : 5;
      const newAnimations = [];
      
      for (let i = 0; i < scenesCount; i++) {
        // Randomly choose between different animation types
        const sceneType = Math.floor(Math.random() * 3); // 0 = interview, 1 = working, 2 = job search
        
        // Calculate random position (non-overlapping)
        const segment = 100 / scenesCount;
        const xPos = (i * segment) + (Math.random() * (segment * 0.6));
        const yPos = Math.random() * 80 + 10;
        
        newAnimations.push({
          id: i,
          type: sceneType,
          x: xPos,
          y: yPos,
          delay: i * 2,
          scale: 0.5 + Math.random() * 0.5,
          opacity: 0.1 + Math.random() * 0.1
        });
      }
      
      setAnimations(newAnimations);
    };
    
    generateAnimations();
    
    // Regenerate on window resize
    const handleResize = () => {
      generateAnimations();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Render different SVG scenes based on type
  const renderScene = (type, scale, opacity) => {
    const color = darkMode ? 'rgba(132, 204, 22, 0.15)' : 'rgba(16, 185, 129, 0.15)';
    
    switch(type) {
      case 0: // Interview scene
        return (
          <svg viewBox="0 0 200 100" style={{ transform: `scale(${scale})`, opacity }}>
            {/* Desk */}
            <rect x="20" y="70" width="160" height="10" fill={color} />
            
            {/* Interviewer */}
            <circle cx="50" cy="50" r="15" fill={color} /> {/* Head */}
            <rect x="42" y="65" width="16" height="25" fill={color} /> {/* Body */}
            
            {/* Interviewee */}
            <circle cx="150" cy="50" r="15" fill={color} /> {/* Head */}
            <rect x="142" y="65" width="16" height="25" fill={color} /> {/* Body */}
            
            {/* Document on desk */}
            <rect x="90" y="60" width="20" height="25" fill={color} stroke={color} strokeWidth="1" />
          </svg>
        );
        
      case 1: // Working person
        return (
          <svg viewBox="0 0 200 100" style={{ transform: `scale(${scale})`, opacity }}>
            {/* Computer */}
            <rect x="70" y="60" width="40" height="30" fill={color} />
            <rect x="85" y="90" width="10" height="5" fill={color} />
            <rect x="75" y="95" width="30" height="2" fill={color} />
            
            {/* Person */}
            <circle cx="90" cy="40" r="10" fill={color} /> {/* Head */}
            <rect x="85" y="50" width="10" height="15" fill={color} /> {/* Body */}
            <line x1="85" y1="55" x2="75" y2="65" stroke={color} strokeWidth="3" /> {/* Left arm */}
            <line x1="95" y1="55" x2="105" y2="65" stroke={color} strokeWidth="3" /> {/* Right arm */}
          </svg>
        );
        
      case 2: // Job search/CV review
        return (
          <svg viewBox="0 0 200 100" style={{ transform: `scale(${scale})`, opacity }}>
            {/* Person */}
            <circle cx="60" cy="40" r="12" fill={color} /> {/* Head */}
            <rect x="53" y="52" width="14" height="20" fill={color} /> {/* Body */}
            
            {/* Document/CV */}
            <rect x="100" y="30" width="40" height="50" fill={color} stroke={color} strokeWidth="1" />
            <line x1="110" y1="40" x2="130" y2="40" stroke={color} strokeWidth="2" />
            <line x1="110" y1="50" x2="130" y2="50" stroke={color} strokeWidth="2" />
            <line x1="110" y1="60" x2="120" y2="60" stroke={color} strokeWidth="2" />
            
            {/* Person's arm pointing to CV */}
            <line x1="67" y1="52" x2="95" y2="45" stroke={color} strokeWidth="3" />
          </svg>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="job-animation-container absolute inset-0 overflow-hidden" style={{ pointerEvents: 'none' }}>
      {/* Animated interview/work scenes */}
      {animations.map((scene) => (
        <div 
          key={scene.id}
          className="absolute"
          style={{
            left: `${scene.x}%`,
            top: `${scene.y}%`,
            width: '200px',
            height: '100px',
            animation: `float-scene 20s infinite ease-in-out ${scene.delay}s`,
          }}
        >
          {renderScene(scene.type, scene.scale, scene.opacity)}
        </div>
      ))}
      
      {/* Job icons and emojis */}
      <div className="icon briefcase"></div>
      <div className="icon document"></div>
      <div className="icon graph" style={{ 
        top: '40%', 
        left: '70%',
        width: '35px',
        height: '35px',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2310b981' opacity='0.5'%3E%3Cpath d='M3 3v18h18v-2H5V3H3z'/%3E%3Cpath d='M15 10l-4 4-3-3-3 3v4h14v-8'/%3E%3C/svg%3E")`,
        animationDelay: '1.5s'
      }}></div>
    </div>
  );
};

const PulsatingGradient = ({ darkMode }) => {
    return (
      <div
        className={`absolute inset-0 ${
          darkMode
            ? 'bg-lime-500 opacity-30'
            : 'bg-gradient-to-r from-lime-400 to-green-500'
        } shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl`}
        style={{
          animation: darkMode ? 'none' : 'pulse 5s ease-in-out infinite'
        }}
      />
    );
  };
  

  export { JobAnimationBackground, PulsatingGradient };
