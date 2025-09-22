import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Crown } from 'lucide-react';
import { Team, Player } from '../../types';
import { getTeamDisplayName } from '../../utils/helpers';

interface TeamSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTeam: (teamId: string | null) => void;
  teams: Team[];
  player: Player;
  maxPlayersPerTeam: number;
}

export const TeamSelectionModal: React.FC<TeamSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectTeam,
  teams,
  player,
  maxPlayersPerTeam
}) => {
  if (!isOpen) return null;

  const getTeamColorClass = (team: Team) => {
    const colorMap = {
      black: 'bg-gray-800 text-white',
      white: 'bg-gray-200 text-black',
      orange: 'bg-orange-500 text-white',
      blue: 'bg-blue-500 text-white',
      yellow: 'bg-yellow-500 text-black',
      red: 'bg-red-600 text-white',
      green: 'bg-green-600 text-white',
      purple: 'bg-purple-600 text-white',
      pink: 'bg-pink-600 text-white',
      teal: 'bg-teal-600 text-white',
      'no-pennies': 'bg-gradient-to-r from-green-400 to-blue-500 text-white'
    };
    return colorMap[team.color] || 'bg-gray-500 text-white';
  };

  const handleSelectTeam = (teamId: string | null) => {
    onSelectTeam(teamId);
    onClose();
  };

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
          className="bg-surface-dark border border-gray-600 rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Assign {player.name}
            </h3>
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-600/20 transition-all"
            >
              <X size={16} />
            </motion.button>
          </div>

          {/* Player Info */}
          <div className="mb-6 p-4 bg-gray-700/30 rounded-lg border border-gray-600/30">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-pitch-green/20 border border-pitch-green/30 rounded-full flex items-center justify-center">
                <Users size={16} className="text-pitch-green" />
              </div>
              <div>
                <div className="font-medium text-white">{player.name}</div>
                <div className="text-sm text-gray-400">
                  Skill Level {player.skillLevel}
                  {player.isCaptain && (
                    <span className="ml-2 inline-flex items-center">
                      <Crown size={12} className="text-yellow-400" />
                      <span className="ml-1 text-yellow-400">Captain</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Team Options */}
          <div className="space-y-3">
            {/* Waitlist Option */}
            <motion.button
              onClick={() => handleSelectTeam(null)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full p-4 bg-gray-600/20 hover:bg-gray-600/40 border border-gray-600/30 rounded-lg transition-all text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
                  <Users size={14} className="text-gray-300" />
                </div>
                <div>
                  <div className="font-medium text-white">Waitlist</div>
                  <div className="text-sm text-gray-400">Move to waitlist</div>
                </div>
              </div>
            </motion.button>

            {/* Team Options */}
            {teams.map((team) => {
              const isPlayerOnTeam = team.players.some(p => p.id === player.id);
              const isFull = team.players.length >= maxPlayersPerTeam;
              const canJoin = !isFull || isPlayerOnTeam;

              return (
                <motion.button
                  key={team.id}
                  onClick={() => canJoin ? handleSelectTeam(team.id) : null}
                  disabled={!canJoin}
                  whileHover={canJoin ? { scale: 1.02 } : {}}
                  whileTap={canJoin ? { scale: 0.98 } : {}}
                  className={`w-full p-4 border rounded-lg transition-all text-left ${
                    canJoin
                      ? 'bg-gray-700/20 hover:bg-gray-700/40 border-gray-600/30'
                      : 'bg-gray-800/20 border-gray-700/30 opacity-50 cursor-not-allowed'
                  } ${
                    isPlayerOnTeam ? 'ring-2 ring-pitch-green ring-opacity-50 bg-pitch-green/5' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getTeamColorClass(team)}`}>
                      <span className="font-bold text-sm">{team.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-white">{getTeamDisplayName(team)}</span>
                        {isPlayerOnTeam && (
                          <span className="text-xs bg-pitch-green/20 text-pitch-green px-2 py-1 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">
                        {team.players.length}/{maxPlayersPerTeam} players
                        {team.averageSkill > 0 && (
                          <span className="ml-2">• Avg skill: {team.averageSkill}</span>
                        )}
                      </div>
                      {isFull && !isPlayerOnTeam && (
                        <div className="text-xs text-red-400 mt-1">Team is full</div>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Info */}
          <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="text-xs text-blue-400">
              Players can only be on one team at a time. Selecting a new team will remove them from their current team.
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};