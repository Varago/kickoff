import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Play, Settings } from 'lucide-react';
import { useSounds } from '../../hooks/useSoundSystem';
import { Card } from './Card';
import { Modal } from './Modal';

interface SoundSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  embedded?: boolean;
}

export const SoundSettings: React.FC<SoundSettingsProps> = ({ isOpen, onClose, embedded = false }) => {
  const { settings, updateSettings, testSound, sounds } = useSounds();

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(event.target.value);
    updateSettings({ volume });
  };

  const testSounds = [
    { type: 'whistle' as const, label: 'Match Whistle', description: 'Game start/end' },
    { type: 'goal' as const, label: 'Goal Sound', description: 'Score celebration' },
    { type: 'click' as const, label: 'Button Click', description: 'UI feedback' },
    { type: 'timer-end' as const, label: 'Timer Alert', description: 'Time expired' }
  ];

  const content = (
    <div className="space-y-6">
        {/* Master Controls */}
        <Card glass padding="lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              {settings.enabled ? (
                <Volume2 size={24} className="text-pitch-green" />
              ) : (
                <VolumeX size={24} className="text-gray-400" />
              )}
              <div>
                <h3 className="font-semibold text-white">Sound Effects</h3>
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

          {/* Volume Control */}
          {settings.enabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-white">Volume</label>
                  <span className="text-sm text-gray-400">
                    {Math.round(settings.volume * 100)}%
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.volume}
                    onChange={handleVolumeChange}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #00DC82 0%, #00DC82 ${settings.volume * 100}%, #4b5563 ${settings.volume * 100}%, #4b5563 100%)`
                    }}
                  />
                </div>
              </div>

              {/* Background Muting */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div>
                  <p className="text-sm font-medium text-white">Mute in Background</p>
                  <p className="text-xs text-gray-400">Disable sounds when app isn't visible</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => updateSettings({ mutedInBackground: !settings.mutedInBackground })}
                  className={`
                    w-10 h-5 rounded-full transition-colors relative
                    ${settings.mutedInBackground ? 'bg-pitch-green' : 'bg-gray-600'}
                  `}
                >
                  <motion.div
                    animate={{ x: settings.mutedInBackground ? 20 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="w-5 h-5 bg-white rounded-full shadow-lg absolute top-0"
                  />
                </motion.button>
              </div>
            </motion.div>
          )}
        </Card>

        {/* Sound Testing */}
        {settings.enabled && (
          <Card glass padding="lg">
            <div className="flex items-center space-x-3 mb-4">
              <Play size={20} className="text-blue-400" />
              <h3 className="font-semibold text-white">Test Sounds</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {testSounds.map((sound) => (
                <motion.button
                  key={sound.type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => testSound(sound.type)}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white text-sm">{sound.label}</p>
                      <p className="text-xs text-gray-400">{sound.description}</p>
                    </div>
                    <Play size={16} className="text-gray-400" />
                  </div>
                </motion.button>
              ))}
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => sounds.success()}
            disabled={!settings.enabled}
            className="flex-1 bg-green-500/20 hover:bg-green-500/30 disabled:bg-gray-600/20 disabled:text-gray-500 text-green-400 py-3 px-4 rounded-lg font-medium transition-colors"
          >
            Test Success Sound
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => sounds.error()}
            disabled={!settings.enabled}
            className="flex-1 bg-red-500/20 hover:bg-red-500/30 disabled:bg-gray-600/20 disabled:text-gray-500 text-red-400 py-3 px-4 rounded-lg font-medium transition-colors"
          >
            Test Error Sound
          </motion.button>
        </div>

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
    <Modal isOpen={isOpen} onClose={onClose} title="Sound Settings">
      {content}
    </Modal>
  );
};

// Quick Sound Toggle Component for headers
export const SoundToggle: React.FC = () => {
  const { settings, updateSettings } = useSounds();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => updateSettings({ enabled: !settings.enabled })}
      className={`
        p-2 rounded-lg transition-colors
        ${settings.enabled
          ? 'bg-pitch-green/20 text-pitch-green hover:bg-pitch-green/30'
          : 'bg-gray-600/20 text-gray-400 hover:bg-gray-600/30'
        }
      `}
      title={settings.enabled ? 'Disable sounds' : 'Enable sounds'}
    >
      {settings.enabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
    </motion.button>
  );
};