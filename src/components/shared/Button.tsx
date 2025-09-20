import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  type = 'button'
}) => {
  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-lg
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-midnight
    disabled:opacity-50 disabled:cursor-not-allowed
    haptic-button
  `;

  const variantClasses = {
    primary: `
      bg-pitch-green text-white hover:bg-green-500
      focus:ring-pitch-green shadow-lg hover:shadow-xl
      hover:shadow-green-500/25
    `,
    secondary: `
      bg-surface-elevated text-white hover:bg-gray-600
      focus:ring-gray-500 border border-gray-600
    `,
    success: `
      bg-green-600 text-white hover:bg-green-700
      focus:ring-green-500 shadow-lg hover:shadow-xl
    `,
    warning: `
      bg-yellow-600 text-white hover:bg-yellow-700
      focus:ring-yellow-500 shadow-lg hover:shadow-xl
    `,
    danger: `
      bg-red-600 text-white hover:bg-red-700
      focus:ring-red-500 shadow-lg hover:shadow-xl
    `,
    ghost: `
      bg-transparent text-white hover:bg-white/10
      focus:ring-white border border-white/20
    `
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[36px] touch-target',
    md: 'px-4 py-2.5 text-base min-h-[44px] touch-target',
    lg: 'px-6 py-3 text-lg min-h-[48px] touch-target'
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${widthClass}
        ${className}
      `}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </motion.button>
  );
};