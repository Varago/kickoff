import { useState, useCallback } from 'react';
import { useAdvancedHaptic } from './useAdvancedHaptic';

export const useAnimationManager = (sounds?: any) => {
  const [confettiActive, setConfettiActive] = useState(false);
  const [confettiConfig, setConfettiConfig] = useState<any>(null);
  const haptic = useAdvancedHaptic();

  // Confetti controls
  const triggerConfetti = useCallback((config: any = {}) => {
    setConfettiConfig({
      duration: 3000,
      particleCount: 100,
      spread: 45,
      ...config
    });

    setConfettiActive(true);

    // Auto-hide confetti after duration
    setTimeout(() => {
      setConfettiActive(false);
    }, config.duration || 3000);
  }, []);

  // Simple animation triggers without complex dependencies
  const animations = {
    playerAdded: () => {
      if (sounds?.playerAdded) sounds.playerAdded();
      haptic.playerAdded();
    },

    teamGenerated: () => {
      triggerConfetti({
        duration: 2500,
        particleCount: 80,
        spread: 60,
        colors: ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B']
      });
      if (sounds?.teamsGenerated) sounds.teamsGenerated();
      haptic.teamGenerated();
    },

    goalScored: () => {
      triggerConfetti({
        duration: 3000,
        particleCount: 100,
        spread: 45,
        colors: ['#00DC82', '#10B981', '#34D399', '#6EE7B7']
      });
      if (sounds?.goal) sounds.goal();
      haptic.goalScored();
    },

    matchComplete: () => {
      triggerConfetti({
        duration: 3500,
        particleCount: 120,
        spread: 80,
        colors: ['#00DC82', '#F59E0B', '#EF4444', '#3B82F6']
      });
      if (sounds?.matchEnd) sounds.matchEnd();
      haptic.matchEnd();
    },

    tournamentWin: () => {
      triggerConfetti({
        duration: 5000,
        particleCount: 200,
        spread: 90,
        colors: ['#FFD700', '#FFA500', '#FF6347', '#00DC82', '#3B82F6']
      });
      if (sounds?.success) sounds.success();
      haptic.celebration();
    },

    timerWarning: () => {
      if (sounds?.notification) sounds.notification();
      haptic.timerWarning();
    },

    timerEnd: () => {
      if (sounds?.timerEnd) sounds.timerEnd();
      haptic.timerWarning();
    }
  };

  return {
    // Confetti state
    isConfettiActive: confettiActive,
    confettiConfig,
    triggerConfetti,

    // Animation triggers
    animations,

    // Individual animation methods
    playerAdded: animations.playerAdded,
    teamGenerated: animations.teamGenerated,
    goalScored: animations.goalScored,
    matchComplete: animations.matchComplete,
    tournamentWin: animations.tournamentWin,
    timerWarning: animations.timerWarning,
    timerEnd: animations.timerEnd
  };
};