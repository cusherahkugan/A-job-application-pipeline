import React, { useEffect, useState } from 'react';

// Floating rings background animation
const FloatingRingsBackground = ({ darkMode }) => {
  const [rings, setRings] = useState([]);
  
  useEffect(() => {
    // Generate random ring elements
    const generateRings = () => {
      const ringsCount = window.innerWidth < 768 ? 5 : 8;
      const newRings = [];
      
      for (let i = 0; i < ringsCount; i++) {
        // Calculate random properties for each ring
        const size = 150 + Math.random() * 300; // Size between 150px and 450px
        const xPos = Math.random() * 100; // Initial position between 0% and 100%
        const yPos = Math.random() * 100;
        // Increased thickness significantly from 6-16px to 10-25px
        const thickness = 10 + Math.random() * 30; 
        // Random movement direction
        const xDirection = Math.random() > 0.5 ? 1 : -1;
        const yDirection = Math.random() > 0.5 ? 1 : -1;
        // Random movement duration
        const duration = 15 + Math.random() * 30; // Animation duration between 15s and 45s
        // Random movement distance in percentage
        const xDistance = 10 + Math.random() * 30; // Move 10-40% horizontally
        const yDistance = 10 + Math.random() * 30; // Move 10-40% vertically
        const delay = Math.random() * -20; // Random delay
        
        newRings.push({
          id: i,
          size,
          x: xPos,
          y: yPos,
          thickness,
          xDirection,
          yDirection,
          duration,
          xDistance,
          yDistance,
          delay
        });
      }
      
      setRings(newRings);
    };
    
    generateRings();
    
    // Regenerate on window resize
    const handleResize = () => {
      generateRings();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="rings-animation-container absolute inset-0 overflow-hidden z-0" style={{ pointerEvents: 'none' }}>
      {rings.map((ring) => (
        <div
          key={ring.id}
          className="absolute rounded-full border-2 opacity-30"
          style={{
            width: `${ring.size}px`,
            height: `${ring.size}px`,
            borderWidth: `${ring.thickness}px`,
            // Updated colors to use lime-500 and the green from the gradient
            borderColor: darkMode 
              ? 'rgba(132, 204, 22, 0.7)' // Brightened lime color for dark mode
              : `rgba(${Math.random() > 0.5 ? '132, 204, 22' : '16, 185, 129'}, 0.7)`, // Random between lime-500 and green-500, brightened
            borderStyle: 'solid',
            animation: `float-${ring.id} ${ring.duration}s ease-in-out infinite ${ring.delay}s`,
            // Initial position
            left: `calc(${ring.x}% - ${ring.size / 2}px)`,
            top: `calc(${ring.y}% - ${ring.size / 2}px)`,
          }}
        />
      ))}
      
      {/* Create keyframe animations for each ring */}
      <style>
        {rings.map((ring) => `
          @keyframes float-${ring.id} {
            0%, 100% {
              transform: translate(0, 0);
            }
            50% {
              transform: translate(
                ${ring.xDirection * ring.xDistance}%, 
                ${ring.yDirection * ring.yDistance}%
              );
            }
          }
        `).join('')}
      </style>
    </div>
  );
};

const PulsatingGradient = ({ darkMode }) => {
  return (
    <div
      className={`absolute inset-0 ${
        darkMode
          ? 'bg-lime-500 opacity-30'
          : 'bg-gradient-to-r from-lime-500 to-green-500'
      } shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl`}
      style={{
        animation: darkMode ? 'none' : 'pulse 5s ease-in-out infinite'
      }}
    />
  );
};

export { FloatingRingsBackground as RotatingRingsBackground, PulsatingGradient };