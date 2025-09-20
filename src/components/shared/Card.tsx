import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  glass = false,
  padding = 'md',
  onClick
}) => {
  const baseClasses = `
    rounded-xl border transition-all duration-300
    ${onClick ? 'cursor-pointer' : ''}
  `;

  const glassClasses = glass
    ? 'glass border-white/10'
    : 'bg-surface-elevated border-gray-700/50';

  const paddingClasses = {
    none: '',
    sm: 'p-2 sm:p-3',
    md: 'p-3 sm:p-4',
    lg: 'p-4 sm:p-6',
    xl: 'p-6 sm:p-8'
  };

  const hoverClasses = hover
    ? 'hover:scale-105 hover:shadow-2xl hover:border-pitch-green/30'
    : '';

  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { y: -2 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      className={`
        ${baseClasses}
        ${glassClasses}
        ${paddingClasses[padding]}
        ${hoverClasses}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};