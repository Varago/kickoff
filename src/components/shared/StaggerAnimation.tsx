import React from 'react';
import { motion, Variants } from 'framer-motion';

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  initial?: string;
  animate?: string;
  exit?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  duration?: number;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  className = '',
  staggerDelay = 0.1,
  initial = 'hidden',
  animate = 'visible',
  exit = 'exit',
  direction = 'up',
  distance = 20,
  duration = 0.6
}) => {
  const getDirection = () => {
    switch (direction) {
      case 'up': return { y: distance };
      case 'down': return { y: -distance };
      case 'left': return { x: distance };
      case 'right': return { x: -distance };
      default: return { y: distance };
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: staggerDelay / 2,
        staggerDirection: -1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      ...getDirection()
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration,
        ease: 'easeOut'
      }
    },
    exit: {
      opacity: 0,
      ...getDirection(),
      transition: {
        duration: duration / 2,
        ease: 'easeIn'
      }
    }
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial={initial}
      animate={animate}
      exit={exit}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Preset stagger animations for common use cases
export const StaggerPresets = {
  // List items appearing from bottom
  list: {
    staggerDelay: 0.05,
    direction: 'up' as const,
    distance: 15,
    duration: 0.4
  },

  // Cards appearing with more dramatic effect
  cards: {
    staggerDelay: 0.1,
    direction: 'up' as const,
    distance: 30,
    duration: 0.6
  },

  // Navigation items
  navigation: {
    staggerDelay: 0.03,
    direction: 'right' as const,
    distance: 10,
    duration: 0.3
  },

  // Stats or numbers
  stats: {
    staggerDelay: 0.08,
    direction: 'up' as const,
    distance: 20,
    duration: 0.5
  },

  // Team players
  players: {
    staggerDelay: 0.06,
    direction: 'left' as const,
    distance: 25,
    duration: 0.5
  }
};

// Specific component for staggered lists
interface StaggeredListProps {
  items: React.ReactNode[];
  className?: string;
  itemClassName?: string;
  preset?: keyof typeof StaggerPresets;
  customConfig?: Partial<StaggerContainerProps>;
}

export const StaggeredList: React.FC<StaggeredListProps> = ({
  items,
  className = '',
  itemClassName = '',
  preset = 'list',
  customConfig = {}
}) => {
  const config = { ...StaggerPresets[preset], ...customConfig };

  return (
    <StaggerContainer className={className} {...config}>
      {items.map((item, index) => (
        <div key={index} className={itemClassName}>
          {item}
        </div>
      ))}
    </StaggerContainer>
  );
};

// Wave animation for sequential highlighting
interface WaveAnimationProps {
  children: React.ReactNode[];
  className?: string;
  duration?: number;
  delay?: number;
  color?: string;
}

export const WaveAnimation: React.FC<WaveAnimationProps> = ({
  children,
  className = '',
  duration = 2,
  delay = 0.2,
  color = '#00DC82'
}) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          animate={{
            backgroundColor: [
              'transparent',
              `${color}20`,
              'transparent'
            ]
          }}
          transition={{
            duration,
            delay: index * delay,
            repeat: Infinity,
            repeatDelay: (children.length - 1) * delay
          }}
          className="rounded-lg"
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
};

// Cascade animation for overlapping effects
interface CascadeAnimationProps {
  children: React.ReactNode[];
  className?: string;
  direction?: 'horizontal' | 'vertical';
  overlap?: number;
}

export const CascadeAnimation: React.FC<CascadeAnimationProps> = ({
  children,
  className = '',
  direction = 'vertical',
  overlap = 0.3
}) => {
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: overlap,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: direction === 'vertical' ? 50 : 0,
      x: direction === 'horizontal' ? 50 : 0
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Typewriter effect for text
interface TypewriterProps {
  text: string;
  className?: string;
  speed?: number;
  cursor?: boolean;
}

export const Typewriter: React.FC<TypewriterProps> = ({
  text,
  className = '',
  speed = 50,
  cursor = true
}) => {
  const [displayText, setDisplayText] = React.useState('');
  const [showCursor, setShowCursor] = React.useState(true);

  React.useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      setDisplayText(text.substring(0, index + 1));
      index++;

      if (index >= text.length) {
        clearInterval(timer);
        if (cursor) {
          setTimeout(() => setShowCursor(false), 1000);
        }
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, cursor]);

  React.useEffect(() => {
    if (cursor && displayText.length < text.length) {
      const cursorTimer = setInterval(() => {
        setShowCursor(prev => !prev);
      }, 500);

      return () => clearInterval(cursorTimer);
    }
  }, [cursor, displayText.length, text.length]);

  return (
    <span className={className}>
      {displayText}
      {cursor && showCursor && <span className="animate-pulse">|</span>}
    </span>
  );
};