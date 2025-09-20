import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

interface BoxControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  description: string;
  unit?: string;
  disabled?: boolean;
}

export const BoxControl: React.FC<BoxControlProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  description,
  unit,
  disabled = false
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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        <span className="text-sm text-white font-medium">
          {value}{unit && ` ${unit}`}
        </span>
      </div>

      {/* Control Box */}
      <div className="bg-surface-elevated border border-gray-600 rounded-lg p-4">
        <div className="flex items-center justify-between space-x-4">
          {/* Decrement Button */}
          <motion.button
            onClick={handleDecrement}
            disabled={!canDecrement}
            whileHover={canDecrement ? { scale: 1.05 } : {}}
            whileTap={canDecrement ? { scale: 0.95 } : {}}
            className={`
              w-12 h-12 rounded-lg flex items-center justify-center transition-all
              ${canDecrement
                ? 'bg-gray-600 hover:bg-gray-500 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }
            `}
            title={`Decrease ${label.toLowerCase()}`}
          >
            <Minus size={18} />
          </motion.button>

          {/* Value Display/Input */}
          <div className="flex-1 text-center">
            <input
              type="number"
              value={value}
              onChange={handleInputChange}
              min={min}
              max={max}
              step={step}
              disabled={disabled}
              className="w-20 bg-transparent text-center text-2xl font-bold text-white border-b-2 border-transparent hover:border-gray-500 focus:border-pitch-green focus:outline-none transition-colors disabled:cursor-not-allowed"
            />
            {unit && (
              <div className="text-xs text-gray-400 mt-1">{unit}</div>
            )}
          </div>

          {/* Increment Button */}
          <motion.button
            onClick={handleIncrement}
            disabled={!canIncrement}
            whileHover={canIncrement ? { scale: 1.05 } : {}}
            whileTap={canIncrement ? { scale: 0.95 } : {}}
            className={`
              w-12 h-12 rounded-lg flex items-center justify-center transition-all
              ${canIncrement
                ? 'bg-gray-600 hover:bg-gray-500 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }
            `}
            title={`Increase ${label.toLowerCase()}`}
          >
            <Plus size={18} />
          </motion.button>
        </div>

        {/* Range Indicator */}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
          <span>Min: {min}</span>
          <div className="flex-1 mx-3 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-pitch-green rounded-full transition-all duration-300"
              style={{
                width: `${((value - min) / (max - min)) * 100}%`
              }}
            />
          </div>
          <span>Max: {max}</span>
        </div>
      </div>

      <p className="text-xs text-gray-400">{description}</p>
    </div>
  );
};