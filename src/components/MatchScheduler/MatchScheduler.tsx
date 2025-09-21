import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Trophy, Settings, RefreshCw, Filter } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { Card } from '../shared/Card';
import { MatchCard } from './MatchCard';
import { ScheduleSettings } from './ScheduleSettings';
import { AddGameCard } from './AddGameCard';

export const MatchScheduler: React.FC = () => {
  const {
    teams,
    matches,
    settings,
    generateSchedule,
    updateSettings
  } = useGameStore();

  const [showSettings, setShowSettings] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'scheduled' | 'in-progress' | 'completed'>('all');
  const [isGenerating, setIsGenerating] = useState(false);

  const hasTeams = teams.length > 0;
  const hasMatches = matches.length > 0;
  const canGenerateSchedule = hasTeams && teams.length >= 2;

  // Filter matches based on status
  const filteredMatches = matches.filter(match => {
    if (filterStatus === 'all') return true;
    return match.status === filterStatus;
  });

  // Group matches by status
  const matchesByStatus = {
    scheduled: matches.filter(m => m.status === 'scheduled'),
    inProgress: matches.filter(m => m.status === 'in-progress'),
    completed: matches.filter(m => m.status === 'completed')
  };

  const totalMatches = matches.length;
  const completedMatches = matchesByStatus.completed.length;
  const progressPercentage = totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0;

  const handleGenerateSchedule = async () => {
    setIsGenerating(true);
    // Add delay for visual feedback
    setTimeout(() => {
      generateSchedule();
      setIsGenerating(false);
    }, 1500);
  };


  // Calculate schedule statistics
  const scheduleStats = {
    totalGames: matches.length,
    gamesPerTeam: teams.length > 0 ? Math.floor(matches.length * 2 / teams.length) : 0,
    estimatedDuration: matches.length * settings.matchDuration,
    averageRestTime: teams.length > 2 ? Math.floor((matches.length * settings.matchDuration) / teams.length) : 0
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Match Scheduler</h1>
        <p className="text-gray-400">Organize and manage your game schedule</p>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
      >
        <motion.div variants={itemVariants}>
          <Card glass padding="md" className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="text-pitch-green mr-2" size={20} />
              <span className="text-xl font-bold text-white">{totalMatches}</span>
            </div>
            <p className="text-xs text-gray-400">Total Matches</p>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card glass padding="md" className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="text-yellow-400 mr-2" size={20} />
              <span className="text-xl font-bold text-white">{completedMatches}</span>
            </div>
            <p className="text-xs text-gray-400">Completed</p>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card glass padding="md" className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="text-blue-400 mr-2" size={20} />
              <span className="text-xl font-bold text-white">{scheduleStats.estimatedDuration}</span>
            </div>
            <p className="text-xs text-gray-400">Est. Minutes</p>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card glass padding="md" className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                progressPercentage >= 100 ? 'bg-green-400' :
                progressPercentage >= 50 ? 'bg-yellow-400' : 'bg-blue-400'
              }`} />
              <span className="text-xl font-bold text-white">{Math.round(progressPercentage)}%</span>
            </div>
            <p className="text-xs text-gray-400">Progress</p>
          </Card>
        </motion.div>
      </motion.div>

      {/* Progress Bar */}
      {totalMatches > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card glass padding="md">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Game Progress</span>
                <span className="text-white font-medium">{completedMatches} / {totalMatches} matches</span>
              </div>
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-pitch-green to-green-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card glass padding="lg">
          <div className="space-y-4">
            {/* Primary Action - Always on top */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <motion.button
                onClick={handleGenerateSchedule}
                disabled={!canGenerateSchedule || isGenerating}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all w-full sm:w-auto min-h-[44px]
                  ${canGenerateSchedule && !isGenerating
                    ? 'bg-pitch-green text-white shadow-lg hover:shadow-xl hover:bg-green-500'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                <RefreshCw size={18} className={isGenerating ? 'animate-spin' : ''} />
                <span className="text-sm sm:text-base">
                  {isGenerating ? 'Generating...' : hasMatches ? 'Regenerate' : 'Generate Schedule'}
                </span>
              </motion.button>

              {!canGenerateSchedule && (
                <div className="text-sm text-yellow-400 text-center sm:text-left">
                  Need at least 2 teams to generate schedule
                </div>
              )}
            </div>

            {/* Secondary Controls */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              {/* Filter */}
              <div className="flex items-center space-x-2 flex-1">
                <Filter size={16} className="text-gray-400 flex-shrink-0" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="bg-surface-elevated border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-pitch-green w-full sm:w-auto min-h-[44px]"
                >
                  <option value="all">All Matches</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Settings Button */}
              <motion.button
                onClick={() => setShowSettings(!showSettings)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all w-full sm:w-auto min-h-[44px]
                  ${showSettings
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-surface-elevated text-gray-400 hover:text-white hover:bg-gray-600'
                  }
                `}
              >
                <Settings size={16} />
                <span className="sm:inline">Settings</span>
              </motion.button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Schedule Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ScheduleSettings
              settings={settings}
              onUpdateSettings={updateSettings}
              teams={teams}
              scheduleStats={scheduleStats}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Match Schedule */}
      {hasMatches ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >

          {/* Match List */}
          <div className="space-y-3 sm:space-y-4">
            {filteredMatches.length > 0 ? (
              <AnimatePresence>
                {filteredMatches.map((match, index) => (
                  <motion.div
                    key={match.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                  >
                    <MatchCard
                      match={match}
                      teams={teams}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <Calendar size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No matches found</h3>
                <p className="text-gray-400">
                  {filterStatus === 'all'
                    ? 'Generate a schedule to see matches here'
                    : `No ${filterStatus} matches to display`
                  }
                </p>
              </motion.div>
            )}
          </div>

          {/* Schedule Summary */}
          {totalMatches > 0 && (
            <motion.div variants={itemVariants}>
              <Card glass padding="lg" className="border-t-2 border-pitch-green/30">
                <div className="text-center space-y-3">
                  <h3 className="text-lg font-semibold text-white">Schedule Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-2xl font-bold text-pitch-green">{scheduleStats.totalGames}</div>
                      <div className="text-gray-400">Total Games</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-400">{scheduleStats.gamesPerTeam}</div>
                      <div className="text-gray-400">Games/Team</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-400">{Math.floor(scheduleStats.estimatedDuration / 60)}h {scheduleStats.estimatedDuration % 60}m</div>
                      <div className="text-gray-400">Est. Duration</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-400">{scheduleStats.averageRestTime}m</div>
                      <div className="text-gray-400">Avg. Rest</div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Add Individual Game */}
          {canGenerateSchedule && (
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
            >
              <AddGameCard teams={teams} />
            </motion.div>
          )}
        </motion.div>
      ) : (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-surface-elevated rounded-full flex items-center justify-center">
            <Calendar size={32} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No schedule yet</h3>
          <p className="text-gray-400 mb-6">
            {!hasTeams
              ? 'Create teams first, then generate a match schedule'
              : 'Click "Generate Schedule" to create matches for your teams'
            }
          </p>
          {canGenerateSchedule && (
            <motion.button
              onClick={handleGenerateSchedule}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-pitch-green text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
            >
              Generate Schedule
            </motion.button>
          )}
        </motion.div>
      )}
    </div>
  );
};