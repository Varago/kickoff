import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { TeamColor, TEAM_COLOR_OPTIONS } from '../../types';

interface ColorPickerProps {
  currentColor: TeamColor;
  availableColors: TeamColor[];
  onColorSelect: (color: TeamColor) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  currentColor,
  availableColors,
  onColorSelect,
  onClose,
  isOpen
}) => {
  const handleColorSelect = (color: TeamColor) => {
    onColorSelect(color);
    onClose();
  };

  const getColorInfo = (color: TeamColor) => {
    const colorMapping = {
      black: { name: 'Black', bg: 'bg-gray-800', border: 'border-gray-600' },
      white: { name: 'White', bg: 'bg-gray-200', border: 'border-gray-300' },
      orange: { name: 'Orange', bg: 'bg-orange-500', border: 'border-orange-400' },
      blue: { name: 'Blue', bg: 'bg-blue-500', border: 'border-blue-400' },
      yellow: { name: 'Yellow', bg: 'bg-yellow-500', border: 'border-yellow-400' },
      'no-pennies': { name: 'No Pennies', bg: 'bg-gradient-to-r from-green-400 to-blue-500', border: 'border-green-400' }
    };
    return colorMapping[color] || colorMapping['black'];
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-surface-dark border border-gray-600 rounded-lg p-6 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Choose Team Color</h3>
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-600/20 transition-all"
            >
              <X size={16} />
            </motion.button>
          </div>

          {/* Color Grid */}
          <div className="grid grid-cols-2 gap-3">
            {TEAM_COLOR_OPTIONS.map((color: TeamColor) => {
              const colorInfo = getColorInfo(color);
              const isAvailable = availableColors.includes(color) || color === currentColor;
              const isCurrent = color === currentColor;

              return (
                <motion.button
                  key={color}
                  onClick={() => isAvailable && handleColorSelect(color)}
                  disabled={!isAvailable}
                  whileHover={isAvailable ? { scale: 1.02 } : {}}
                  whileTap={isAvailable ? { scale: 0.98 } : {}}
                  className={`
                    relative p-4 rounded-lg border-2 transition-all
                    ${isAvailable
                      ? `${colorInfo.border} hover:shadow-lg`
                      : 'border-gray-600 opacity-50 cursor-not-allowed'
                    }
                    ${isCurrent ? 'ring-2 ring-pitch-green' : ''}
                  `}
                >
                  {/* Color Circle */}
                  <div className="flex items-center space-x-3">
                    <div className={`
                      w-8 h-8 rounded-full ${colorInfo.bg} border-2 border-white/20 flex items-center justify-center
                    `}>
                      {isCurrent && (
                        <Check size={14} className="text-white" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className={`font-medium text-sm ${
                        isAvailable ? 'text-white' : 'text-gray-500'
                      }`}>
                        {colorInfo.name}
                      </div>
                      {!isAvailable && color !== currentColor && (
                        <div className="text-xs text-red-400">In use</div>
                      )}
                      {isCurrent && (
                        <div className="text-xs text-pitch-green">Current</div>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Info */}
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="text-xs text-blue-400">
              Select a color to identify your team. Colors in use by other teams are disabled.
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};