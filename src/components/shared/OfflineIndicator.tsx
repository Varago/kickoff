import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, Download } from 'lucide-react';
import { useOffline, useServiceWorker } from '../../hooks/useOffline';

export const OfflineIndicator: React.FC = () => {
  const { isOnline, isOffline, wasOffline } = useOffline();
  const { hasUpdate, updateServiceWorker } = useServiceWorker();

  return (
    <>
      {/* Offline Indicator */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white px-4 py-2 text-center text-sm font-medium"
            style={{ paddingTop: 'calc(0.5rem + env(safe-area-inset-top))' }}
          >
            <div className="flex items-center justify-center space-x-2">
              <WifiOff size={16} />
              <span>You're offline - Changes will sync when reconnected</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back Online Indicator */}
      <AnimatePresence>
        {isOnline && wasOffline && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            onAnimationComplete={() => {
              // Auto-hide after 3 seconds
              setTimeout(() => {
                // This would need state management to properly hide
              }, 3000);
            }}
            className="fixed top-0 left-0 right-0 z-50 bg-green-500 text-white px-4 py-2 text-center text-sm font-medium"
            style={{ paddingTop: 'calc(0.5rem + env(safe-area-inset-top))' }}
          >
            <div className="flex items-center justify-center space-x-2">
              <Wifi size={16} />
              <span>Back online - Syncing data...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* App Update Available */}
      <AnimatePresence>
        {hasUpdate && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 left-4 right-4 z-50 bg-blue-500 text-white rounded-lg p-4 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Download size={20} />
                <div>
                  <div className="font-medium">Update Available</div>
                  <div className="text-sm opacity-90">Tap to update to the latest version</div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={updateServiceWorker}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Update
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Install prompt component for PWA
export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [showInstall, setShowInstall] = React.useState(false);

  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setShowInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    // Clear the deferred prompt
    setDeferredPrompt(null);
    setShowInstall(false);
  };

  return (
    <AnimatePresence>
      {showInstall && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-surface-elevated border border-white/10 rounded-xl p-6 max-w-sm mx-4 shadow-2xl"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-pitch-green rounded-full flex items-center justify-center mx-auto mb-4">
              <Download size={24} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Install Kickoff</h3>
            <p className="text-gray-400 mb-6 text-sm">
              Install the app for a better experience with offline support and quick access.
            </p>
            <div className="flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowInstall(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Later
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleInstallClick}
                className="flex-1 bg-pitch-green hover:bg-green-500 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Install
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};