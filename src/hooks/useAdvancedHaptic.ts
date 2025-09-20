import { useCallback, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface HapticSettings {
  enabled: boolean;
  intensity: 'light' | 'medium' | 'heavy';
  feedbackOnNavigate: boolean;
  feedbackOnDrag: boolean;
  feedbackOnError: boolean;
  feedbackOnSuccess: boolean;
}

type HapticType =
  | 'tap' | 'click' | 'selection'
  | 'dragStart' | 'dragEnd' | 'drop'
  | 'success' | 'error' | 'warning'
  | 'navigation' | 'toggle'
  | 'timer' | 'notification'
  | 'gameStart' | 'gameEnd' | 'goal';

const DEFAULT_SETTINGS: HapticSettings = {
  enabled: true,
  intensity: 'medium',
  feedbackOnNavigate: true,
  feedbackOnDrag: true,
  feedbackOnError: true,
  feedbackOnSuccess: true
};

// Haptic patterns with three intensity levels
const HAPTIC_PATTERNS: Record<HapticType, Record<'light' | 'medium' | 'heavy', number[]>> = {
  // Basic interactions
  tap: {
    light: [5],
    medium: [10],
    heavy: [15]
  },
  click: {
    light: [8],
    medium: [12],
    heavy: [18]
  },
  selection: {
    light: [6],
    medium: [10],
    heavy: [15]
  },

  // Drag and drop
  dragStart: {
    light: [10, 5],
    medium: [15, 10],
    heavy: [20, 15]
  },
  dragEnd: {
    light: [5, 10],
    medium: [8, 15],
    heavy: [12, 20]
  },
  drop: {
    light: [15],
    medium: [25],
    heavy: [35]
  },

  // Status feedback
  success: {
    light: [10, 5, 10],
    medium: [15, 10, 15],
    heavy: [20, 15, 20]
  },
  error: {
    light: [30, 10, 30],
    medium: [50, 20, 50],
    heavy: [80, 30, 80]
  },
  warning: {
    light: [20, 10, 20],
    medium: [35, 15, 35],
    heavy: [50, 25, 50]
  },

  // Navigation
  navigation: {
    light: [8],
    medium: [12],
    heavy: [16]
  },
  toggle: {
    light: [10, 5, 5],
    medium: [15, 8, 8],
    heavy: [20, 12, 12]
  },

  // Game specific
  timer: {
    light: [25],
    medium: [40],
    heavy: [60]
  },
  notification: {
    light: [15, 10, 15],
    medium: [25, 15, 25],
    heavy: [35, 20, 35]
  },
  gameStart: {
    light: [20, 10, 20, 10, 20],
    medium: [30, 15, 30, 15, 30],
    heavy: [40, 20, 40, 20, 40]
  },
  gameEnd: {
    light: [40, 20, 40],
    medium: [60, 30, 60],
    heavy: [80, 40, 80]
  },
  goal: {
    light: [25, 15, 25, 15, 25],
    medium: [35, 20, 35, 20, 35],
    heavy: [50, 30, 50, 30, 50]
  }
};

export const useAdvancedHaptic = () => {
  const [settings, setSettings] = useLocalStorage<HapticSettings>('kickoff-haptic-settings', DEFAULT_SETTINGS);
  const lastHapticRef = useRef<number>(0);
  const hapticQueueRef = useRef<NodeJS.Timeout[]>([]);

  const isSupported = 'vibrate' in navigator;

  // Clear any pending haptic feedback
  const clearHapticQueue = useCallback(() => {
    hapticQueueRef.current.forEach(timeout => clearTimeout(timeout));
    hapticQueueRef.current = [];
    if (navigator.vibrate) {
      navigator.vibrate(0); // Stop any ongoing vibration
    }
  }, []);

  // Execute haptic feedback with throttling and settings check
  const executeHaptic = useCallback((type: HapticType, force: boolean = false) => {
    if (!isSupported || (!settings.enabled && !force)) return;

    // Apply specific setting filters
    if (!force) {
      if (type.includes('drag') && !settings.feedbackOnDrag) return;
      if (['navigation', 'toggle'].includes(type) && !settings.feedbackOnNavigate) return;
      if (['error', 'warning'].includes(type) && !settings.feedbackOnError) return;
      if (['success', 'goal', 'gameEnd'].includes(type) && !settings.feedbackOnSuccess) return;
    }

    // Throttle haptic feedback to prevent overwhelming
    const now = Date.now();
    const timeSinceLastHaptic = now - lastHapticRef.current;
    const minInterval = type === 'tap' || type === 'click' ? 50 : 100;

    if (timeSinceLastHaptic < minInterval && !force) return;

    lastHapticRef.current = now;

    // Get pattern for current intensity
    const pattern = HAPTIC_PATTERNS[type][settings.intensity];

    // Execute vibration
    if (navigator.vibrate && pattern) {
      navigator.vibrate(pattern);
    }
  }, [settings, isSupported]);

  // Queue multiple haptic effects
  const queueHaptic = useCallback((effects: Array<{ type: HapticType; delay: number }>) => {
    clearHapticQueue();

    effects.forEach(({ type, delay }) => {
      const timeout = setTimeout(() => {
        executeHaptic(type, true);
      }, delay);
      hapticQueueRef.current.push(timeout);
    });
  }, [executeHaptic, clearHapticQueue]);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<HapticSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, [setSettings]);

  // Preset combinations for common scenarios
  const presets = {
    // UI interactions
    buttonPress: () => executeHaptic('click'),
    menuNavigation: () => executeHaptic('navigation'),
    toggleSwitch: () => executeHaptic('toggle'),
    itemSelection: () => executeHaptic('selection'),

    // Drag and drop
    startDrag: () => executeHaptic('dragStart'),
    endDrag: () => executeHaptic('dragEnd'),
    successfulDrop: () => executeHaptic('drop'),

    // Game actions
    playerAdded: () => executeHaptic('success'),
    teamGenerated: () => queueHaptic([
      { type: 'success', delay: 0 },
      { type: 'success', delay: 200 },
      { type: 'success', delay: 400 }
    ]),
    matchStart: () => executeHaptic('gameStart'),
    matchEnd: () => executeHaptic('gameEnd'),
    goalScored: () => executeHaptic('goal'),
    timerWarning: () => executeHaptic('timer'),

    // Error handling
    validationError: () => executeHaptic('error'),
    networkError: () => queueHaptic([
      { type: 'error', delay: 0 },
      { type: 'error', delay: 300 }
    ]),
    actionBlocked: () => executeHaptic('warning'),

    // Special combinations
    appLaunch: () => queueHaptic([
      { type: 'success', delay: 0 },
      { type: 'tap', delay: 100 },
      { type: 'tap', delay: 200 }
    ]),
    celebration: () => queueHaptic([
      { type: 'goal', delay: 0 },
      { type: 'success', delay: 300 },
      { type: 'success', delay: 600 },
      { type: 'goal', delay: 900 }
    ])
  };

  // Test haptic
  const testHaptic = useCallback((type: HapticType) => {
    executeHaptic(type, true);
  }, [executeHaptic]);

  return {
    // Settings
    settings,
    updateSettings,
    isSupported,

    // Core functions
    executeHaptic,
    queueHaptic,
    clearHapticQueue,
    testHaptic,

    // Presets
    ...presets,

    // Legacy compatibility (for existing useHaptic calls)
    light: () => executeHaptic('tap'),
    medium: () => executeHaptic('click'),
    heavy: () => executeHaptic('drop'),
    success: () => executeHaptic('success'),
    warning: () => executeHaptic('warning'),
    error: () => executeHaptic('error'),
    vibrate: (pattern: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => {
      const typeMap = {
        light: 'tap' as const,
        medium: 'click' as const,
        heavy: 'drop' as const,
        success: 'success' as const,
        warning: 'warning' as const,
        error: 'error' as const
      };
      executeHaptic(typeMap[pattern]);
    }
  };
};