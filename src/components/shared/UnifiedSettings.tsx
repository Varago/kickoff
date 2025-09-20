import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, Smartphone, RotateCcw } from 'lucide-react';
import { SoundSettings } from './SoundSettings';
import { HapticSettings } from './HapticSettings';
import { ResetConfirmationModal } from './ResetConfirmationModal';

interface UnifiedSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onReset?: () => void;
}

type SettingsTab = 'sound' | 'haptic' | 'app';

export const UnifiedSettings: React.FC<UnifiedSettingsProps> = ({
  isOpen,
  onClose,
  onReset
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('sound');
  const [showResetModal, setShowResetModal] = useState(false);

  if (!isOpen) return null;

  const tabs = [
    { id: 'sound' as const, label: 'Sound', icon: Volume2 },
    { id: 'haptic' as const, label: 'Haptic', icon: Smartphone },
    { id: 'app' as const, label: 'App', icon: RotateCcw },
  ];

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
          className="bg-surface-dark border border-gray-600 rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-600">
            <h2 className="text-lg font-semibold text-white">Settings</h2>
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-600/20 transition-all"
            >
              <X size={16} />
            </motion.button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-600">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium transition-all
                    ${isActive
                      ? 'text-pitch-green border-b-2 border-pitch-green bg-pitch-green/5'
                      : 'text-gray-400 hover:text-white hover:bg-gray-600/20'
                    }
                  `}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <AnimatePresence mode="wait">
              {activeTab === 'sound' && (
                <motion.div
                  key="sound"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <SoundSettings isOpen={true} onClose={() => {}} embedded />
                </motion.div>
              )}

              {activeTab === 'haptic' && (
                <motion.div
                  key="haptic"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <HapticSettings isOpen={true} onClose={() => {}} embedded />
                </motion.div>
              )}

              {activeTab === 'app' && (
                <motion.div
                  key="app"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">App Management</h3>

                    {/* Reset App Section */}
                    <div className="space-y-4">
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <div className="flex items-center space-x-3 mb-3">
                          <RotateCcw size={20} className="text-red-400" />
                          <div>
                            <h4 className="font-medium text-red-400">Reset App</h4>
                            <p className="text-sm text-red-400/70">Clear all data and start fresh</p>
                          </div>
                        </div>

                        <p className="text-sm text-gray-300 mb-4">
                          This will permanently delete all players, teams, matches, and scores.
                          Your sound and haptic preferences will be preserved.
                        </p>

                        {onReset && (
                          <motion.button
                            onClick={() => setShowResetModal(true)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                          >
                            Reset App Data
                          </motion.button>
                        )}
                      </div>

                      {/* Auto-reset info */}
                      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <div className="flex items-center space-x-3 mb-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          >
                            <RotateCcw size={16} className="text-blue-400" />
                          </motion.div>
                          <h4 className="font-medium text-blue-400">Daily Auto-Reset</h4>
                        </div>
                        <p className="text-sm text-blue-400/70">
                          The app automatically resets at midnight for fresh daily tournaments.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Reset Confirmation Modal */}
        <ResetConfirmationModal
          isOpen={showResetModal}
          onClose={() => setShowResetModal(false)}
          onConfirm={() => {
            if (onReset) {
              onReset();
            }
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
};