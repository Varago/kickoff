import { useEffect, useState, useCallback } from 'react';

interface KeyboardState {
  isVisible: boolean;
  height: number;
  viewportHeight: number;
}

export const useKeyboardHandler = () => {
  const [keyboardState, setKeyboardState] = useState<KeyboardState>({
    isVisible: false,
    height: 0,
    viewportHeight: window.innerHeight
  });

  const [activeElement, setActiveElement] = useState<HTMLElement | null>(null);

  // Detect keyboard visibility using Visual Viewport API (modern browsers)
  const handleViewportChange = useCallback(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;

    const viewport = window.visualViewport;
    const windowHeight = window.innerHeight;
    const viewportHeight = viewport.height;
    const keyboardHeight = windowHeight - viewportHeight;
    const isKeyboardVisible = keyboardHeight > 100; // Threshold for keyboard detection

    setKeyboardState({
      isVisible: isKeyboardVisible,
      height: keyboardHeight,
      viewportHeight: viewportHeight
    });

    // Add/remove body class for CSS targeting
    document.body.classList.toggle('keyboard-visible', isKeyboardVisible);

    // Scroll active element into view when keyboard appears
    if (isKeyboardVisible && activeElement) {
      setTimeout(() => {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }, 300);
    }
  }, [activeElement]);

  // Fallback for older browsers using resize event
  const handleResize = useCallback(() => {
    if (window.visualViewport) return; // Use Visual Viewport API if available

    const currentHeight = window.innerHeight;
    const standardHeight = window.screen.availHeight;
    const heightDiff = standardHeight - currentHeight;
    const isKeyboardVisible = heightDiff > 150; // Threshold for keyboard detection

    setKeyboardState(prev => ({
      ...prev,
      isVisible: isKeyboardVisible,
      height: heightDiff,
      viewportHeight: currentHeight
    }));

    document.body.classList.toggle('keyboard-visible', isKeyboardVisible);
  }, []);

  // Track focus/blur on input elements
  const handleFocusIn = useCallback((event: FocusEvent) => {
    const target = event.target as HTMLElement;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
      setActiveElement(target);

      // Add mobile input class for CSS targeting
      target.classList.add('mobile-input-active');

      // Ensure element is visible after a short delay (for keyboard animation)
      setTimeout(() => {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }, 300);
    }
  }, []);

  const handleFocusOut = useCallback((event: FocusEvent) => {
    const target = event.target as HTMLElement;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
      target.classList.remove('mobile-input-active');
      setActiveElement(null);
    }
  }, []);

  // Setup event listeners
  useEffect(() => {
    // Modern browsers with Visual Viewport API
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
    } else {
      // Fallback for older browsers
      window.addEventListener('resize', handleResize);
    }

    // Input focus tracking
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
      } else {
        window.removeEventListener('resize', handleResize);
      }

      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);

      // Cleanup body class
      document.body.classList.remove('keyboard-visible');
    };
  }, [handleViewportChange, handleResize, handleFocusIn, handleFocusOut]);

  // Utility function to scroll element into view safely
  const scrollIntoView = useCallback((element: HTMLElement, options?: ScrollIntoViewOptions) => {
    if (!element) return;

    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
      ...options
    });
  }, []);

  // Get safe area height (accounting for keyboard)
  const getSafeAreaHeight = useCallback(() => {
    if (keyboardState.isVisible) {
      return keyboardState.viewportHeight - 60; // Account for header/padding
    }
    return window.innerHeight - 60;
  }, [keyboardState]);

  return {
    keyboard: keyboardState,
    activeElement,
    scrollIntoView,
    getSafeAreaHeight,
    // Helper utilities
    isKeyboardVisible: keyboardState.isVisible,
    keyboardHeight: keyboardState.height,
    availableHeight: keyboardState.viewportHeight
  };
};

export default useKeyboardHandler;