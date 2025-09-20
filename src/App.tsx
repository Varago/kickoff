import React, { useEffect, useState } from 'react';
import { Navigation } from './components/Navigation';
import { OfflineIndicator, InstallPrompt } from './components/shared/OfflineIndicator';
import { Confetti } from './components/shared/Confetti';
import { QualityAssurance } from './components/shared/QualityAssurance';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { SoundProvider, useSounds } from './hooks/useSoundSystem';
import { useServiceWorker } from './hooks/useOffline';
import { useAnimationManager } from './hooks/useAnimationManager';
import { useGameStore } from './store/gameStore';

// Internal app component that has access to sounds
function AppContent() {
  useServiceWorker();
  const { sounds } = useSounds();
  const { isConfettiActive, confettiConfig } = useAnimationManager(sounds);
  const { checkDailyAutoReset } = useGameStore();
  const [isQAOpen, setIsQAOpen] = useState(false);

  useEffect(() => {
    // Check for daily auto-reset on app initialization
    const wasReset = checkDailyAutoReset();
    if (wasReset) {
      console.log('Daily auto-reset completed');
    }

    // Register service worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, [checkDailyAutoReset]);

  // Global keyboard shortcut for QA testing (Ctrl/Cmd + Shift + T)
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        setIsQAOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  return (
    <>
      <Navigation />
      <OfflineIndicator />
      <InstallPrompt />
      <Confetti
        active={isConfettiActive}
        {...confettiConfig}
      />
      <QualityAssurance
        isOpen={isQAOpen}
        onClose={() => setIsQAOpen(false)}
      />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <SoundProvider>
        <AppContent />
      </SoundProvider>
    </ErrorBoundary>
  );
}

export default App;
