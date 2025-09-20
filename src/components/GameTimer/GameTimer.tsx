import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Settings, Zap } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { formatTime } from '../../utils/helpers';
import { Card } from '../shared/Card';
import { useHaptic } from '../../hooks/useHaptic';
import { useSounds } from '../../hooks/useSoundSystem';
import { LCDDisplay } from './LCDDisplay';
import { CircularProgress } from './CircularProgress';

const GameTimerComponent: React.FC = () => {
  // Optimized selectors to prevent unnecessary re-renders
  const timerState = useGameStore(state => state.timerState);
  const settings = useGameStore(state => state.settings);
  const startTimer = useGameStore(state => state.startTimer);
  const pauseTimer = useGameStore(state => state.pauseTimer);
  const resetTimer = useGameStore(state => state.resetTimer);
  const updateTimer = useGameStore(state => state.updateTimer);

  // Only fetch match/team data when needed
  const { currentMatch, teamA, teamB } = useGameStore(state => {
    const currentMatch = state.currentMatchId ? state.matches.find(m => m.id === state.currentMatchId) : null;
    const teamA = currentMatch ? state.teams.find(t => t.id === currentMatch.teamAId) : null;
    const teamB = currentMatch ? state.teams.find(t => t.id === currentMatch.teamBId) : null;
    return { currentMatch, teamA, teamB };
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [warnings, setWarnings] = useState<{ minute: boolean; thirty: boolean; ten: boolean }>({
    minute: false,
    thirty: false,
    ten: false
  });

  const haptic = useHaptic();
  const { sounds } = useSounds();
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);


  // Create a stable reference to the store to avoid dependency issues
  const updateTimerRef = useRef(updateTimer);
  updateTimerRef.current = updateTimer;

  // Optimized timer logic with stable reference
  useEffect(() => {
    if (timerState.isRunning) {
      timerIntervalRef.current = setInterval(() => {
        updateTimerRef.current();
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [timerState.isRunning]);

  // Sound functions (defined before useEffect to avoid hoisting issues)
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

      // Different tones for different warnings
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

      // Play a sequence of beeps
      [0, 0.2, 0.4, 0.6, 0.8].forEach((delay, index) => {
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

  // Warning sounds
  useEffect(() => {
    const timeRemaining = timerState.timeRemaining;

    if (soundEnabled && timerState.isRunning) {
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
  }, [timerState.timeRemaining, timerState.isRunning, soundEnabled, warnings, haptic, playWarningSound, playTimeUpSound]);

  // Reset warnings when timer resets
  useEffect(() => {
    if (timerState.timeRemaining === settings.matchDuration * 60) {
      setWarnings({ minute: false, thirty: false, ten: false });
    }
  }, [timerState.timeRemaining, settings.matchDuration]);

  // Memoized handlers to prevent unnecessary re-renders
  const handleStart = useCallback(() => {
    startTimer();
    haptic.success();
    sounds.matchStart();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTimer, haptic]); // sounds omitted to prevent re-render loop

  const handlePause = useCallback(() => {
    pauseTimer();
    haptic.light();
    sounds.buttonClick();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pauseTimer, haptic]); // sounds omitted to prevent re-render loop

  const handleReset = useCallback(() => {
    resetTimer();
    setWarnings({ minute: false, thirty: false, ten: false });
    haptic.light();
    sounds.buttonClick();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetTimer, haptic]); // sounds omitted to prevent re-render loop


  // Memoized calculations to prevent re-computation on every render
  const timeDisplay = useMemo(() => formatTime(timerState.timeRemaining), [timerState.timeRemaining]);

  const progressPercentage = useMemo(() => {
    const totalTime = settings.matchDuration * 60;
    return ((totalTime - timerState.timeRemaining) / totalTime) * 100;
  }, [settings.matchDuration, timerState.timeRemaining]);

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
                  color={timerState.timeRemaining <= 10 ? '#f87171' :
                         timerState.timeRemaining <= 30 ? '#fb923c' :
                         timerState.timeRemaining <= 60 ? '#fbbf24' : '#00DC82'}
                  backgroundColor="#374151"
                  pulseOnLow={true}
                  timeRemaining={timerState.timeRemaining}
                />
              </div>

              {/* LCD Display in center */}
              <LCDDisplay
                time={timeDisplay}
                status={timerState.isRunning ? 'running' :
                        timerState.isPaused ? 'paused' : 'stopped'}
                timeRemaining={timerState.timeRemaining}
                size="lg"
              />
            </div>

            {/* Timer Status and Warnings */}
            <div className="flex items-center justify-center flex-wrap gap-4">
              <motion.div
                className={`flex items-center space-x-2 px-4 py-2 rounded-full backdrop-blur-sm ${
                  timerState.isRunning ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                  timerState.isPaused ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                  'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                }`}
                animate={{
                  scale: timerState.isRunning ? [1, 1.05, 1] : 1
                }}
                transition={{
                  duration: 2,
                  repeat: timerState.isRunning ? Infinity : 0,
                  ease: 'easeInOut'
                }}
              >
                <motion.div
                  className={`w-3 h-3 rounded-full ${
                    timerState.isRunning ? 'bg-green-400' :
                    timerState.isPaused ? 'bg-yellow-400' :
                    'bg-gray-400'
                  }`}
                  animate={{
                    opacity: timerState.isRunning ? [1, 0.3, 1] : 1,
                    boxShadow: timerState.isRunning ? [
                      '0 0 10px currentColor',
                      '0 0 20px currentColor',
                      '0 0 10px currentColor'
                    ] : '0 0 5px currentColor'
                  }}
                  transition={{
                    duration: 1,
                    repeat: timerState.isRunning ? Infinity : 0,
                    ease: 'easeInOut'
                  }}
                />
                <span className="text-sm font-medium">
                  {timerState.isRunning ? 'RUNNING' :
                   timerState.isPaused ? 'PAUSED' :
                   'STOPPED'}
                </span>
              </motion.div>

              <AnimatePresence>
                {timerState.timeRemaining <= 60 && timerState.isRunning && (
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
                {timerState.timeRemaining <= 10 && timerState.isRunning && (
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
                  {formatTime((settings.matchDuration * 60) - timerState.timeRemaining)}
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
              {!timerState.isRunning ? (
                <motion.button
                  onClick={handleStart}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 px-6 py-3 bg-pitch-green text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  <Play size={20} />
                  <span>Start</span>
                </motion.button>
              ) : (
                <motion.button
                  onClick={handlePause}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 px-6 py-3 bg-yellow-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  <Pause size={20} />
                  <span>Pause</span>
                </motion.button>
              )}

              <motion.button
                onClick={handleReset}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-500 transition-all"
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
                className={`p-3 rounded-lg transition-all ${
                  soundEnabled
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-600 text-gray-400 hover:text-white'
                }`}
                title={soundEnabled ? 'Disable sound' : 'Enable sound'}
              >
                {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </motion.button>

              <motion.button
                onClick={() => setShowSettings(!showSettings)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-3 rounded-lg transition-all ${
                  showSettings
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-600 text-gray-400 hover:text-white'
                }`}
                title="Timer settings"
              >
                <Settings size={20} />
              </motion.button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Settings Panel - Optimized with CSS transitions */}
      {showSettings && (
        <div className="transition-all duration-300 ease-in-out">
            <Card glass padding="lg">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Timer Settings</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Match Duration: {settings.matchDuration} minutes
                    </label>
                    <input
                      type="range"
                      min={5}
                      max={90}
                      step={5}
                      value={settings.matchDuration}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
                        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-pitch-green
                        [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-300">Warning Sounds</p>
                    <div className="space-y-1 text-xs text-gray-400">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                        <span>1 minute remaining</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-orange-400 rounded-full" />
                        <span>30 seconds remaining</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-400 rounded-full" />
                        <span>10 second countdown</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
        </div>
      )}

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

// Memoized export to prevent unnecessary re-renders
export const GameTimer = React.memo(GameTimerComponent);