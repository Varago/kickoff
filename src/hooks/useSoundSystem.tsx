import { useRef, useCallback, useEffect, createContext, useContext, ReactNode } from 'react';
import React from 'react';
import { Howl } from 'howler';
import { useLocalStorage } from './useLocalStorage';

interface SoundSettings {
  enabled: boolean;
  volume: number;
  mutedInBackground: boolean;
}

interface SoundDefinition {
  src: string;
  volume?: number;
  loop?: boolean;
  preload?: boolean;
}

type SoundType = 'whistle' | 'goal' | 'click' | 'timer-end' | 'success' | 'error' | 'notification';

const SOUND_DEFINITIONS: Record<SoundType, SoundDefinition> = {
  whistle: {
    src: '/sounds/whistle.mp3',
    volume: 0.8,
    preload: true
  },
  goal: {
    src: '/sounds/goal.mp3',
    volume: 0.9,
    preload: true
  },
  click: {
    src: '/sounds/click.mp3',
    volume: 0.6,
    preload: true
  },
  'timer-end': {
    src: '/sounds/timer-end.mp3',
    volume: 0.9,
    preload: true
  },
  success: {
    src: '/sounds/success.mp3',
    volume: 0.7,
    preload: false
  },
  error: {
    src: '/sounds/error.mp3',
    volume: 0.7,
    preload: false
  },
  notification: {
    src: '/sounds/notification.mp3',
    volume: 0.6,
    preload: false
  }
};

export const useSoundSystem = () => {
  const [settings, setSettings] = useLocalStorage<SoundSettings>('kickoff-sound-settings', {
    enabled: true,
    volume: 0.7,
    mutedInBackground: true
  });

  const soundsRef = useRef<Map<SoundType, Howl>>(new Map());
  const isVisibleRef = useRef<boolean>(true);

  // Track page visibility for background muting
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;

      // Mute/unmute sounds based on visibility
      if (settings.mutedInBackground) {
        const volume = document.hidden ? 0 : settings.volume;
        soundsRef.current.forEach((sound) => {
          sound.volume(volume);
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [settings.mutedInBackground, settings.volume]);

  // Initialize sounds
  const initializeSound = useCallback((type: SoundType): Howl => {
    const definition = SOUND_DEFINITIONS[type];
    const sound = new Howl({
      src: [definition.src],
      volume: settings.enabled ? (definition.volume || 0.7) * settings.volume : 0,
      loop: definition.loop || false,
      preload: definition.preload || false,
      html5: true, // Use HTML5 Audio for better mobile support
      onloaderror: (id, error) => {
        console.warn(`Failed to load sound: ${type}`, error);
      }
    });

    soundsRef.current.set(type, sound);
    return sound;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally omit settings to prevent infinite loop

  // Get or create sound
  const getSound = useCallback((type: SoundType): Howl => {
    let sound = soundsRef.current.get(type);
    if (!sound) {
      sound = initializeSound(type);
    }

    // Update volume based on current settings
    const definition = SOUND_DEFINITIONS[type];
    const currentVolume = settings.enabled ? (definition.volume || 0.7) * settings.volume : 0;
    sound.volume(currentVolume);

    return sound;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.enabled, settings.volume]); // initializeSound omitted to prevent loop

  // Play sound with options
  const playSound = useCallback((
    type: SoundType,
    options: { volume?: number; interrupt?: boolean } = {}
  ) => {
    if (!settings.enabled) return;

    // Don't play if page is hidden and background muting is enabled
    if (!isVisibleRef.current && settings.mutedInBackground) return;

    const sound = getSound(type);

    // Stop current playback if interrupt is true
    if (options.interrupt) {
      sound.stop();
    }

    // Set custom volume if provided
    if (options.volume !== undefined) {
      sound.volume(options.volume * settings.volume);
    }

    // Play the sound
    sound.play();
  }, [settings.enabled, settings.mutedInBackground, settings.volume, getSound]);

  // Preload critical sounds - only run once
  useEffect(() => {
    Object.entries(SOUND_DEFINITIONS).forEach(([type, definition]) => {
      if (definition.preload) {
        initializeSound(type as SoundType);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount, initializeSound omitted intentionally

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<SoundSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    // Update volume for all loaded sounds
    soundsRef.current.forEach((sound) => {
      sound.volume(updatedSettings.enabled ? updatedSettings.volume : 0);
    });
  }, [settings, setSettings]);

  // Test sound
  const testSound = useCallback((type: SoundType) => {
    playSound(type, { interrupt: true });
  }, [playSound]);

  // Sound shortcuts for common actions
  const sounds = {
    matchStart: () => playSound('whistle'),
    matchEnd: () => playSound('whistle'),
    goal: () => playSound('goal'),
    buttonClick: () => playSound('click', { volume: 0.5 }),
    timerEnd: () => playSound('timer-end'),
    success: () => playSound('success'),
    error: () => playSound('error'),
    notification: () => playSound('notification'),

    // Game-specific sounds
    playerAdded: () => playSound('click'),
    teamsGenerated: () => playSound('success'),
    scheduleCreated: () => playSound('success'),
    scoreUpdated: () => playSound('click', { volume: 0.8 })
  };

  return {
    settings,
    updateSettings,
    playSound,
    testSound,
    sounds,

    // Utility functions
    mute: () => updateSettings({ enabled: false }),
    unmute: () => updateSettings({ enabled: true }),
    setVolume: (volume: number) => updateSettings({ volume: Math.max(0, Math.min(1, volume)) })
  };
};

// Context for global sound management

interface SoundContextType {
  soundSystem: ReturnType<typeof useSoundSystem>;
}

const SoundContext = createContext<SoundContextType | null>(null);

export const SoundProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const soundSystem = useSoundSystem();

  return (
    <SoundContext.Provider value={{ soundSystem }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSounds = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSounds must be used within a SoundProvider');
  }
  return context.soundSystem;
};