import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Zap, CheckCircle, Clock } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { isValidPlayerName } from '../../utils/helpers';
import { Card } from '../shared/Card';
import { useHaptic } from '../../hooks/useHaptic';
import { useSounds } from '../../hooks/useSoundSystem';
import { useKeyboardHandler } from '../../hooks/useKeyboardHandler';
import { SKILL_LEVELS } from '../../types';

interface QuickAddFormProps {
  onPlayerAdded?: () => void;
}

export const QuickAddForm: React.FC<QuickAddFormProps> = ({ onPlayerAdded }) => {
  const { players, addPlayer } = useGameStore();
  const [playerName, setPlayerName] = useState('');
  const [selectedSkill, setSelectedSkill] = useState(2);
  const [nameError, setNameError] = useState('');
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const [isQuickMode, setIsQuickMode] = useState(false);
  const [addToWaitlist, setAddToWaitlist] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const haptic = useHaptic();
  const { sounds } = useSounds();
  const { isKeyboardVisible } = useKeyboardHandler();

  // Auto-focus input on mount and after successful add
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [lastAddedId]);

  // Clear success message after delay
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const handleAddPlayer = async () => {
    const trimmedName = playerName.trim();

    // Validation
    if (!isValidPlayerName(trimmedName)) {
      setNameError('Name must be 2-30 characters (letters, spaces, hyphens, apostrophes only)');
      haptic.warning();
      sounds.error();
      return;
    }

    // Check for duplicate names
    if (players.some(p => p.name.toLowerCase() === trimmedName.toLowerCase())) {
      setNameError('Player name already exists');
      haptic.warning();
      sounds.error();
      return;
    }

    // Add player
    addPlayer(trimmedName, selectedSkill, addToWaitlist);

    // Success feedback
    haptic.success();
    sounds.playerAdded();
    setShowSuccess(true);
    setLastAddedId(`${Date.now()}`); // Trigger re-focus

    // Reset form but keep skill level
    setPlayerName('');
    setNameError('');

    // Callback for parent component
    onPlayerAdded?.();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && playerName.trim()) {
      e.preventDefault();
      handleAddPlayer();
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayerName(e.target.value);
    setNameError('');
  };

  // Use proper skill levels from types
  const skillPresets = SKILL_LEVELS.map(skill => ({
    level: skill.value,
    label: skill.label,
    description: skill.description,
    color: skill.value === 1 ? 'bg-orange-500' :
           skill.value === 2 ? 'bg-yellow-500' :
           skill.value === 3 ? 'bg-blue-500' :
           skill.value === 4 ? 'bg-purple-500' :
           'bg-green-500'
  }));

  const activePlayers = players.filter(p => !p.isWaitlist);

  return (
    <Card
      glass
      padding="lg"
      className={`sticky top-4 z-20 border-pitch-green/20 mobile-form-container ${
        isKeyboardVisible ? 'keyboard-active' : ''
      }`}
    >
      <div className="space-y-4">
        {/* Header with Quick Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-pitch-green rounded-lg flex items-center justify-center">
              <Plus className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Quick Add Players</h2>
              <p className="text-sm text-gray-400">
                {activePlayers.length} player{activePlayers.length !== 1 ? 's' : ''} registered
              </p>
            </div>
          </div>

          {/* Mode Toggles - Hide on mobile when keyboard is visible */}
          {!isKeyboardVisible && (
            <div className="flex space-x-2">
              {/* Waitlist Toggle */}
              <button
                onClick={() => setAddToWaitlist(!addToWaitlist)}
                className={`
                  mobile-touch-target flex items-center space-x-2 px-3 py-2 rounded-lg transition-all
                  ${addToWaitlist
                    ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/25'
                    : 'bg-surface-elevated text-gray-400 hover:text-white'
                  }
                `}
              >
                <Clock size={16} />
                <span className="text-xs font-medium">Waitlist</span>
              </button>

              {/* Quick Mode Toggle */}
              <button
                onClick={() => setIsQuickMode(!isQuickMode)}
                className={`
                  mobile-touch-target flex items-center space-x-2 px-3 py-2 rounded-lg transition-all
                  ${isQuickMode
                    ? 'bg-pitch-green text-white shadow-lg shadow-pitch-green/25'
                    : 'bg-surface-elevated text-gray-400 hover:text-white'
                  }
                `}
              >
                <Zap size={16} />
                <span className="text-xs font-medium">Quick</span>
              </button>
            </div>
          )}
        </div>

        {/* Main Input Form */}
        <div className="space-y-4">
          {/* Name Input with Inline Add */}
          <div className="flex space-x-3">
            <div className="flex-1">
              <input
                ref={inputRef}
                type="text"
                value={playerName}
                onChange={handleNameChange}
                onKeyPress={handleKeyPress}
                placeholder={
                  isQuickMode
                    ? `Name + Enter to add${addToWaitlist ? ' to waitlist' : ''}`
                    : `Enter player name${addToWaitlist ? ' (waitlist)' : ''}`
                }
                className={`
                  mobile-input w-full px-4 py-3 bg-surface-dark border rounded-lg
                  text-white placeholder-gray-400 text-lg
                  focus:outline-none focus:ring-2 focus:ring-pitch-green focus:border-pitch-green
                  transition-all duration-200
                  ${nameError ? 'border-red-500 focus:ring-red-500' : 'border-gray-600'}
                `}
                maxLength={30}
                autoComplete="off"
              />

              {/* Inline Error */}
              <AnimatePresence>
                {nameError && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="mt-1 text-sm text-red-400"
                  >
                    {nameError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Add Button */}
            <motion.button
              onClick={handleAddPlayer}
              disabled={!playerName.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                mobile-touch-target px-6 py-3 rounded-lg font-medium transition-all duration-200
                flex items-center space-x-2 min-w-[100px] justify-center
                ${playerName.trim()
                  ? addToWaitlist
                    ? 'bg-yellow-500 text-white shadow-lg hover:shadow-xl hover:bg-yellow-600'
                    : 'bg-pitch-green text-white shadow-lg hover:shadow-xl hover:bg-green-500'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              <Plus size={18} />
              <span>Add</span>
            </motion.button>
          </div>

          {/* Mobile-Optimized Skill Level Selector */}
          {!isQuickMode && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">
                  Skill Level: {skillPresets.find(s => s.level === selectedSkill)?.label || 'Custom'}
                </label>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-2.5 h-2.5 rounded-full ${
                        i < selectedSkill ? 'bg-pitch-green' : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Mobile Skill Picker */}
              {isKeyboardVisible ? (
                // Compact horizontal selector when keyboard is visible
                <div className="skill-picker-mobile">
                  {skillPresets.map((preset) => (
                    <button
                      key={preset.level}
                      onClick={() => setSelectedSkill(preset.level)}
                      className={`skill-option-mobile ${
                        selectedSkill === preset.level ? 'selected' : ''
                      }`}
                    >
                      <div className="skill-level">{preset.level}</div>
                      <div className="skill-label">{preset.label}</div>
                    </button>
                  ))}
                </div>
              ) : (
                // Full grid layout when keyboard is hidden
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {skillPresets.map((preset) => (
                    <button
                      key={preset.level}
                      onClick={() => setSelectedSkill(preset.level)}
                      className={`
                        mobile-touch-target px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200
                        flex flex-col items-center justify-center space-y-1 min-h-[60px]
                        ${selectedSkill === preset.level
                          ? 'bg-pitch-green text-white shadow-lg border-2 border-pitch-green'
                          : 'bg-surface-elevated text-gray-400 hover:text-white hover:bg-gray-600 border-2 border-transparent'
                        }
                      `}
                    >
                      <div className={`w-3 h-3 rounded-full ${preset.color}`} />
                      <span className="font-semibold">{preset.level}</span>
                      <span className="text-xs">{preset.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Mode Info - Hide when keyboard is visible for space */}
          {(isQuickMode || addToWaitlist) && !isKeyboardVisible && (
            <div className={`border rounded-lg p-3 ${
              addToWaitlist
                ? 'bg-yellow-500/10 border-yellow-500/20'
                : 'bg-pitch-green/10 border-pitch-green/20'
            }`}>
              <div className={`flex items-center space-x-2 ${
                addToWaitlist ? 'text-yellow-400' : 'text-pitch-green'
              }`}>
                {addToWaitlist ? <Clock size={16} /> : <Zap size={16} />}
                <span className="text-sm font-medium">
                  {addToWaitlist ? 'Waitlist Mode' : 'Quick Mode'}: Using skill level {selectedSkill} ({skillPresets.find(s => s.level === selectedSkill)?.label})
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {addToWaitlist
                  ? 'Adding players to the waitlist queue'
                  : 'Type name and press Enter for lightning-fast adds'
                }
              </p>
            </div>
          )}
        </div>

        {/* Success Indicator */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="flex items-center justify-center space-x-2 py-2"
            >
              <CheckCircle className="text-green-400" size={16} />
              <span className="text-sm text-green-400 font-medium">
                Player added{addToWaitlist ? ' to waitlist' : ''}!
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Keyboard Shortcuts Hint - Hide when keyboard is visible */}
        {!isKeyboardVisible && (
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Press <kbd className="px-1.5 py-0.5 bg-gray-600 rounded text-xs">Enter</kbd> to add •
              <kbd className="px-1.5 py-0.5 bg-gray-600 rounded text-xs ml-1">Tab</kbd> to skill level
            </p>
          </div>
        )}

        {/* Keyboard Toolbar for mobile */}
        {isKeyboardVisible && (
          <div className="keyboard-toolbar visible">
            <div className="keyboard-toolbar-content">
              <div className="text-sm text-gray-300">
                Skill: {skillPresets.find(s => s.level === selectedSkill)?.label}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleAddPlayer}
                  disabled={!playerName.trim()}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${playerName.trim()
                      ? 'bg-pitch-green text-white'
                      : 'bg-gray-600 text-gray-400'
                    }
                  `}
                >
                  Add Player
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};