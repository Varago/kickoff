import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Save, X, RotateCcw } from 'lucide-react';
import { Match, Team } from '../../types';
import { getTeamDisplayName, getTeamColorClass } from '../../utils/helpers';
import { Card } from './Card';
import { useHaptic } from '../../hooks/useHaptic';

interface ScoreEditorProps {
  match: Match;
  teamA: Team;
  teamB: Team;
  onSave: (scoreA: number, scoreB: number) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export const ScoreEditor: React.FC<ScoreEditorProps> = ({
  match,
  teamA,
  teamB,
  onSave,
  onCancel,
  isOpen
}) => {
  const [scoreA, setScoreA] = useState(match.scoreA);
  const [scoreB, setScoreB] = useState(match.scoreB);
  const haptic = useHaptic();

  const handleScoreChange = useCallback((team: 'A' | 'B', delta: number) => {
    const setScore = team === 'A' ? setScoreA : setScoreB;
    const currentScore = team === 'A' ? scoreA : scoreB;
    const newScore = Math.max(0, currentScore + delta);
    setScore(newScore);
    haptic.light();
  }, [scoreA, scoreB, haptic]);

  const handleSave = useCallback(() => {
    onSave(scoreA, scoreB);
    haptic.success();
  }, [scoreA, scoreB, onSave, haptic]);

  const handleReset = useCallback(() => {
    setScoreA(match.scoreA);
    setScoreB(match.scoreB);
    haptic.light();
  }, [match.scoreA, match.scoreB, haptic]);

  const hasChanges = scoreA !== match.scoreA || scoreB !== match.scoreB;

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md"
      >
        <Card glass padding="xl">
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">Edit Score</h3>
              <p className="text-sm text-gray-400">Game {match.gameNumber}</p>
            </div>

            {/* Score Editor */}
            <div className="space-y-6">
              {/* Team A */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getTeamColorClass(teamA)}`}>
                    <span className="font-bold">{teamA.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{getTeamDisplayName(teamA)}</h4>
                    <p className="text-xs text-gray-400">{teamA.players.length} players</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <motion.button
                    onClick={() => handleScoreChange('A', -1)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center justify-center transition-colors"
                    disabled={scoreA === 0}
                  >
                    <Minus size={16} />
                  </motion.button>

                  <div className="w-16 text-center">
                    <span className="text-3xl font-bold text-white">{scoreA}</span>
                  </div>

                  <motion.button
                    onClick={() => handleScoreChange('A', 1)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 rounded-full bg-green-500/20 text-green-400 hover:bg-green-500/30 flex items-center justify-center transition-colors"
                  >
                    <Plus size={16} />
                  </motion.button>
                </div>
              </div>

              {/* VS Divider */}
              <div className="text-center">
                <span className="text-2xl font-bold text-gray-400">VS</span>
              </div>

              {/* Team B */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getTeamColorClass(teamB)}`}>
                    <span className="font-bold">{teamB.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{getTeamDisplayName(teamB)}</h4>
                    <p className="text-xs text-gray-400">{teamB.players.length} players</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <motion.button
                    onClick={() => handleScoreChange('B', -1)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center justify-center transition-colors"
                    disabled={scoreB === 0}
                  >
                    <Minus size={16} />
                  </motion.button>

                  <div className="w-16 text-center">
                    <span className="text-3xl font-bold text-white">{scoreB}</span>
                  </div>

                  <motion.button
                    onClick={() => handleScoreChange('B', 1)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 rounded-full bg-green-500/20 text-green-400 hover:bg-green-500/30 flex items-center justify-center transition-colors"
                  >
                    <Plus size={16} />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Match Result Preview */}
            {hasChanges && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center p-3 bg-pitch-green/10 border border-pitch-green/20 rounded-lg"
              >
                <p className="text-sm text-white">
                  {scoreA > scoreB ? (
                    <>
                      <span className="font-semibold text-green-400">{getTeamDisplayName(teamA)}</span> wins {scoreA}-{scoreB}
                    </>
                  ) : scoreB > scoreA ? (
                    <>
                      <span className="font-semibold text-green-400">{getTeamDisplayName(teamB)}</span> wins {scoreB}-{scoreA}
                    </>
                  ) : (
                    <span className="text-yellow-400">Draw {scoreA}-{scoreB}</span>
                  )}
                </p>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-center space-x-3">
              {hasChanges && (
                <motion.button
                  onClick={handleReset}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                >
                  <RotateCcw size={16} />
                  <span>Reset</span>
                </motion.button>
              )}

              <motion.button
                onClick={onCancel}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
              >
                <X size={16} />
                <span>Cancel</span>
              </motion.button>

              <motion.button
                onClick={handleSave}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!hasChanges}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  hasChanges
                    ? 'bg-pitch-green text-white hover:bg-green-500'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Save size={16} />
                <span>Save</span>
              </motion.button>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};