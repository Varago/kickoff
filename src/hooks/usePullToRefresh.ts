import { useRef, useCallback, useEffect } from 'react';
import { useAdvancedHaptic } from './useAdvancedHaptic';

interface PullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  resistance?: number;
  enabled?: boolean;
}

export const usePullToRefresh = ({
  onRefresh,
  threshold = 80,
  resistance = 2,
  enabled = true
}: PullToRefreshOptions) => {
  const { vibrate } = useAdvancedHaptic();
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);
  const isRefreshing = useRef<boolean>(false);
  const containerRef = useRef<HTMLElement | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled || isRefreshing.current) return;

    const container = containerRef.current;
    if (!container) return;

    // Only trigger if scrolled to top
    if (container.scrollTop > 0) return;

    startY.current = e.touches[0].clientY;
  }, [enabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled || isRefreshing.current) return;

    const container = containerRef.current;
    if (!container) return;

    // Only trigger if scrolled to top
    if (container.scrollTop > 0) return;

    currentY.current = e.touches[0].clientY;
    const pullDistance = Math.max(0, (currentY.current - startY.current) / resistance);

    if (pullDistance > 0) {
      e.preventDefault();

      // Update visual indicator
      const progress = Math.min(pullDistance / threshold, 1);
      container.style.transform = `translateY(${pullDistance}px)`;
      container.style.transition = 'none';

      // Trigger haptic feedback at threshold
      if (progress >= 1 && pullDistance <= threshold + 5) {
        vibrate('medium');
      }
    }
  }, [enabled, threshold, resistance, vibrate]);

  const handleTouchEnd = useCallback(async () => {
    if (!enabled || isRefreshing.current) return;

    const container = containerRef.current;
    if (!container) return;

    const pullDistance = Math.max(0, (currentY.current - startY.current) / resistance);

    // Reset transform with animation
    container.style.transition = 'transform 0.3s ease-out';
    container.style.transform = 'translateY(0px)';

    // Trigger refresh if threshold met
    if (pullDistance >= threshold) {
      isRefreshing.current = true;
      vibrate('heavy');

      try {
        await onRefresh();
      } catch (error) {
        console.error('Pull to refresh error:', error);
      } finally {
        isRefreshing.current = false;
      }
    }

    // Reset values
    startY.current = 0;
    currentY.current = 0;
  }, [enabled, threshold, resistance, onRefresh, vibrate]);

  const bindToElement = useCallback((element: HTMLElement | null) => {
    containerRef.current = element;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, enabled]);

  return {
    bindToElement,
    isRefreshing: isRefreshing.current
  };
};