import React from 'react';
import { motion } from 'framer-motion';

interface CircularProgressProps {
  percentage: number;
  size: number;
  strokeWidth: number;
  color: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  pulseOnLow?: boolean;
  timeRemaining?: number;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size,
  strokeWidth,
  color,
  backgroundColor = '#374151',
  showPercentage = false,
  pulseOnLow = false,
  timeRemaining = 0
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const shouldPulse = pulseOnLow && timeRemaining <= 10 && timeRemaining > 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          animate={{
            strokeDashoffset: offset,
            filter: shouldPulse ? [
              'drop-shadow(0 0 10px currentColor)',
              'drop-shadow(0 0 20px currentColor)',
              'drop-shadow(0 0 10px currentColor)'
            ] : 'drop-shadow(0 0 5px currentColor)'
          }}
          transition={{
            strokeDashoffset: { duration: 0.8, ease: 'easeInOut' },
            filter: shouldPulse ? {
              duration: 0.5,
              repeat: Infinity,
              ease: 'easeInOut'
            } : { duration: 0.3 }
          }}
          style={{
            filter: `drop-shadow(0 0 ${shouldPulse ? '15px' : '5px'} ${color})`
          }}
        />

        {/* Glow effect for low time */}
        {shouldPulse && (
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius + 2}
            stroke={color}
            strokeWidth="1"
            fill="transparent"
            opacity="0.6"
            animate={{
              r: [radius + 2, radius + 8, radius + 2],
              opacity: [0.6, 0.2, 0.6]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        )}
      </svg>

      {/* Center content */}
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-lg font-bold ${shouldPulse ? 'text-red-400' : 'text-white'}`}>
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
};