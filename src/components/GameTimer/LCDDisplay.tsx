import React from 'react';
import { motion } from 'framer-motion';

interface LCDDisplayProps {
  time: string;
  status: 'running' | 'paused' | 'stopped';
  timeRemaining: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const LCDDisplay: React.FC<LCDDisplayProps> = ({
  time,
  status,
  timeRemaining,
  size = 'xl'
}) => {
  const isLowTime = timeRemaining <= 10;
  const isCriticalTime = timeRemaining <= 30;
  const isWarningTime = timeRemaining <= 60;

  const sizeClasses = {
    sm: 'text-4xl',
    md: 'text-6xl',
    lg: 'text-7xl',
    xl: 'text-8xl md:text-9xl'
  };

  const getDisplayColor = () => {
    if (isLowTime) return 'text-red-400';
    if (isCriticalTime) return 'text-orange-400';
    if (isWarningTime) return 'text-yellow-400';
    return 'text-pitch-green';
  };

  const getGlowColor = () => {
    if (isLowTime) return 'rgba(248, 113, 113, 0.8)';
    if (isCriticalTime) return 'rgba(251, 146, 60, 0.6)';
    if (isWarningTime) return 'rgba(251, 191, 36, 0.4)';
    return 'rgba(0, 220, 130, 0.5)';
  };

  const shouldPulse = status === 'running' && isLowTime;

  return (
    <div className="relative flex items-center justify-center">
      {/* Background glow */}
      <motion.div
        className="absolute inset-0 rounded-xl blur-xl"
        animate={{
          background: `radial-gradient(ellipse at center, ${getGlowColor()} 0%, transparent 70%)`,
          scale: shouldPulse ? [1, 1.1, 1] : 1
        }}
        transition={{
          scale: shouldPulse ? {
            duration: 0.5,
            repeat: Infinity,
            ease: 'easeInOut'
          } : { duration: 0.3 }
        }}
      />

      {/* Main LCD container */}
      <motion.div
        className="relative px-8 py-6 bg-black/80 rounded-xl border border-gray-700/50 backdrop-blur-sm"
        animate={{
          boxShadow: shouldPulse ? [
            `0 0 20px ${getGlowColor()}`,
            `0 0 40px ${getGlowColor()}`,
            `0 0 20px ${getGlowColor()}`
          ] : `0 0 20px ${getGlowColor()}`
        }}
        transition={{
          boxShadow: shouldPulse ? {
            duration: 0.5,
            repeat: Infinity,
            ease: 'easeInOut'
          } : { duration: 0.3 }
        }}
      >
        {/* LCD scan lines overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full opacity-20">
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={i}
                className="h-px bg-gradient-to-r from-transparent via-white to-transparent mb-2"
                style={{ marginTop: `${i * 12}%` }}
              />
            ))}
          </div>
        </div>

        {/* Time display */}
        <motion.div
          className={`
            font-mono ${sizeClasses[size]} font-bold tracking-wider
            ${getDisplayColor()}
            lcd-display relative z-10
            transition-all duration-300
          `}
          animate={{
            textShadow: shouldPulse ? [
              `0 0 20px ${getGlowColor()}`,
              `0 0 40px ${getGlowColor()}`,
              `0 0 20px ${getGlowColor()}`
            ] : `0 0 20px ${getGlowColor()}`,
            filter: shouldPulse ? [
              'brightness(1)',
              'brightness(1.3)',
              'brightness(1)'
            ] : 'brightness(1)'
          }}
          transition={{
            textShadow: shouldPulse ? {
              duration: 0.5,
              repeat: Infinity,
              ease: 'easeInOut'
            } : { duration: 0.3 },
            filter: shouldPulse ? {
              duration: 0.5,
              repeat: Infinity,
              ease: 'easeInOut'
            } : { duration: 0.3 }
          }}
        >
          {/* Individual digits with stagger animation */}
          {time.split('').map((char, index) => (
            <motion.span
              key={`${index}-${char}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
                type: 'spring',
                stiffness: 300,
                damping: 25
              }}
              className="inline-block"
              style={{
                textShadow: `0 0 20px ${getGlowColor()}`
              }}
            >
              {char}
            </motion.span>
          ))}
        </motion.div>

        {/* Status indicator */}
        <div className="absolute top-2 right-2">
          <motion.div
            className={`w-3 h-3 rounded-full ${
              status === 'running' ? 'bg-green-400' :
              status === 'paused' ? 'bg-yellow-400' :
              'bg-gray-400'
            }`}
            animate={{
              opacity: status === 'running' ? [1, 0.3, 1] : 1,
              scale: shouldPulse ? [1, 1.2, 1] : 1
            }}
            transition={{
              opacity: status === 'running' ? {
                duration: 1,
                repeat: Infinity,
                ease: 'easeInOut'
              } : {},
              scale: shouldPulse ? {
                duration: 0.5,
                repeat: Infinity,
                ease: 'easeInOut'
              } : { duration: 0.3 }
            }}
            style={{
              boxShadow: `0 0 10px ${
                status === 'running' ? '#4ade80' :
                status === 'paused' ? '#facc15' :
                '#9ca3af'
              }`
            }}
          />
        </div>

        {/* Critical time overlay */}
        {isLowTime && status === 'running' && (
          <motion.div
            className="absolute inset-0 bg-red-500/10 rounded-xl pointer-events-none"
            animate={{
              opacity: [0, 0.3, 0]
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        )}
      </motion.div>

      {/* Warning indicators */}
      {isWarningTime && status === 'running' && (
        <div className="absolute -bottom-4 flex space-x-1">
          {Array.from({ length: 3 }, (_, i) => (
            <motion.div
              key={i}
              className={`w-2 h-2 rounded-full ${
                isLowTime ? 'bg-red-400' :
                isCriticalTime ? 'bg-orange-400' :
                'bg-yellow-400'
              }`}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};