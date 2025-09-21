import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RotateCcw, X, Check } from 'lucide-react';

interface ResetConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ResetConfirmationModal: React.FC<ResetConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  const [step, setStep] = useState(1);
  const [confirmText, setConfirmText] = useState('');

  const resetModal = () => {
    setStep(1);
    setConfirmText('');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleConfirm = () => {
    resetModal();
    onConfirm();
    onClose();
  };

  if (!isOpen) return null;

  const requiredText = 'RESET';
  const isTextValid = confirmText.trim().toUpperCase() === requiredText;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-surface-dark border border-red-500/50 rounded-lg p-6 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center justify-center">
                <AlertTriangle className="text-red-400" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-400">Reset App</h3>
                <p className="text-sm text-red-400/70">This action cannot be undone</p>
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
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <h4 className="font-medium text-red-400 mb-2">⚠️ Warning</h4>
                  <p className="text-sm text-red-400/80">
                    This will permanently delete:
                  </p>
                  <ul className="mt-2 text-sm text-red-400/80 space-y-1">
                    <li>• All player registrations</li>
                    <li>• Team formations and assignments</li>
                    <li>• Match schedules and scores</li>
                    <li>• Game standings</li>
                    <li>• Game session name and settings</li>
                  </ul>
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <h4 className="font-medium text-blue-400 mb-2">✅ What's Preserved</h4>
                  <p className="text-sm text-blue-400/80">
                    Your sound and haptic preferences will be kept.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    onClick={handleClose}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={() => setStep(2)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    Continue
                  </motion.button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <h4 className="font-medium text-yellow-400 mb-2">🚨 Final Confirmation</h4>
                  <p className="text-sm text-yellow-400/80 mb-3">
                    Type <strong>"{requiredText}"</strong> to confirm the reset:
                  </p>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="Type RESET here..."
                    className="w-full bg-surface-elevated border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-400 transition-colors"
                    autoFocus
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    onClick={() => setStep(1)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    Back
                  </motion.button>
                  <motion.button
                    onClick={handleConfirm}
                    disabled={!isTextValid}
                    whileHover={isTextValid ? { scale: 1.02 } : {}}
                    whileTap={isTextValid ? { scale: 0.98 } : {}}
                    className={`
                      flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2
                      ${isTextValid
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }
                    `}
                  >
                    <RotateCcw size={16} />
                    <span>Reset App</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};