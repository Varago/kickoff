import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

interface CompactControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  description?: string;
  unit?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const CompactControl: React.FC<CompactControlProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  description,
  unit,
  disabled = false,
  size = 'md'
}) => {
  const handleDecrement = () => {
    const newValue = Math.max(min, value - step);
    if (newValue !== value) {
      onChange(newValue);
    }
  };

  const handleIncrement = () => {
    const newValue = Math.min(max, value + step);
    if (newValue !== value) {
      onChange(newValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = parseInt(e.target.value);
    if (!isNaN(inputValue) && inputValue >= min && inputValue <= max) {
      onChange(inputValue);
    }
  };

  const canDecrement = value > min && !disabled;
  const canIncrement = value < max && !disabled;

  // Size-based styling
  const sizeStyles = {
    sm: {
      container: 'p-3',
      button: 'w-8 h-8',
      icon: 14,
      input: 'text-lg',
      label: 'text-sm',
      description: 'text-xs'
    },
    md: {
      container: 'p-4',
      button: 'w-10 h-10',
      icon: 16,
      input: 'text-xl',
      label: 'text-sm',
      description: 'text-xs'
    },
    lg: {
      container: 'p-5',
      button: 'w-12 h-12',
      icon: 18,
      input: 'text-2xl',
      label: 'text-base',
      description: 'text-sm'
    }
  };

  const styles = sizeStyles[size];

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className={`font-medium text-gray-300 ${styles.label}`}>
          {label}
        </label>
        <div className="flex items-center space-x-1">
          <span className={`font-bold text-pitch-green ${styles.input}`}>
            {value}
          </span>
          {unit && (
            <span className={`text-gray-400 ${styles.description}`}>
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Compact Control Row */}
      <div className={`bg-surface-elevated border border-gray-600 rounded-lg ${styles.container}`}>
        <div className="flex items-center justify-between space-x-4">
          {/* Decrement Button */}
          <motion.button
            onClick={handleDecrement}
            disabled={!canDecrement}
            whileHover={canDecrement ? { scale: 1.05 } : {}}
            whileTap={canDecrement ? { scale: 0.95 } : {}}
            className={`
              mobile-touch-target ${styles.button} rounded-lg flex items-center justify-center transition-all
              ${canDecrement
                ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed border border-gray-600'
              }
            `}
            title={`Decrease ${label.toLowerCase()}`}
          >
            <Minus size={styles.icon} />
          </motion.button>

          {/* Value Display/Input */}
          <div className="flex-1 text-center space-y-1">
            <input
              type="number"
              value={value}
              onChange={handleInputChange}
              min={min}
              max={max}
              step={step}
              disabled={disabled}
              className={`
                w-full bg-transparent text-center ${styles.input} font-bold text-white
                border-b-2 border-transparent hover:border-gray-500 focus:border-pitch-green
                focus:outline-none transition-colors disabled:cursor-not-allowed
                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
              `}
            />
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
              <span>{min}</span>
              <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-pitch-green rounded-full transition-all duration-300"
                  style={{
                    width: `${((value - min) / (max - min)) * 100}%`
                  }}
                />
              </div>
              <span>{max}</span>
            </div>
          </div>

          {/* Increment Button */}
          <motion.button
            onClick={handleIncrement}
            disabled={!canIncrement}
            whileHover={canIncrement ? { scale: 1.05 } : {}}
            whileTap={canIncrement ? { scale: 0.95 } : {}}
            className={`
              mobile-touch-target ${styles.button} rounded-lg flex items-center justify-center transition-all
              ${canIncrement
                ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed border border-gray-600'
              }
            `}
            title={`Increase ${label.toLowerCase()}`}
          >
            <Plus size={styles.icon} />
          </motion.button>
        </div>
      </div>

      {/* Description */}
      {description && (
        <p className={`text-gray-400 ${styles.description} text-center`}>
          {description}
        </p>
      )}
    </div>
  );
};