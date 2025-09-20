import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Users } from 'lucide-react';
import { Team } from '../../types';
import { getTeamDisplayName, getTeamColorClass } from '../../utils/helpers';
import { Card } from '../shared/Card';
import { useHaptic } from '../../hooks/useHaptic';
import { useGameStore } from '../../store/gameStore';

interface AddGameCardProps {
  teams: Team[];
}

export const AddGameCard: React.FC<AddGameCardProps> = ({ teams }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTeamA, setSelectedTeamA] = useState<string>('');
  const [selectedTeamB, setSelectedTeamB] = useState<string>('');
  const haptic = useHaptic();
  const { addMatch } = useGameStore();

  const canAddGame = selectedTeamA && selectedTeamB && selectedTeamA !== selectedTeamB;
  const availableTeams = teams.filter(team => team.players.length > 0);

  const handleAddGame = () => {
    if (!canAddGame) return;

    addMatch(selectedTeamA, selectedTeamB);
    setSelectedTeamA('');
    setSelectedTeamB('');
    setIsExpanded(false);
    haptic.success();
  };

  const handleCancel = () => {
    setSelectedTeamA('');
    setSelectedTeamB('');
    setIsExpanded(false);
    haptic.light();
  };

  const getTeamOptions = (excludeTeamId?: string) => {
    return availableTeams.filter(team => team.id !== excludeTeamId);
  };

  return (
    <Card glass padding="lg">
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <motion.button
              onClick={() => setIsExpanded(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center space-x-2 w-full px-6 py-4 bg-pitch-green/10 hover:bg-pitch-green/20 border-2 border-dashed border-pitch-green/30 hover:border-pitch-green/50 rounded-lg transition-all text-pitch-green hover:text-green-400"
            >
              <Plus size={20} />
              <span className="font-medium">Add Individual Game</span>
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Add New Game</h3>
              <motion.button
                onClick={handleCancel}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-600/20 transition-all"
              >
                <X size={16} />
              </motion.button>
            </div>

            {availableTeams.length < 2 ? (
              <div className="text-center py-6">
                <Users size={32} className="text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400">
                  Need at least 2 teams with players to add a game
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Team A Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Team A
                  </label>
                  <select
                    value={selectedTeamA}
                    onChange={(e) => setSelectedTeamA(e.target.value)}
                    className="w-full bg-surface-elevated border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-pitch-green"
                  >
                    <option value="">Select Team A</option>
                    {getTeamOptions(selectedTeamB).map((team) => (
                      <option key={team.id} value={team.id}>
                        {getTeamDisplayName(team)} ({team.players.length} players)
                      </option>
                    ))}
                  </select>
                </div>

                {/* VS Divider */}
                <div className="text-center">
                  <span className="text-gray-400 font-medium">VS</span>
                </div>

                {/* Team B Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Team B
                  </label>
                  <select
                    value={selectedTeamB}
                    onChange={(e) => setSelectedTeamB(e.target.value)}
                    className="w-full bg-surface-elevated border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-pitch-green"
                  >
                    <option value="">Select Team B</option>
                    {getTeamOptions(selectedTeamA).map((team) => (
                      <option key={team.id} value={team.id}>
                        {getTeamDisplayName(team)} ({team.players.length} players)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Teams Preview */}
                {selectedTeamA && selectedTeamB && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-surface-dark rounded-lg p-4 border border-gray-600"
                  >
                    <div className="flex items-center justify-between">
                      {/* Team A Preview */}
                      <div className="flex items-center space-x-2 flex-1">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getTeamColorClass(availableTeams.find(t => t.id === selectedTeamA)!)}`}>
                          <span className="font-bold text-sm">
                            {availableTeams.find(t => t.id === selectedTeamA)?.name.charAt(0)}
                          </span>
                        </div>
                        <span className="text-white font-medium truncate">
                          {getTeamDisplayName(availableTeams.find(t => t.id === selectedTeamA)!)}
                        </span>
                      </div>

                      <span className="text-gray-400 mx-4">vs</span>

                      {/* Team B Preview */}
                      <div className="flex items-center space-x-2 flex-1 justify-end">
                        <span className="text-white font-medium truncate">
                          {getTeamDisplayName(availableTeams.find(t => t.id === selectedTeamB)!)}
                        </span>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getTeamColorClass(availableTeams.find(t => t.id === selectedTeamB)!)}`}>
                          <span className="font-bold text-sm">
                            {availableTeams.find(t => t.id === selectedTeamB)?.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-2">
                  <motion.button
                    onClick={handleCancel}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-all"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleAddGame}
                    disabled={!canAddGame}
                    whileHover={canAddGame ? { scale: 1.02 } : {}}
                    whileTap={canAddGame ? { scale: 0.98 } : {}}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                      canAddGame
                        ? 'bg-pitch-green hover:bg-green-500 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Add Game
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};