import { useCallback } from 'react';

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

const HAPTIC_PATTERNS: Record<HapticPattern, number[]> = {
  light: [10],
  medium: [20],
  heavy: [30],
  success: [10, 10, 10],
  warning: [50, 30, 50],
  error: [100, 50, 100, 50, 100]
};

export const useHaptic = () => {
  const vibrate = useCallback((pattern: HapticPattern) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(HAPTIC_PATTERNS[pattern]);
    }
  }, []);

  const isSupported = 'vibrate' in navigator;

  return {
    vibrate,
    isSupported,
    light: () => vibrate('light'),
    medium: () => vibrate('medium'),
    heavy: () => vibrate('heavy'),
    success: () => vibrate('success'),
    warning: () => vibrate('warning'),
    error: () => vibrate('error')
  };
};