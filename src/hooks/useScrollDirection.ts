import { useState, useEffect, useRef } from 'react';

export type ScrollDirection = 'up' | 'down' | 'idle';

interface UseScrollDirectionOptions {
  threshold?: number;
  debounceMs?: number;
  idleTimeoutMs?: number;
}

interface ScrollState {
  direction: ScrollDirection;
  isScrolling: boolean;
  isAtTop: boolean;
  isAtBottom: boolean;
  scrollY: number;
}

export const useScrollDirection = (options: UseScrollDirectionOptions = {}): ScrollState => {
  const {
    threshold = 10,
    debounceMs = 50,
    idleTimeoutMs = 150
  } = options;

  const [scrollState, setScrollState] = useState<ScrollState>({
    direction: 'idle',
    isScrolling: false,
    isAtTop: true,
    isAtBottom: false,
    scrollY: 0
  });

  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const idleTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const updateScrollDirection = () => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      const isAtTop = scrollY <= 5;
      const isAtBottom = scrollY + clientHeight >= scrollHeight - 5;
      const scrollDiff = scrollY - lastScrollY.current;

      let direction: ScrollDirection = scrollState.direction;

      if (Math.abs(scrollDiff) > threshold) {
        direction = scrollDiff > 0 ? 'down' : 'up';
      }

      setScrollState(prev => ({
        ...prev,
        direction,
        isScrolling: true,
        isAtTop,
        isAtBottom,
        scrollY
      }));

      lastScrollY.current = scrollY;

      // Clear existing idle timer
      if (idleTimer.current) {
        clearTimeout(idleTimer.current);
      }

      // Set idle state after user stops scrolling
      idleTimer.current = setTimeout(() => {
        setScrollState(prev => ({
          ...prev,
          direction: 'idle',
          isScrolling: false
        }));
      }, idleTimeoutMs);

      ticking.current = false;
    };

    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(updateScrollDirection);
        ticking.current = true;
      }
    };

    // Throttled scroll handler
    let timeoutId: NodeJS.Timeout;
    const throttledScroll = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, debounceMs);
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });

    // Initialize scroll position
    updateScrollDirection();

    return () => {
      window.removeEventListener('scroll', throttledScroll);
      if (idleTimer.current) {
        clearTimeout(idleTimer.current);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [threshold, debounceMs, idleTimeoutMs]);

  return scrollState;
};