import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Shuffle, Settings, Crown, Target, Trash2 } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { Card } from '../shared/Card';
import { TeamCard } from './TeamCard';
import { PlayerPool } from './PlayerPool';
import { TeamSettings } from './TeamSettings';
import { DragDropWrapper } from './DragDropContext';

export const TeamBuilder: React.FC = () => {
  const {
    players,
    teams,
    settings,
    generateTeams,
    resetTeams,
    updateSettings,
    movePlayer,
    setCaptain,
    updateTeamColor
  } = useGameStore();

  const [showSettings, setShowSettings] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const activePlayers = players.filter(p => !p.isWaitlist);
  const waitlistPlayers = players.filter(p => p.isWaitlist);
  const assignedPlayers = teams.flatMap(team => team.players);
  const unassignedPlayers = activePlayers.filter(
    player => !assignedPlayers.some(assigned => assigned.id === player.id)
  );

  // Combine unassigned active players and waitlist players for the pool
  const availablePlayers = [...unassignedPlayers, ...waitlistPlayers];

  const canGenerateTeams = activePlayers.length >= 1; // Allow generation with any number of players
  const totalSlotsNeeded = settings.teamsCount * settings.playersPerTeam;
  const hasTeams = teams.length > 0;

  const handleGenerateTeams = async () => {
    setIsGenerating(true);
    // Add a small delay for visual feedback
    setTimeout(() => {
      generateTeams();
      setIsGenerating(false);
    }, 1000);
  };

  const handleResetTeams = () => {
    resetTeams();
  };

  // Calculate team balance statistics
  const teamStats = teams.map(team => ({
    id: team.id,
    name: team.name,
    playerCount: team.players.length,
    averageSkill: team.averageSkill,
    totalSkill: team.players.reduce((sum, p) => sum + p.skillLevel, 0)
  }));

  const overallBalance = teamStats.length > 1
    ? Math.abs(Math.max(...teamStats.map(t => t.averageSkill)) - Math.min(...teamStats.map(t => t.averageSkill)))
    : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Team Builder</h1>
        <p className="text-gray-400">Create balanced teams for competitive play</p>
      </motion.div>

      {/* Stats Bar */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
      >
        <motion.div variants={itemVariants}>
          <Card glass padding="md" className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="text-pitch-green mr-2" size={20} />
              <span className="text-xl font-bold text-white">{activePlayers.length}</span>
            </div>
            <p className="text-xs text-gray-400">Active Players</p>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card glass padding="md" className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="text-blue-400 mr-2" size={20} />
              <span className="text-xl font-bold text-white">{totalSlotsNeeded}</span>
            </div>
            <p className="text-xs text-gray-400">Slots Needed</p>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card glass padding="md" className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Crown className="text-yellow-400 mr-2" size={20} />
              <span className="text-xl font-bold text-white">{teams.length}</span>
            </div>
            <p className="text-xs text-gray-400">Teams</p>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card glass padding="md" className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                overallBalance < 0.5 ? 'bg-green-400' :
                overallBalance < 1.0 ? 'bg-yellow-400' : 'bg-red-400'
              }`} />
              <span className="text-xl font-bold text-white">{overallBalance.toFixed(1)}</span>
            </div>
            <p className="text-xs text-gray-400">Balance Score</p>
          </Card>
        </motion.div>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card glass padding="lg">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <motion.button
                onClick={handleGenerateTeams}
                disabled={!canGenerateTeams || isGenerating}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all
                  ${canGenerateTeams && !isGenerating
                    ? 'bg-pitch-green text-white shadow-lg hover:shadow-xl hover:bg-green-500'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                <Shuffle size={18} className={isGenerating ? 'animate-spin' : ''} />
                <span>
                  {isGenerating ? 'Generating...' : hasTeams ? 'Regenerate Teams' : 'Generate Teams'}
                </span>
              </motion.button>

              {hasTeams && (
                <motion.button
                  onClick={handleResetTeams}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center space-x-2 px-4 py-3 rounded-lg font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                >
                  <Trash2 size={16} />
                  <span>Reset</span>
                </motion.button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              <motion.button
                onClick={() => setShowSettings(!showSettings)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all w-full sm:w-auto justify-center
                  ${showSettings
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-surface-elevated text-gray-400 hover:text-white hover:bg-gray-600'
                  }
                `}
              >
                <Settings size={16} />
                <span>Settings</span>
              </motion.button>

              <div className="text-sm text-gray-400 text-center">
                {settings.teamsCount} teams × {settings.playersPerTeam} players
              </div>
            </div>
          </div>

          {!canGenerateTeams && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg"
            >
              <p className="text-yellow-400 text-sm">
                Need at least 1 player to generate teams
              </p>
            </motion.div>
          )}
        </Card>
      </motion.div>

      {/* Team Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TeamSettings
              settings={settings}
              onUpdateSettings={updateSettings}
              playerCount={activePlayers.length}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Team Builder Content */}
      {hasTeams ? (
        <DragDropWrapper
          teams={teams}
          unassignedPlayers={unassignedPlayers}
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Teams Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-4 lg:gap-6">
              {teams.map((team, index) => (
                <motion.div key={team.id} variants={itemVariants}>
                  <TeamCard
                    team={team}
                    teams={teams}
                    onMovePlayer={movePlayer}
                    onSetCaptain={(playerId: string) => setCaptain(team.id, playerId)}
                    onUpdateTeamColor={updateTeamColor}
                  />
                </motion.div>
              ))}
            </div>

            {/* Available Players Pool */}
            {availablePlayers.length > 0 && (
              <motion.div variants={itemVariants}>
                <PlayerPool
                  players={availablePlayers}
                  teams={teams}
                  onMovePlayer={movePlayer}
                />
              </motion.div>
            )}
          </motion.div>
        </DragDropWrapper>
      ) : (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-surface-elevated rounded-full flex items-center justify-center">
            <Users size={32} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">Ready to build teams!</h3>
          <p className="text-gray-400 mb-6">
            {canGenerateTeams
              ? 'Click "Generate Teams" to create balanced teams automatically. Teams will be created with available players and partially filled if needed.'
              : 'Add players to get started with team generation'
            }
          </p>
          {canGenerateTeams && (
            <motion.button
              onClick={handleGenerateTeams}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-pitch-green text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
            >
              Generate Teams
            </motion.button>
          )}
        </motion.div>
      )}
    </div>
  );
};