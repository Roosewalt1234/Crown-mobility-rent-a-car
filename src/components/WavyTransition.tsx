import React from 'react';
import { motion } from 'motion/react';

interface WavyTransitionProps {
  inverted?: boolean;
}

export const WavyTransition: React.FC<WavyTransitionProps> = ({ inverted = false }) => {
  return (
    <div className={`relative w-full overflow-hidden leading-[0] ${inverted ? 'bg-white' : 'bg-black'}`}>
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className={`relative block w-full h-[80px] md:h-[120px] ${inverted ? 'rotate-180' : ''}`}
      >
        {/* Layer 1: Darkest Gray */}
        <motion.path
          initial={{ d: "M0,0 C200,20 400,0 600,30 C800,60 1000,40 1200,20 L1200,120 L0,120 Z" }}
          animate={{ 
            d: [
              "M0,0 C200,20 400,0 600,30 C800,60 1000,40 1200,20 L1200,120 L0,120 Z",
              "M0,0 C250,10 450,20 650,10 C850,40 1050,60 1200,30 L1200,120 L0,120 Z",
              "M0,0 C200,20 400,0 600,30 C800,60 1000,40 1200,20 L1200,120 L0,120 Z"
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          fill="#111111"
        />
        {/* Layer 2: Medium Dark Gray */}
        <motion.path
          initial={{ d: "M0,20 C150,40 350,20 550,50 C750,80 950,60 1200,40 L1200,120 L0,120 Z" }}
          animate={{ 
            d: [
              "M0,20 C150,40 350,20 550,50 C750,80 950,60 1200,40 L1200,120 L0,120 Z",
              "M0,20 C200,30 400,40 600,20 C800,50 1000,70 1200,50 L1200,120 L0,120 Z",
              "M0,20 C150,40 350,20 550,50 C750,80 950,60 1200,40 L1200,120 L0,120 Z"
            ]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          fill="#222222"
        />
        {/* Layer 3: Medium Gray */}
        <motion.path
          initial={{ d: "M0,40 C250,60 450,40 650,70 C850,100 1050,80 1200,60 L1200,120 L0,120 Z" }}
          animate={{ 
            d: [
              "M0,40 C250,60 450,40 650,70 C850,100 1050,80 1200,60 L1200,120 L0,120 Z",
              "M0,40 C300,50 500,60 700,40 C900,70 1100,90 1200,70 L1200,120 L0,120 Z",
              "M0,40 C250,60 450,40 650,70 C850,100 1050,80 1200,60 L1200,120 L0,120 Z"
            ]
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          fill="#444444"
        />
        {/* Layer 4: Light Gray */}
        <motion.path
          initial={{ d: "M0,60 C300,80 500,60 700,90 C900,120 1100,100 1200,80 L1200,120 L0,120 Z" }}
          animate={{ 
            d: [
              "M0,60 C300,80 500,60 700,90 C900,120 1100,100 1200,80 L1200,120 L0,120 Z",
              "M0,60 C350,70 550,80 750,60 C950,90 1150,110 1200,90 L1200,120 L0,120 Z",
              "M0,60 C300,80 500,60 700,90 C900,120 1100,100 1200,80 L1200,120 L0,120 Z"
            ]
          }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          fill="#888888"
        />
        {/* Layer 5: White */}
        <motion.path
          initial={{ d: "M0,80 C350,100 550,80 750,110 C950,140 1150,120 1200,100 L1200,120 L0,120 Z" }}
          animate={{ 
            d: [
              "M0,80 C350,100 550,80 750,110 C950,140 1150,120 1200,100 L1200,120 L0,120 Z",
              "M0,80 C400,90 600,100 800,80 C1000,110 1200,130 1200,110 L1200,120 L0,120 Z",
              "M0,80 C350,100 550,80 750,110 C950,140 1150,120 1200,100 L1200,120 L0,120 Z"
            ]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          fill="#ffffff"
        />
      </svg>
    </div>
  );
};
