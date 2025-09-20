import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftRight, Check, X } from 'lucide-react';
import { Team, Match } from '../../types';
import { getTeamColorClass } from '../../utils/helpers';

interface TeamSwapModalProps {
  match: Match;
  teams: Team[];
  onSwapTeams: (matchId: string, newTeamAId: string, newTeamBId: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const TeamSwapModal: React.FC<TeamSwapModalProps> = ({
  match,
  teams,
  onSwapTeams,
  onClose,
  isOpen
}) => {
  const [selectedTeamA, setSelectedTeamA] = useState(match.teamAId);
  const [selectedTeamB, setSelectedTeamB] = useState(match.teamBId);

  const currentTeamA = teams.find(t => t.id === match.teamAId);
  const currentTeamB = teams.find(t => t.id === match.teamBId);

  const handleSwap = () => {
    if (selectedTeamA !== selectedTeamB) {
      onSwapTeams(match.id, selectedTeamA, selectedTeamB);
      onClose();
    }
  };

  const handleReset = () => {
    setSelectedTeamA(match.teamAId);
    setSelectedTeamB(match.teamBId);
  };

  const hasChanges = selectedTeamA !== match.teamAId || selectedTeamB !== match.teamBId;
  const isValid = selectedTeamA !== selectedTeamB;

  if (!isOpen || !currentTeamA || !currentTeamB) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-surface-dark border border-gray-600 rounded-lg p-6 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center">
                <ArrowLeftRight className="text-blue-400" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Swap Teams</h3>
                <p className="text-sm text-gray-400">Game {match.gameNumber}</p>
              </div>
            </div>
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-600/20 transition-all"
            >
              <X size={16} />
            </motion.button>
          </div>

          {/* Team Selection */}
          <div className="space-y-6">
            {/* Team A Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Team A
              </label>
              <div className="space-y-2">
                {teams.map((team) => (
                  <motion.button
                    key={team.id}
                    onClick={() => setSelectedTeamA(team.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      w-full p-3 rounded-lg border-2 transition-all flex items-center space-x-3
                      ${selectedTeamA === team.id
                        ? 'border-pitch-green bg-pitch-green/10'
                        : 'border-gray-600 hover:border-gray-500'
                      }
                      ${selectedTeamB === team.id ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    disabled={selectedTeamB === team.id}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getTeamColorClass(team)}`}>
                      <span className="font-bold text-sm">{team.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-white">{team.name}</div>
                      <div className="text-xs text-gray-400">
                        {team.players.length} players • Avg {team.averageSkill}
                      </div>
                    </div>
                    {selectedTeamA === team.id && (
                      <Check size={16} className="text-pitch-green" />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* VS Divider */}
            <div className="flex items-center justify-center">
              <div className="h-px bg-gray-600 flex-1"></div>
              <span className="px-4 text-gray-400 font-medium">VS</span>
              <div className="h-px bg-gray-600 flex-1"></div>
            </div>

            {/* Team B Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Team B
              </label>
              <div className="space-y-2">
                {teams.map((team) => (
                  <motion.button
                    key={team.id}
                    onClick={() => setSelectedTeamB(team.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      w-full p-3 rounded-lg border-2 transition-all flex items-center space-x-3
                      ${selectedTeamB === team.id
                        ? 'border-pitch-green bg-pitch-green/10'
                        : 'border-gray-600 hover:border-gray-500'
                      }
                      ${selectedTeamA === team.id ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    disabled={selectedTeamA === team.id}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getTeamColorClass(team)}`}>
                      <span className="font-bold text-sm">{team.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-white">{team.name}</div>
                      <div className="text-xs text-gray-400">
                        {team.players.length} players • Avg {team.averageSkill}
                      </div>
                    </div>
                    {selectedTeamB === team.id && (
                      <Check size={16} className="text-pitch-green" />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Validation Warning */}
          {!isValid && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
            >
              <div className="text-red-400 text-sm">
                Please select different teams for Team A and Team B.
              </div>
            </motion.div>
          )}

          {/* Match Status Warning */}
          {match.status !== 'scheduled' && hasChanges && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg"
            >
              <div className="text-yellow-400 text-sm">
                {match.status === 'completed'
                  ? 'This match is completed. Swapping teams will recalculate standings.'
                  : 'This match is in progress. Scores will be preserved.'
                }
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex justify-between mt-6">
            <button
              onClick={handleReset}
              disabled={!hasChanges}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset
            </button>

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <motion.button
                onClick={handleSwap}
                disabled={!hasChanges || !isValid}
                whileHover={hasChanges && isValid ? { scale: 1.02 } : {}}
                whileTap={hasChanges && isValid ? { scale: 0.98 } : {}}
                className="px-4 py-2 bg-pitch-green text-white rounded-lg hover:bg-green-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-400"
              >
                {hasChanges ? 'Swap Teams' : 'No Changes'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};