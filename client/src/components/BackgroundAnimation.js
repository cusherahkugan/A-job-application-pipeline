import React, { useEffect, useState } from 'react';

// Floating rings background animation
const FloatingRingsBackground = ({ darkMode }) => {
  const [rings, setRings] = useState([]);
  
  useEffect(() => {
    // Generate random ring elements
    const generateRings = () => {
      const isMobile = window.innerWidth < 768;
      const newRings = [];
      
      if (isMobile) {
        // For mobile, create rings only at top and bottom
        const topRingsCount = 4;
        const bottomRingsCount = 4;
        
        // Top rings
        for (let i = 0; i < topRingsCount; i++) {
          const size = 20 + Math.random() * 10; // Size between 80px and 230px
          const xPos = Math.random() * 1000; // Random horizontal position
          
          const thickness = 5 + Math.random() * 15; // Thickness between 5px and 20px
          
          // Movement properties
          const xDirection = Math.random() > 0.5 ? 1 : -1;
          const yDirection = 1; // Move downward
          
          const duration = 10 + Math.random() * 20; // Animation duration between 10s and 30s
          const xDistance = 5 + Math.random() * 20; // Move 5-25% horizontally
          const yDistance = 5 + Math.random() * 20; // Move 5-25% vertically
          
          const delay = Math.random() * -20; // Random delay
          
          newRings.push({
            id: `top-${i}`,
            size,
            x: xPos,
            y: 10 + Math.random() * 20, // Constrain to top 30% of screen
            thickness,
            xDirection,
            yDirection,
            duration,
            xDistance,
            yDistance,
            delay,
            position: 'top'
          });
        }
        
        // Bottom rings
        for (let i = 0; i < bottomRingsCount; i++) {
          const size = 80 + Math.random() * 150; // Size between 80px and 230px
          const xPos = Math.random() * 100; // Random horizontal position
          
          const thickness = 5 + Math.random() * 15; // Thickness between 5px and 20px
          
          // Movement properties
          const xDirection = Math.random() > 0.5 ? 1 : -1;
          const yDirection = -1; // Move upward
          
          const duration = 10 + Math.random() * 20; // Animation duration between 10s and 30s
          const xDistance = 5 + Math.random() * 20; // Move 5-25% horizontally
          const yDistance = 5 + Math.random() * 20; // Move 5-25% vertically
          
          const delay = Math.random() * -20; // Random delay
          
          newRings.push({
            id: `bottom-${i}`,
            size,
            x: xPos,
            y: 80 + Math.random() * 20, // Constrain to bottom 30% of screen
            thickness,
            xDirection,
            yDirection,
            duration,
            xDistance,
            yDistance,
            delay,
            position: 'bottom'
          });
        }
      } else {
        // Desktop logic remains the same as original code
        const ringsCount = 8;
        
        for (let i = 0; i < ringsCount; i++) {
          const size = 150 + Math.random() * 300; // Size between 150px and 450px
          const xPos = Math.random() * 100;
          const yPos = Math.random() * 100;
          
          const thickness = 10 + Math.random() * 30; // Thickness between 10px and 40px
          
          const xDirection = Math.random() > 0.5 ? 1 : -1;
          const yDirection = Math.random() > 0.5 ? 1 : -1;
          
          const duration = 15 + Math.random() * 30; // Animation duration between 15s and 45s
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
            borderColor: darkMode 
              ? 'rgb(132, 204, 22)' // Lime-500 for dark mode
              : `rgba(${Math.random() > 0.5 ? '132, 204, 22' : '16, 185, 129'})`, // Random between lime-500 and green-500
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
          ? 'bg-gradient-to-r from-lime-500 to-green-500'
          : 'bg-gradient-to-r from-lime-500 to-green-500'
      } shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl`}
      style={{
        animation: darkMode ? 'pulse 5s ease-in-out infinite' : 'none'
      }}
    />
  );
};

export { FloatingRingsBackground as RotatingRingsBackground, PulsatingGradient };