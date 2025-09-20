import { useEffect, useRef, useState } from 'react';
import AudioGenerator from '../utils/audioGenerator';

interface GeneratedAudioState {
  isReady: boolean;
  isGenerating: boolean;
  error: string | null;
}

interface AudioBuffers {
  whistle: AudioBuffer | null;
  goal: AudioBuffer | null;
  click: AudioBuffer | null;
  timerEnd: AudioBuffer | null;
  success: AudioBuffer | null;
  error: AudioBuffer | null;
  notification: AudioBuffer | null;
}

export const useGeneratedAudio = () => {
  const [state, setState] = useState<GeneratedAudioState>({
    isReady: false,
    isGenerating: false,
    error: null
  });

  const buffers = useRef<AudioBuffers>({
    whistle: null,
    goal: null,
    click: null,
    timerEnd: null,
    success: null,
    error: null,
    notification: null
  });

  const generator = useRef<AudioGenerator | null>(null);
  const audioContext = useRef<AudioContext | null>(null);

  // Initialize audio context and generator
  useEffect(() => {
    const initAudio = async () => {
      try {
        setState(prev => ({ ...prev, isGenerating: true, error: null }));

        // Initialize audio context
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        generator.current = new AudioGenerator();

        // Generate all audio buffers
        const [whistle, goal, click, timerEnd, success, error, notification] = await Promise.all([
          generator.current.generateWhistle(),
          generator.current.generateGoal(),
          generator.current.generateClick(),
          generator.current.generateTimerEnd(),
          generator.current.generateSuccess(),
          generator.current.generateError(),
          generator.current.generateNotification()
        ]);

        buffers.current = {
          whistle,
          goal,
          click,
          timerEnd,
          success,
          error,
          notification
        };

        setState({
          isReady: true,
          isGenerating: false,
          error: null
        });

        console.log('Generated audio buffers ready');
      } catch (err) {
        console.error('Failed to generate audio:', err);
        setState({
          isReady: false,
          isGenerating: false,
          error: err instanceof Error ? err.message : 'Unknown audio error'
        });
      }
    };

    initAudio();

    return () => {
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, []);

  // Play generated audio
  const playGeneratedAudio = (type: keyof AudioBuffers, options: { volume?: number; playbackRate?: number } = {}) => {
    if (!state.isReady || !audioContext.current || !buffers.current[type]) {
      console.warn(`Generated audio not ready or buffer missing: ${type}`);
      return;
    }

    try {
      const source = audioContext.current.createBufferSource();
      const gainNode = audioContext.current.createGain();

      source.buffer = buffers.current[type];
      source.playbackRate.value = options.playbackRate || 1;
      gainNode.gain.value = options.volume || 0.7;

      source.connect(gainNode);
      gainNode.connect(audioContext.current.destination);

      source.start();
    } catch (err) {
      console.error('Failed to play generated audio:', err);
    }
  };

  // Export audio as downloadable files (for development/testing)
  const exportAudio = async (type: keyof AudioBuffers): Promise<string | null> => {
    if (!generator.current || !buffers.current[type]) return null;

    try {
      const blob = await generator.current.audioBufferToBlob(buffers.current[type]!);
      return URL.createObjectURL(blob);
    } catch (err) {
      console.error('Failed to export audio:', err);
      return null;
    }
  };

  // Export all audio files
  const exportAllAudio = async (): Promise<Record<keyof AudioBuffers, string | null>> => {
    const exports: Record<string, string | null> = {};

    for (const type of Object.keys(buffers.current) as Array<keyof AudioBuffers>) {
      exports[type] = await exportAudio(type);
    }

    return exports as Record<keyof AudioBuffers, string | null>;
  };

  return {
    ...state,
    playGeneratedAudio,
    exportAudio,
    exportAllAudio,

    // Convenient methods for specific sounds
    playWhistle: (options?: { volume?: number; playbackRate?: number }) =>
      playGeneratedAudio('whistle', options),
    playGoal: (options?: { volume?: number; playbackRate?: number }) =>
      playGeneratedAudio('goal', options),
    playClick: (options?: { volume?: number; playbackRate?: number }) =>
      playGeneratedAudio('click', options),
    playTimerEnd: (options?: { volume?: number; playbackRate?: number }) =>
      playGeneratedAudio('timerEnd', options),
    playSuccess: (options?: { volume?: number; playbackRate?: number }) =>
      playGeneratedAudio('success', options),
    playError: (options?: { volume?: number; playbackRate?: number }) =>
      playGeneratedAudio('error', options),
    playNotification: (options?: { volume?: number; playbackRate?: number }) =>
      playGeneratedAudio('notification', options)
  };
};