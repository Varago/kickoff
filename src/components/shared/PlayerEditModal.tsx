import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Star, Save } from 'lucide-react';
import { Player, SKILL_LEVELS } from '../../types';
import { useGameStore } from '../../store/gameStore';

interface PlayerEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player | null;
}

export const PlayerEditModal: React.FC<PlayerEditModalProps> = ({
  isOpen,
  onClose,
  player
}) => {
  const { updatePlayer } = useGameStore();
  const [name, setName] = useState('');
  const [skillLevel, setSkillLevel] = useState<number>(3);
  const [errors, setErrors] = useState<{ name?: string }>({});

  useEffect(() => {
    if (player) {
      setName(player.name);
      setSkillLevel(player.skillLevel);
      setErrors({});
    }
  }, [player]);

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const validateForm = () => {
    const newErrors: { name?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Player name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!player || !validateForm()) return;

    updatePlayer(player.id, {
      name: name.trim(),
      skillLevel
    });

    handleClose();
  };

  if (!isOpen || !player) return null;


  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-surface-dark border border-gray-600 rounded-lg w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-600">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center">
                <User className="text-blue-400" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Edit Player</h3>
                <p className="text-sm text-gray-400">Update player information</p>
              </div>
            </div>
            <motion.button
              onClick={handleClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-600/20 transition-all"
            >
              <X size={16} />
            </motion.button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Player Name */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Player Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({});
                }}
                placeholder="Enter player name"
                className={`
                  w-full bg-surface-elevated border rounded-lg px-3 py-2 text-white placeholder-gray-500
                  focus:outline-none transition-colors
                  ${errors.name
                    ? 'border-red-500 focus:border-red-400'
                    : 'border-gray-600 focus:border-blue-400'
                  }
                `}
                maxLength={30}
                autoFocus
              />
              {errors.name && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm mt-1"
                >
                  {errors.name}
                </motion.p>
              )}
            </div>

            {/* Skill Level */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Skill Level
              </label>
              <div className="space-y-2">
                {SKILL_LEVELS.map((level) => (
                  <motion.button
                    key={level.value}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSkillLevel(level.value)}
                    className={`
                      w-full p-3 rounded-lg border-2 transition-all text-left
                      ${skillLevel === level.value
                        ? 'border-blue-400 bg-blue-500/10 text-blue-400'
                        : 'border-gray-600 bg-surface-elevated text-gray-400 hover:border-gray-500 hover:text-white'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{level.label}</div>
                        <div className="text-xs opacity-80">{level.description}</div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={`
                              ${i < level.value
                                ? (skillLevel === level.value ? 'text-blue-400 fill-current' : 'text-yellow-400 fill-current')
                                : 'text-gray-600'
                              }
                            `}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-gray-600">
            <motion.button
              onClick={handleClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              onClick={handleSave}
              disabled={!name.trim()}
              whileHover={name.trim() ? { scale: 1.02 } : {}}
              whileTap={name.trim() ? { scale: 0.98 } : {}}
              className={`
                flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2
                ${name.trim()
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              <Save size={16} />
              <span>Save Changes</span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};