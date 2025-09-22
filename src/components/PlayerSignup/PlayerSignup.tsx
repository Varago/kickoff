import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, BarChart3 } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { isPlayerCaptain } from '../../utils/helpers';
import { Card } from '../shared/Card';
import { KickoffLogo } from '../shared/KickoffLogo';
import { QuickAddForm } from './QuickAddForm';
import { PlayerCard } from './PlayerCard';

export const PlayerSignup: React.FC = () => {
  const { players, teams, settings, removePlayer, togglePlayerCaptain, assignPlayerToTeam } = useGameStore();
  const [recentlyAddedIds, setRecentlyAddedIds] = useState<Set<string>>(new Set());

  const activePlayers = players.filter(p => !p.isWaitlist);
  const waitlistPlayers = players.filter(p => p.isWaitlist);

  // Track recently added players with stable reference
  useEffect(() => {
    if (activePlayers.length === 0) return;

    const latestPlayer = activePlayers[activePlayers.length - 1];
    const createdTime = new Date(latestPlayer.createdAt).getTime();
    const currentTime = Date.now();
    const timeSinceAdded = currentTime - createdTime;

    // Only process if player was added within last 5 seconds and not already tracked
    if (timeSinceAdded < 5000 && !recentlyAddedIds.has(latestPlayer.id)) {
      setRecentlyAddedIds(prev => new Set(prev).add(latestPlayer.id));

      // Remove from recently added after 3 seconds
      const timeout = setTimeout(() => {
        setRecentlyAddedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(latestPlayer.id);
          return newSet;
        });
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [activePlayers, recentlyAddedIds]); // Include required dependencies

  // Calculate stats
  const averageSkill = activePlayers.length > 0
    ? (activePlayers.reduce((sum, p) => sum + p.skillLevel, 0) / activePlayers.length).toFixed(1)
    : 0;

  const handlePlayerAdded = () => {
    // This callback will be triggered when a player is successfully added
    // The tracking of recently added players is handled in the useEffect above
  };

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
    <div className="space-y-4 sm:space-y-6 w-full mobile-scroll">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Player Registration</h1>
        <p className="text-gray-400 text-sm sm:text-base">Add players quickly for your pickup game</p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full"
      >
        <motion.div variants={itemVariants}>
          <Card glass padding="md" className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="text-blue-400 mr-2" size={20} />
              <span className="text-xl font-bold text-white">{activePlayers.length}</span>
            </div>
            <p className="text-xs text-gray-400">Active Players</p>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card glass padding="md" className="text-center">
            <div className="flex items-center justify-center mb-2">
              <UserPlus className="text-purple-400 mr-2" size={20} />
              <span className="text-xl font-bold text-white">{waitlistPlayers.length}</span>
            </div>
            <p className="text-xs text-gray-400">Waitlist</p>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card glass padding="md" className="text-center">
            <div className="flex items-center justify-center mb-2">
              <BarChart3 className="text-green-400 mr-2" size={20} />
              <span className="text-xl font-bold text-white">{averageSkill}</span>
            </div>
            <p className="text-xs text-gray-400">Avg Skill</p>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card glass padding="md" className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="w-5 h-5 bg-yellow-400 rounded-full mr-2 flex items-center justify-center">
                <span className="text-xs font-bold text-black">C</span>
              </div>
              <span className="text-xl font-bold text-white">
                {activePlayers.filter(p => isPlayerCaptain(p.id, teams, players)).length}
              </span>
            </div>
            <p className="text-xs text-gray-400">Captains</p>
          </Card>
        </motion.div>
      </motion.div>

      {/* Quick Add Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <QuickAddForm onPlayerAdded={handlePlayerAdded} />
      </motion.div>

      {/* Active Players List */}
      {activePlayers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card glass padding="lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Users size={20} className="text-blue-400" />
                <h3 className="font-semibold text-white">Active Players</h3>
              </div>
              <div className="text-sm text-gray-400">
                {activePlayers.length} player{activePlayers.length !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="grid gap-3">
              <AnimatePresence>
                {activePlayers.map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                  >
                    <PlayerCard
                      player={player}
                      onRemove={() => removePlayer(player.id)}
                      onToggleCaptain={() => togglePlayerCaptain(player.id)}
                      isCaptain={isPlayerCaptain(player.id, teams, players)}
                      isRecent={recentlyAddedIds.has(player.id)}
                      showCaptainControls={true}
                      teams={teams}
                      maxPlayersPerTeam={settings.playersPerTeam}
                      onAssignToTeam={assignPlayerToTeam}
                      showTeamAssignment={teams.length > 0}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Waitlist Players */}
      {waitlistPlayers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card glass padding="lg" className="border-l-4 border-purple-400">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <UserPlus size={20} className="text-purple-400" />
                <h3 className="font-semibold text-white">Waitlist</h3>
              </div>
              <div className="text-sm text-gray-400">
                {waitlistPlayers.length} player{waitlistPlayers.length !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="grid gap-3">
              <AnimatePresence>
                {waitlistPlayers.map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                  >
                    <PlayerCard
                      player={player}
                      onRemove={() => removePlayer(player.id)}
                      onToggleCaptain={() => togglePlayerCaptain(player.id)}
                      isCaptain={isPlayerCaptain(player.id, teams, players)}
                      isRecent={recentlyAddedIds.has(player.id)}
                      showCaptainControls={true}
                      isWaitlist={true}
                      teams={teams}
                      maxPlayersPerTeam={settings.playersPerTeam}
                      onAssignToTeam={assignPlayerToTeam}
                      showTeamAssignment={teams.length > 0}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Empty State */}
      {activePlayers.length === 0 && waitlistPlayers.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-pitch-green/10 border-2 border-pitch-green/20 rounded-full flex items-center justify-center">
            <KickoffLogo className="w-12 h-12" variant="primary" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">Welcome to Kickoff</h3>
          <p className="text-gray-400">Add your first player to get started with pickup games</p>
          <div className="mt-4">
            <span className="inline-flex items-center text-sm font-medium text-pitch-green bg-pitch-green/10 px-3 py-1 rounded-full border border-pitch-green/20">
              Professional Pickup Game Management
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};