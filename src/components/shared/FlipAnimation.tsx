import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FlipAnimationProps {
  children: React.ReactNode;
  trigger: any; // Value that triggers the flip when it changes
  direction?: 'horizontal' | 'vertical';
  duration?: number;
  className?: string;
}

export const FlipAnimation: React.FC<FlipAnimationProps> = ({
  children,
  trigger,
  direction = 'vertical',
  duration = 0.6,
  className = ''
}) => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [content, setContent] = useState(children);

  useEffect(() => {
    setIsFlipping(true);

    const midpoint = setTimeout(() => {
      setContent(children);
    }, (duration * 1000) / 2);

    const complete = setTimeout(() => {
      setIsFlipping(false);
    }, duration * 1000);

    return () => {
      clearTimeout(midpoint);
      clearTimeout(complete);
    };
  }, [trigger, children, duration]);

  const rotateAxis = direction === 'horizontal' ? 'rotateY' : 'rotateX';

  return (
    <div className={`relative ${className}`} style={{ perspective: '1000px' }}>
      <motion.div
        animate={{
          [rotateAxis]: isFlipping ? 180 : 0,
        }}
        transition={{
          duration,
          ease: 'easeInOut'
        }}
        style={{
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden'
        }}
      >
        {content}
      </motion.div>
    </div>
  );
};

// Score flip component specifically for numbers
interface ScoreFlipProps {
  value: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const ScoreFlip: React.FC<ScoreFlipProps> = ({
  value,
  className = '',
  size = 'lg'
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isFlipping, setIsFlipping] = useState(false);

  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
    xl: 'text-8xl'
  };

  useEffect(() => {
    if (value !== displayValue) {
      setIsFlipping(true);

      setTimeout(() => {
        setDisplayValue(value);
      }, 300);

      setTimeout(() => {
        setIsFlipping(false);
      }, 600);
    }
  }, [value, displayValue]);

  return (
    <div className={`relative inline-block ${className}`} style={{ perspective: '1000px' }}>
      <motion.div
        className={`font-bold font-mono ${sizeClasses[size]} text-center`}
        animate={{
          rotateX: isFlipping ? 180 : 0,
          scale: isFlipping ? [1, 1.1, 1] : 1
        }}
        transition={{
          duration: 0.6,
          ease: 'easeInOut'
        }}
        style={{
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden'
        }}
      >
        {displayValue}
      </motion.div>

      {/* Glow effect during flip */}
      <AnimatePresence>
        {isFlipping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-pitch-green/20 rounded-lg blur-lg -z-10"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Card flip for team cards or player cards
interface CardFlipProps {
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  isFlipped: boolean;
  className?: string;
}

export const CardFlip: React.FC<CardFlipProps> = ({
  frontContent,
  backContent,
  isFlipped,
  className = ''
}) => {
  return (
    <div className={`relative ${className}`} style={{ perspective: '1000px' }}>
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative w-full h-full"
      >
        {/* Front */}
        <div
          style={{ backfaceVisibility: 'hidden' }}
          className="absolute inset-0 w-full h-full"
        >
          {frontContent}
        </div>

        {/* Back */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
          className="absolute inset-0 w-full h-full"
        >
          {backContent}
        </div>
      </motion.div>
    </div>
  );
};

// Text flip for changing text content
interface TextFlipProps {
  text: string;
  className?: string;
  direction?: 'up' | 'down';
}

export const TextFlip: React.FC<TextFlipProps> = ({
  text,
  className = '',
  direction = 'up'
}) => {
  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (text !== displayText) {
      setIsAnimating(true);

      setTimeout(() => {
        setDisplayText(text);
      }, 150);

      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    }
  }, [text, displayText]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div
        animate={{
          y: isAnimating ? (direction === 'up' ? -20 : 20) : 0,
          opacity: isAnimating ? 0 : 1
        }}
        transition={{ duration: 0.15 }}
      >
        {displayText}
      </motion.div>
    </div>
  );
};