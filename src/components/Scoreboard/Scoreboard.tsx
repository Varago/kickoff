import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Target, Award, Medal, Crown, BarChart3 } from 'lucide-react';
import { KickoffLogo } from '../shared/KickoffLogo';
import { useGameStore } from '../../store/gameStore';
import { getTeamDisplayName } from '../../utils/helpers';
import { Card } from '../shared/Card';
import { StandingsTable } from './StandingsTable';
import { MatchResults } from './MatchResults';
import { TeamStats } from './TeamStats';

export const Scoreboard: React.FC = () => {
  const {
    teams,
    matches,
    standings,
    calculateStandings
  } = useGameStore();

  const [selectedView, setSelectedView] = useState<'standings' | 'results' | 'stats'>('standings');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const completedMatches = matches.filter(m => m.status === 'completed');
  const totalMatches = matches.length;
  const gameProgress = totalMatches > 0 ? (completedMatches.length / totalMatches) * 100 : 0;

  // Recalculate standings when matches change
  useEffect(() => {
    if (completedMatches.length > 0) {
      calculateStandings();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedMatches.length]); // calculateStandings omitted to prevent infinite loop

  // Get current leader
  const leader = standings.length > 0 ? standings[0] : null;
  const leaderTeam = leader ? teams.find(t => t.id === leader.teamId) : null;

  // Calculate game statistics
  const gameStats = {
    totalGoals: standings.reduce((sum, s) => sum + s.goalsFor, 0),
    totalMatches: completedMatches.length,
    averageGoalsPerMatch: completedMatches.length > 0
      ? (standings.reduce((sum, s) => sum + s.goalsFor, 0) / completedMatches.length).toFixed(1)
      : '0.0',
    highestScore: Math.max(...completedMatches.flatMap(m => [m.scoreA, m.scoreB]), 0),
    mostGoalsTeam: standings.length > 0
      ? standings.reduce((prev, current) => prev.goalsFor > current.goalsFor ? prev : current)
      : null,
    bestDefense: standings.length > 0
      ? standings.reduce((prev, current) => prev.goalsAgainst < current.goalsAgainst ? prev : current)
      : null
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
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Game Scoreboard</h1>
        <p className="text-gray-400">Live standings and match results</p>
      </motion.div>

      {/* Game Overview */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <motion.div variants={itemVariants}>
          <Card glass padding="md" className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="text-yellow-400 mr-2" size={20} />
              <span className="text-xl font-bold text-white">{completedMatches.length}</span>
            </div>
            <p className="text-xs text-gray-400">Matches Played</p>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card glass padding="md" className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="text-green-400 mr-2" size={20} />
              <span className="text-xl font-bold text-white">{gameStats.totalGoals}</span>
            </div>
            <p className="text-xs text-gray-400">Total Goals</p>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card glass padding="md" className="text-center">
            <div className="flex items-center justify-center mb-2">
              <BarChart3 className="text-blue-400 mr-2" size={20} />
              <span className="text-xl font-bold text-white">{gameStats.averageGoalsPerMatch}</span>
            </div>
            <p className="text-xs text-gray-400">Goals/Match</p>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card glass padding="md" className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                gameProgress >= 100 ? 'bg-green-400' :
                gameProgress >= 50 ? 'bg-yellow-400' : 'bg-blue-400'
              }`} />
              <span className="text-xl font-bold text-white">{Math.round(gameProgress)}%</span>
            </div>
            <p className="text-xs text-gray-400">Complete</p>
          </Card>
        </motion.div>
      </motion.div>

      {/* Current Leader */}
      {leader && leaderTeam && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card glass padding="lg" className="border-t-4 border-yellow-400">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Crown size={24} className="text-yellow-900" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-xl font-bold text-white">{getTeamDisplayName(leaderTeam)}</h3>
                    <Trophy size={20} className="text-yellow-400" />
                  </div>
                  <p className="text-gray-400">Current Leader</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm">
                    <span className="text-green-400">{leader.points} pts</span>
                    <span className="text-blue-400">{leader.won}W-{leader.drawn}D-{leader.lost}L</span>
                    <span className="text-orange-400">+{leader.goalDifference}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-3xl font-bold text-yellow-400">#1</div>
                <div className="text-sm text-gray-400">Position</div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* View Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card glass padding="md">
          <div className="flex space-x-1 bg-surface-dark rounded-lg p-1">
            {[
              { key: 'standings', label: 'Standings', icon: Trophy },
              { key: 'results', label: 'Results', icon: Target },
              { key: 'stats', label: 'Stats', icon: BarChart3 }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSelectedView(key as any)}
                className={`
                  flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all
                  ${selectedView === key
                    ? 'bg-pitch-green text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-600'
                  }
                `}
              >
                <Icon size={16} />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {selectedView === 'standings' && (
            <StandingsTable
              standings={standings}
              teams={teams}
              onSelectTeam={setSelectedTeamId}
              selectedTeamId={selectedTeamId}
            />
          )}

          {selectedView === 'results' && (
            <MatchResults
              matches={completedMatches}
              teams={teams}
            />
          )}

          {selectedView === 'stats' && (
            <TeamStats
              standings={standings}
              teams={teams}
              matches={completedMatches}
              gameStats={gameStats}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Empty State */}
      {completedMatches.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-pitch-green/10 border-2 border-pitch-green/20 rounded-full flex items-center justify-center">
            <KickoffLogo className="w-12 h-12" variant="primary" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No results yet</h3>
          <p className="text-gray-400">Start matches to see standings and statistics</p>
          <div className="mt-4">
            <span className="inline-flex items-center text-sm font-medium text-pitch-green bg-pitch-green/10 px-3 py-1 rounded-full border border-pitch-green/20">
              Powered by Kickoff
            </span>
          </div>
        </motion.div>
      )}

      {/* Quick Stats Footer */}
      {completedMatches.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card glass padding="lg" className="border-t-2 border-pitch-green/30">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold text-white">Game Highlights</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Highest Scoring */}
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Target size={20} className="text-red-400" />
                  </div>
                  <div className="text-lg font-bold text-white">{gameStats.highestScore}</div>
                  <div className="text-sm text-gray-400">Highest Score</div>
                </div>

                {/* Top Scorer */}
                {gameStats.mostGoalsTeam && (
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Award size={20} className="text-green-400" />
                    </div>
                    <div className="text-lg font-bold text-white">{gameStats.mostGoalsTeam.goalsFor}</div>
                    <div className="text-sm text-gray-400">
                      Most Goals ({teams.find(t => t.id === gameStats.mostGoalsTeam?.teamId)?.name})
                    </div>
                  </div>
                )}

                {/* Best Defense */}
                {gameStats.bestDefense && (
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Medal size={20} className="text-blue-400" />
                    </div>
                    <div className="text-lg font-bold text-white">{gameStats.bestDefense.goalsAgainst}</div>
                    <div className="text-sm text-gray-400">
                      Best Defense ({teams.find(t => t.id === gameStats.bestDefense?.teamId)?.name})
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};