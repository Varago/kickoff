import React from 'react';
import { motion } from 'framer-motion';
import { Vibrate, VolumeX, Play, Settings, Smartphone } from 'lucide-react';
import { useAdvancedHaptic } from '../../hooks/useAdvancedHaptic';
import { Card } from './Card';
import { Modal } from './Modal';

interface HapticSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  embedded?: boolean;
}

export const HapticSettings: React.FC<HapticSettingsProps> = ({ isOpen, onClose, embedded = false }) => {
  const {
    settings,
    updateSettings,
    isSupported,
    testHaptic,
    buttonPress,
    startDrag,
    successfulDrop,
    goalScored,
    matchStart,
    validationError
  } = useAdvancedHaptic();

  const intensityOptions = [
    { value: 'light', label: 'Light', description: 'Subtle vibrations' },
    { value: 'medium', label: 'Medium', description: 'Balanced feedback' },
    { value: 'heavy', label: 'Strong', description: 'Intense vibrations' }
  ];

  const testPatterns = [
    { type: 'tap', label: 'Button Tap', action: buttonPress },
    { type: 'dragStart', label: 'Drag Start', action: startDrag },
    { type: 'drop', label: 'Successful Drop', action: successfulDrop },
    { type: 'goal', label: 'Goal Scored', action: goalScored },
    { type: 'gameStart', label: 'Match Start', action: matchStart },
    { type: 'error', label: 'Error', action: validationError }
  ];

  const unsupportedContent = (
    <div className="text-center py-8">
      <Smartphone size={48} className="text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-white mb-2">Not Supported</h3>
      <p className="text-gray-400">
        Haptic feedback is not available on this device or browser.
      </p>
    </div>
  );

  if (!isSupported) {
    if (embedded) {
      return unsupportedContent;
    }
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Haptic Feedback">
        {unsupportedContent}
      </Modal>
    );
  }

  const content = (
    <div className="space-y-6">
        {/* Master Toggle */}
        <Card glass padding="lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              {settings.enabled ? (
                <Vibrate size={24} className="text-pitch-green" />
              ) : (
                <VolumeX size={24} className="text-gray-400" />
              )}
              <div>
                <h3 className="font-semibold text-white">Haptic Feedback</h3>
                <p className="text-sm text-gray-400">
                  {settings.enabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => updateSettings({ enabled: !settings.enabled })}
              className={`
                w-12 h-6 rounded-full transition-colors relative
                ${settings.enabled ? 'bg-pitch-green' : 'bg-gray-600'}
              `}
            >
              <motion.div
                animate={{ x: settings.enabled ? 24 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="w-6 h-6 bg-white rounded-full shadow-lg absolute top-0"
              />
            </motion.button>
          </div>

          {settings.enabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4"
            >
              {/* Intensity Selector */}
              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  Vibration Intensity
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {intensityOptions.map((option) => (
                    <motion.button
                      key={option.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        updateSettings({ intensity: option.value as any });
                        testHaptic('click');
                      }}
                      className={`
                        p-3 rounded-lg border-2 transition-all text-left
                        ${settings.intensity === option.value
                          ? 'border-pitch-green bg-pitch-green/10 text-pitch-green'
                          : 'border-gray-600 bg-surface-elevated text-gray-400 hover:border-gray-500 hover:text-white'
                        }
                      `}
                    >
                      <div className="font-medium text-sm">{option.label}</div>
                      <div className="text-xs opacity-80">{option.description}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Feature Toggles */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-white">Feedback Categories</h4>

                <div className="space-y-2">
                  {[
                    { key: 'feedbackOnNavigate', label: 'Navigation & Menus', description: 'Tab switches, menu interactions' },
                    { key: 'feedbackOnDrag', label: 'Drag & Drop', description: 'Player movement between teams' },
                    { key: 'feedbackOnSuccess', label: 'Success Actions', description: 'Goals, match completion' },
                    { key: 'feedbackOnError', label: 'Errors & Warnings', description: 'Validation errors, blocked actions' }
                  ].map((option) => (
                    <div key={option.key} className="flex items-center justify-between p-3 bg-surface-elevated rounded-lg">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">{option.label}</div>
                        <div className="text-xs text-gray-400">{option.description}</div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => updateSettings({
                          [option.key]: !settings[option.key as keyof typeof settings]
                        })}
                        className={`
                          w-10 h-5 rounded-full transition-colors relative ml-3
                          ${settings[option.key as keyof typeof settings] ? 'bg-pitch-green' : 'bg-gray-600'}
                        `}
                      >
                        <motion.div
                          animate={{
                            x: settings[option.key as keyof typeof settings] ? 20 : 0
                          }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="w-5 h-5 bg-white rounded-full shadow-lg absolute top-0"
                        />
                      </motion.button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </Card>

        {/* Test Patterns */}
        {settings.enabled && (
          <Card glass padding="lg">
            <div className="flex items-center space-x-3 mb-4">
              <Play size={20} className="text-blue-400" />
              <h3 className="font-semibold text-white">Test Vibration Patterns</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {testPatterns.map((pattern) => (
                <motion.button
                  key={pattern.type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={pattern.action}
                  className="p-3 bg-surface-elevated hover:bg-gray-600 rounded-lg border border-gray-600 hover:border-gray-500 transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{pattern.label}</span>
                    <Play size={12} className="text-gray-400" />
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center space-x-2 text-blue-400">
                <Settings size={16} />
                <span className="text-sm font-medium">Tip</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Haptic feedback helps you feel the app's responses. Adjust intensity based on your preference and device.
              </p>
            </div>
          </Card>
        )}

        {/* Close Button - only show in modal mode */}
        {!embedded && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="w-full bg-pitch-green hover:bg-green-500 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            Done
          </motion.button>
        )}
      </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Haptic Feedback Settings">
      {content}
    </Modal>
  );
};

// Quick Haptic Toggle Component
export const HapticToggle: React.FC = () => {
  const { settings, updateSettings, buttonPress } = useAdvancedHaptic();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => {
        updateSettings({ enabled: !settings.enabled });
        if (!settings.enabled) buttonPress(); // Test vibration when enabling
      }}
      className={`
        p-2 rounded-lg transition-colors
        ${settings.enabled
          ? 'bg-pitch-green/20 text-pitch-green hover:bg-pitch-green/30'
          : 'bg-gray-600/20 text-gray-400 hover:bg-gray-600/30'
        }
      `}
      title={settings.enabled ? 'Disable haptic feedback' : 'Enable haptic feedback'}
    >
      {settings.enabled ? <Vibrate size={20} /> : <VolumeX size={20} />}
    </motion.button>
  );
};