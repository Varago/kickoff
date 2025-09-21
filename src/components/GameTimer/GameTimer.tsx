import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Zap } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { formatTime } from '../../utils/helpers';
import { Card } from '../shared/Card';
import { useHaptic } from '../../hooks/useHaptic';
import { useSounds } from '../../hooks/useSoundSystem';
import { LCDDisplay } from './LCDDisplay';
import { CircularProgress } from './CircularProgress';

const GameTimerComponent: React.FC = () => {
  // Get store state safely - avoid destructuring to prevent re-render issues
  const currentMatchId = useGameStore(state => state.currentMatchId);
  const matches = useGameStore(state => state.matches);
  const teams = useGameStore(state => state.teams);
  const settings = useGameStore(state => state.settings);

  // Find current match data
  const currentMatch = currentMatchId ? matches.find(m => m.id === currentMatchId) : null;
  const teamA = currentMatch ? teams.find(t => t.id === currentMatch.teamAId) : null;
  const teamB = currentMatch ? teams.find(t => t.id === currentMatch.teamBId) : null;

  // Local timer state - completely independent of store to avoid infinite loops
  const [timeRemaining, setTimeRemaining] = useState(() => settings.matchDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Warning tracking
  const [warnings, setWarnings] = useState<{ minute: boolean; thirty: boolean; ten: boolean }>({
    minute: false,
    thirty: false,
    ten: false
  });

  const haptic = useHaptic();
  const { sounds } = useSounds();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Timer controls
  const startTimer = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
    haptic.success();
    sounds.matchStart();
  }, [haptic, sounds]);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
    setIsPaused(true);
    haptic.light();
    sounds.buttonClick();
  }, [haptic, sounds]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeRemaining(settings.matchDuration * 60);
    setWarnings({ minute: false, thirty: false, ten: false });
    haptic.light();
    sounds.buttonClick();
  }, [settings.matchDuration, haptic, sounds]);

  // Timer interval effect
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 0) {
            setIsRunning(false);
            setIsPaused(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  // Reset timer when match duration changes
  useEffect(() => {
    if (!isRunning && !isPaused) {
      setTimeRemaining(settings.matchDuration * 60);
    }
  }, [settings.matchDuration, isRunning, isPaused]);

  // Audio warning functions
  const playWarningSound = useCallback((type: number) => {
    if (!soundEnabled) return;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      const frequencies = {
        1: [800, 600], // 1 minute - two tones
        2: [900, 700, 500], // 30 seconds - three tones
        3: [1000] // 10 seconds - single high tone
      };

      const freq = frequencies[type as keyof typeof frequencies] || [800];

      oscillator.frequency.setValueAtTime(freq[0], ctx.currentTime);
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);
    } catch (error) {
      console.warn('Audio not supported:', error);
    }
  }, [soundEnabled]);

  const playTimeUpSound = useCallback(() => {
    if (!soundEnabled) return;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const ctx = audioContextRef.current;

      [0, 0.2, 0.4, 0.6, 0.8].forEach((delay) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.setValueAtTime(1200, ctx.currentTime + delay);
        gainNode.gain.setValueAtTime(0.4, ctx.currentTime + delay);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.15);

        oscillator.start(ctx.currentTime + delay);
        oscillator.stop(ctx.currentTime + delay + 0.15);
      });
    } catch (error) {
      console.warn('Audio not supported:', error);
    }
  }, [soundEnabled]);

  // Warning sounds effect
  useEffect(() => {
    if (soundEnabled && isRunning) {
      // 1 minute warning
      if (timeRemaining === 60 && !warnings.minute) {
        playWarningSound(1);
        setWarnings(prev => ({ ...prev, minute: true }));
      }
      // 30 second warning
      else if (timeRemaining === 30 && !warnings.thirty) {
        playWarningSound(2);
        setWarnings(prev => ({ ...prev, thirty: true }));
      }
      // 10 second countdown
      else if (timeRemaining <= 10 && timeRemaining > 0 && !warnings.ten) {
        playWarningSound(3);
        setWarnings(prev => ({ ...prev, ten: true }));
      }
      // Time up
      else if (timeRemaining === 0) {
        playTimeUpSound();
        haptic.warning();
      }
    }
  }, [timeRemaining, isRunning, soundEnabled, warnings, haptic, playWarningSound, playTimeUpSound]);

  // Reset warnings when timer resets to full time
  useEffect(() => {
    if (timeRemaining === settings.matchDuration * 60) {
      setWarnings({ minute: false, thirty: false, ten: false });
    }
  }, [timeRemaining, settings.matchDuration]);

  // Calculated values
  const timeDisplay = formatTime(timeRemaining);
  const totalTime = settings.matchDuration * 60;
  const progressPercentage = ((totalTime - timeRemaining) / totalTime) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Match Timer</h1>
        <p className="text-gray-400">Keep track of match time with precision</p>
      </motion.div>

      {/* Current Match Info */}
      {currentMatch && teamA && teamB && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card glass padding="lg" className="text-center">
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-white">Current Match</h2>
              <div className="flex items-center justify-center space-x-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold">{teamA.name.charAt(0)}</span>
                  </div>
                  <p className="text-white font-medium">{teamA.name}</p>
                  <p className="text-2xl font-bold text-blue-400">{currentMatch.scoreA}</p>
                </div>

                <div className="text-3xl font-bold text-gray-400">VS</div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold">{teamB.name.charAt(0)}</span>
                  </div>
                  <p className="text-white font-medium">{teamB.name}</p>
                  <p className="text-2xl font-bold text-red-400">{currentMatch.scoreB}</p>
                </div>
              </div>
              <p className="text-sm text-gray-400">Game {currentMatch.gameNumber}</p>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Main Timer Display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card glass padding="xl" className="text-center">
          <div className="space-y-8">
            {/* LCD Timer Display with Circular Progress */}
            <div className="relative flex items-center justify-center">
              {/* Background circular progress */}
              <div className="absolute">
                <CircularProgress
                  percentage={progressPercentage}
                  size={380}
                  strokeWidth={8}
                  color={timeRemaining <= 10 ? '#f87171' :
                         timeRemaining <= 30 ? '#fb923c' :
                         timeRemaining <= 60 ? '#fbbf24' : '#00DC82'}
                  backgroundColor="#374151"
                  pulseOnLow={true}
                  timeRemaining={timeRemaining}
                />
              </div>

              {/* LCD Display in center */}
              <LCDDisplay
                time={timeDisplay}
                status={isRunning ? 'running' : isPaused ? 'paused' : 'stopped'}
                timeRemaining={timeRemaining}
                size="lg"
              />
            </div>

            {/* Timer Status and Warnings */}
            <div className="flex items-center justify-center flex-wrap gap-4">
              <motion.div
                className={`flex items-center space-x-2 px-4 py-2 rounded-full backdrop-blur-sm ${
                  isRunning ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                  isPaused ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                  'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                }`}
                animate={{
                  scale: isRunning ? [1, 1.05, 1] : 1
                }}
                transition={{
                  duration: 2,
                  repeat: isRunning ? Infinity : 0,
                  ease: 'easeInOut'
                }}
              >
                <motion.div
                  className={`w-3 h-3 rounded-full ${
                    isRunning ? 'bg-green-400' :
                    isPaused ? 'bg-yellow-400' :
                    'bg-gray-400'
                  }`}
                  animate={{
                    opacity: isRunning ? [1, 0.3, 1] : 1,
                    boxShadow: isRunning ? [
                      '0 0 10px currentColor',
                      '0 0 20px currentColor',
                      '0 0 10px currentColor'
                    ] : '0 0 5px currentColor'
                  }}
                  transition={{
                    duration: 1,
                    repeat: isRunning ? Infinity : 0,
                    ease: 'easeInOut'
                  }}
                />
                <span className="text-sm font-medium">
                  {isRunning ? 'RUNNING' :
                   isPaused ? 'PAUSED' :
                   'STOPPED'}
                </span>
              </motion.div>

              <AnimatePresence>
                {timeRemaining <= 60 && isRunning && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      boxShadow: [
                        '0 0 15px rgba(248, 113, 113, 0.5)',
                        '0 0 25px rgba(248, 113, 113, 0.8)',
                        '0 0 15px rgba(248, 113, 113, 0.5)'
                      ]
                    }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{
                      boxShadow: {
                        duration: 0.8,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }
                    }}
                    className="bg-red-500/20 text-red-400 px-4 py-2 rounded-full border border-red-500/30 backdrop-blur-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <Zap size={16} className="animate-pulse" />
                      <span className="text-sm font-bold">FINAL MINUTE</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {timeRemaining <= 10 && isRunning && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: [1, 0.5, 1],
                      scale: [1, 1.1, 1],
                      rotate: [0, 2, -2, 0]
                    }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                    className="bg-red-600/30 text-red-300 px-4 py-2 rounded-full border-2 border-red-400/50 backdrop-blur-sm"
                  >
                    <span className="text-sm font-black uppercase tracking-wider">
                      CRITICAL!
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Progress Statistics */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Elapsed</p>
                <p className="text-lg font-mono font-bold text-white">
                  {formatTime(totalTime - timeRemaining)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Progress</p>
                <p className="text-lg font-mono font-bold text-pitch-green">
                  {Math.round(progressPercentage)}%
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Remaining</p>
                <p className="text-lg font-mono font-bold text-white">
                  {timeDisplay}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Timer Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card glass padding="lg">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            {/* Primary Controls */}
            <div className="flex space-x-3">
              {!isRunning ? (
                <motion.button
                  onClick={startTimer}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mobile-touch-target flex items-center space-x-2 px-6 py-3 bg-pitch-green text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  <Play size={20} />
                  <span>Start</span>
                </motion.button>
              ) : (
                <motion.button
                  onClick={pauseTimer}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mobile-touch-target flex items-center space-x-2 px-6 py-3 bg-yellow-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  <Pause size={20} />
                  <span>Pause</span>
                </motion.button>
              )}

              <motion.button
                onClick={resetTimer}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mobile-touch-target flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-500 transition-all"
              >
                <RotateCcw size={20} />
                <span>Reset</span>
              </motion.button>
            </div>

            {/* Secondary Controls */}
            <div className="flex items-center space-x-3 border-l border-gray-600 pl-4">
              <motion.button
                onClick={() => setSoundEnabled(!soundEnabled)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`mobile-touch-target p-3 rounded-lg transition-all ${
                  soundEnabled
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-600 text-gray-400 hover:text-white'
                }`}
                title={soundEnabled ? 'Disable sound' : 'Enable sound'}
              >
                {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </motion.button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* No Match State */}
      {!currentMatch && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center py-8"
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-surface-elevated rounded-full flex items-center justify-center">
            <Play size={32} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No active match</h3>
          <p className="text-gray-400">Start a match to use the timer</p>
        </motion.div>
      )}
    </div>
  );
};

// Export with memo to prevent unnecessary re-renders
export const GameTimer = React.memo(GameTimerComponent);