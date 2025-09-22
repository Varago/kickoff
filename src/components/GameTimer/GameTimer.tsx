import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Clock, Plus, Minus } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { Card } from '../shared/Card';

export const GameTimer: React.FC = () => {
  const { settings } = useGameStore();

  // Timer settings - completely independent
  const [duration, setDuration] = useState(settings.matchDuration * 60);
  const [seconds, setSeconds] = useState(settings.matchDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Use refs to avoid stale closures
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Timer logic - completely isolated
  const tick = useCallback(() => {
    setSeconds(prev => {
      const newSeconds = prev - 1;
      if (newSeconds <= 0) {
        setIsRunning(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return 0;
      }
      return newSeconds;
    });
  }, []);

  // Start/stop interval based on isRunning
  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = setInterval(tick, 1000);
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
  }, [isRunning, seconds, tick]);

  // Format time display
  const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Control functions - completely independent
  const handleStart = () => {
    setIsRunning(true);
    setHasStarted(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setHasStarted(false);
    setSeconds(duration);
  };

  // Duration controls
  const adjustDuration = (change: number) => {
    if (isRunning) return; // Don't allow changes while running

    const newDuration = Math.max(60, duration + change); // Minimum 1 minute
    setDuration(newDuration);
    if (!hasStarted) {
      setSeconds(newDuration);
    }
  };

  // Calculate progress for visual indicator
  const progress = ((duration - seconds) / duration) * 100;
  const isWarning = seconds <= 60 && seconds > 0; // Warning in last minute
  const isTimeUp = seconds === 0;

  return (
    <Card glass padding="lg">
      <div className="text-center space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            Match Timer
          </h3>
          <p className="text-sm text-gray-400">
            Independent countdown timer for any purpose
          </p>
        </div>

        {/* Duration Controls - Only show when not running */}
        {!isRunning && !hasStarted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4"
          >
            {/* Custom Duration Adjuster */}
            <div className="flex items-center justify-center space-x-4">
              <motion.button
                onClick={() => adjustDuration(-60)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg shadow-lg border border-gray-500/30"
              >
                <Minus size={20} />
              </motion.button>

              <div className="text-white font-mono text-xl font-bold min-w-[120px] text-center">
                {Math.floor(duration / 60)} minutes
              </div>

              <motion.button
                onClick={() => adjustDuration(60)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 bg-pitch-green hover:bg-green-500 text-white rounded-lg shadow-lg border border-pitch-green/30"
              >
                <Plus size={20} />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Simple Timer Display */}
        <Card glass padding="xl" className="mx-auto max-w-md">
          <div className="text-center space-y-6">
            {/* Main Time Display */}
            <motion.div
              key={seconds}
              initial={{ scale: 1 }}
              animate={{
                scale: isWarning ? [1, 1.02, 1] : 1,
              }}
              transition={{
                duration: isWarning ? 0.6 : 0.3,
                repeat: isWarning ? Infinity : 0
              }}
              className="relative"
            >
              <div className={`font-mono text-7xl sm:text-8xl font-bold tracking-wider ${
                isTimeUp ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-pitch-green'
              } transition-colors duration-300`}>
                {formatTime(seconds)}
              </div>

              {/* Glow effect */}
              <div className={`absolute inset-0 font-mono text-7xl sm:text-8xl font-bold tracking-wider blur-lg opacity-30 ${
                isTimeUp ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-pitch-green'
              } transition-colors duration-300`}>
                {formatTime(seconds)}
              </div>
            </motion.div>

            {/* Status Indicator */}
            <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              isTimeUp
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : isRunning
                  ? 'bg-pitch-green/20 text-pitch-green border border-pitch-green/30'
                  : hasStarted
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            }`}>
              <motion.div
                animate={{
                  scale: isRunning ? [1, 1.2, 1] : 1,
                  opacity: isRunning ? [0.6, 1, 0.6] : 1
                }}
                transition={{
                  duration: 1.5,
                  repeat: isRunning ? Infinity : 0
                }}
                className={`w-2 h-2 rounded-full ${
                  isTimeUp ? 'bg-red-400' : isRunning ? 'bg-pitch-green' : hasStarted ? 'bg-yellow-400' : 'bg-blue-400'
                }`}
              />
              <span className="font-medium">
                {isTimeUp ? 'TIME UP!' : isRunning ? 'RUNNING' : hasStarted ? 'PAUSED' : 'READY'}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="h-3 bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
                <motion.div
                  className={`h-full rounded-full transition-colors duration-300 ${
                    isTimeUp ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-pitch-green'
                  }`}
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 font-mono">
                <span>00:00</span>
                <span className="text-white font-medium">{Math.floor(progress)}%</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Controls */}
        <div className="flex justify-center space-x-4">
          {!isRunning ? (
            <motion.button
              onClick={handleStart}
              disabled={isTimeUp}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                px-6 py-3 rounded-lg font-medium transition-all flex items-center space-x-2
                ${isTimeUp
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600 text-white'
                }
              `}
            >
              <Play size={20} />
              <span>{hasStarted ? 'Resume' : 'Start'}</span>
            </motion.button>
          ) : (
            <motion.button
              onClick={handlePause}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-all flex items-center space-x-2"
            >
              <Pause size={20} />
              <span>Pause</span>
            </motion.button>
          )}

          <motion.button
            onClick={handleReset}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-all flex items-center space-x-2"
          >
            <RotateCcw size={20} />
            <span>Reset</span>
          </motion.button>
        </div>

        {/* Status Info */}
        <div className="text-sm text-gray-400 space-y-1">
          <div>Timer Duration: <span className="text-white font-medium">{Math.floor(duration / 60)} minutes</span></div>
          {hasStarted && (
            <div>Elapsed: <span className="text-green-400 font-medium">
              {formatTime(duration - seconds)}
            </span></div>
          )}
          {isTimeUp && (
            <div className="text-red-400 font-medium">
              ⏰ Time's up!
            </div>
          )}
          {!hasStarted && !isRunning && (
            <div className="text-blue-400 text-xs">
              Use +/- to adjust duration before starting
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};