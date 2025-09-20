import { useRef, useCallback } from 'react';
import { Howl } from 'howler';

interface SoundOptions {
  volume?: number;
  loop?: boolean;
  onend?: () => void;
}

export const useSound = (src: string, options: SoundOptions = {}) => {
  const soundRef = useRef<Howl | null>(null);

  const play = useCallback(() => {
    if (!soundRef.current) {
      soundRef.current = new Howl({
        src: [src],
        volume: options.volume || 0.7,
        loop: options.loop || false,
        onend: options.onend,
      });
    }

    soundRef.current.play();
  }, [src, options.volume, options.loop, options.onend]);

  const stop = useCallback(() => {
    if (soundRef.current) {
      soundRef.current.stop();
    }
  }, []);

  const pause = useCallback(() => {
    if (soundRef.current) {
      soundRef.current.pause();
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (soundRef.current) {
      soundRef.current.volume(volume);
    }
  }, []);

  return { play, stop, pause, setVolume };
};