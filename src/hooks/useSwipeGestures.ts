import { useRef, useCallback, useEffect } from 'react';
import { useAdvancedHaptic } from './useAdvancedHaptic';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  preventDefaultTouches?: boolean;
  enabled?: boolean;
}

export const useSwipeGestures = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  preventDefaultTouches = false,
  enabled = true
}: SwipeGestureOptions) => {
  const { vibrate } = useAdvancedHaptic();
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const elementRef = useRef<HTMLElement | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled) return;

    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, [enabled]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!enabled) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;

    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Determine if it's a horizontal or vertical swipe
    if (absDeltaX > absDeltaY && absDeltaX > threshold) {
      // Horizontal swipe
      if (deltaX > 0 && onSwipeRight) {
        vibrate('light');
        onSwipeRight();
        if (preventDefaultTouches) {
          e.preventDefault();
        }
      } else if (deltaX < 0 && onSwipeLeft) {
        vibrate('light');
        onSwipeLeft();
        if (preventDefaultTouches) {
          e.preventDefault();
        }
      }
    } else if (absDeltaY > absDeltaX && absDeltaY > threshold) {
      // Vertical swipe
      if (deltaY > 0 && onSwipeDown) {
        vibrate('light');
        onSwipeDown();
        if (preventDefaultTouches) {
          e.preventDefault();
        }
      } else if (deltaY < 0 && onSwipeUp) {
        vibrate('light');
        onSwipeUp();
        if (preventDefaultTouches) {
          e.preventDefault();
        }
      }
    }
  }, [
    enabled,
    threshold,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    preventDefaultTouches,
    vibrate
  ]);

  const bindToElement = useCallback((element: HTMLElement | null) => {
    elementRef.current = element;
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: !preventDefaultTouches });
    element.addEventListener('touchend', handleTouchEnd, { passive: !preventDefaultTouches });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd, enabled, preventDefaultTouches]);

  return {
    bindToElement
  };
};