import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Trophy, Calendar, Clock, ChevronDown, Wifi, WifiOff, Settings } from 'lucide-react';
import { NavigationTab } from './Navigation';
import { useGameStore } from '../../store/gameStore';
import { Card } from '../shared/Card';
import { UnifiedSettings } from '../shared/UnifiedSettings';
import { KickoffLogo } from '../shared/KickoffLogo';

interface NavigationTabConfig {
  id: NavigationTab;
  label: string;
  icon: React.ComponentType<any>;
  component: React.ComponentType;
  requiresPlayers?: boolean;
  requiresTeams?: boolean;
  requiresMatches?: boolean;
}

interface AppHeaderProps {
  activeTab: NavigationTab;
  onTabChange: (tabId: NavigationTab) => void;
  tabs: NavigationTabConfig[];
  getTabAccessibility: (tab: NavigationTabConfig) => { disabled: boolean; reason?: string };
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeTab,
  onTabChange,
  tabs,
  getTabAccessibility
}) => {
  const {
    players,
    teams,
    matches,
    currentMatch,
    tournamentName,
    setTournamentName,
    resetApp
  } = useGameStore();

  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [showQuickStats, setShowQuickStats] = React.useState(false);
  const [showUnifiedSettings, setShowUnifiedSettings] = useState(false);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getTabTitle = () => {
    switch (activeTab) {
      case 'signup':
        return 'Player Registration';
      case 'teams':
        return 'Team Builder';
      case 'timer':
        return currentMatch ? `Game ${currentMatch.gameNumber}` : 'Match Timer';
      case 'schedule':
        return 'Match Schedule';
      case 'scoreboard':
        return 'Game Results';
      default:
        return 'Kickoff';
    }
  };

  const getTabSubtitle = () => {
    const activePlayers = players.filter(p => !p.isWaitlist).length;
    const waitlistPlayers = players.filter(p => p.isWaitlist).length;
    const completedMatches = matches.filter(m => m.status === 'completed').length;

    switch (activeTab) {
      case 'signup':
        return `${activePlayers} active${waitlistPlayers > 0 ? `, ${waitlistPlayers} waitlist` : ''}`;
      case 'teams':
        return `${teams.length} teams formed`;
      case 'timer':
        return currentMatch ? 'Match in progress' : 'Ready to start';
      case 'schedule':
        return `${matches.length} matches scheduled`;
      case 'scoreboard':
        return `${completedMatches} matches completed`;
      default:
        return '';
    }
  };

  const quickStats = {
    players: players.filter(p => !p.isWaitlist).length,
    teams: teams.length,
    matches: matches.filter(m => m.status === 'completed').length,
    inProgress: currentMatch ? 1 : 0
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 bg-surface-dark/95 backdrop-blur-lg border-b border-gray-600/30 w-full"
    >
      <div className="w-full mx-auto px-3 sm:px-4 max-w-none sm:max-w-4xl sm:container">
        <div className="flex items-center justify-between py-3 sm:py-4">
          {/* Left: App branding and current view */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-8 h-8 sm:w-10 sm:h-10 bg-pitch-green rounded-lg flex items-center justify-center flex-shrink-0"
            >
              <KickoffLogo className="w-5 h-5 sm:w-6 sm:h-6" variant="light" />
            </motion.div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <h1 className="text-base sm:text-lg font-bold text-white truncate">{getTabTitle()}</h1>
                <span className="text-xs font-medium text-pitch-green bg-pitch-green/10 px-2 py-0.5 rounded-full border border-pitch-green/20 flex-shrink-0">
                  Kickoff
                </span>
              </div>
              <p className="text-xs text-gray-400 truncate">{getTabSubtitle()}</p>
            </div>
          </div>

          {/* Right: Status indicators and quick actions */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {/* Unified Settings button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUnifiedSettings(true)}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-700/50 hover:bg-gray-600/50 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              title="Settings"
            >
              <Settings size={12} className="sm:size-3.5" />
            </motion.button>

            {/* Connection status */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                isOnline ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}
            >
              {isOnline ? <Wifi size={12} className="sm:size-3.5" /> : <WifiOff size={12} className="sm:size-3.5" />}
            </motion.div>

            {/* Quick stats toggle */}
            <motion.button
              onClick={() => setShowQuickStats(!showQuickStats)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-1 sm:space-x-2 bg-gray-700/50 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-white hover:bg-gray-600/50 transition-colors"
            >
              <Trophy size={12} className="sm:size-3.5 text-yellow-400" />
              <span className="font-medium">{quickStats.players}P</span>
              <ChevronDown
                size={10}
                className={`sm:size-3 transition-transform ${showQuickStats ? 'rotate-180' : ''}`}
              />
            </motion.button>
          </div>
        </div>

        {/* Tournament name editor */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="pb-2 sm:pb-3"
        >
          <input
            type="text"
            value={tournamentName}
            onChange={(e) => setTournamentName(e.target.value)}
            placeholder="Game day name..."
            className="w-full bg-transparent text-lg sm:text-xl font-bold text-white placeholder-gray-500 border-none outline-none focus:placeholder-gray-400 transition-colors"
            maxLength={50}
          />
        </motion.div>

        {/* Quick stats panel */}
        <AnimatePresence>
          {showQuickStats && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="pb-3 sm:pb-4"
            >
              <Card glass padding="sm">
                <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
                  <div>
                    <div className="flex items-center justify-center mb-0.5 sm:mb-1">
                      <Users size={12} className="sm:size-4 text-blue-400 mr-0.5 sm:mr-1" />
                      <span className="text-base sm:text-lg font-bold text-white">{quickStats.players}</span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-400">Players</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-center mb-0.5 sm:mb-1">
                      <Trophy size={12} className="sm:size-4 text-purple-400 mr-0.5 sm:mr-1" />
                      <span className="text-base sm:text-lg font-bold text-white">{quickStats.teams}</span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-400">Teams</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-center mb-0.5 sm:mb-1">
                      <Calendar size={12} className="sm:size-4 text-green-400 mr-0.5 sm:mr-1" />
                      <span className="text-base sm:text-lg font-bold text-white">{quickStats.matches}</span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-400">Completed</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-center mb-0.5 sm:mb-1">
                      <Clock size={12} className={`sm:size-4 mr-0.5 sm:mr-1 ${quickStats.inProgress > 0 ? 'text-red-400' : 'text-gray-400'}`} />
                      <span className={`text-base sm:text-lg font-bold ${quickStats.inProgress > 0 ? 'text-red-400' : 'text-white'}`}>
                        {quickStats.inProgress}
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-400">Live</p>
                  </div>
                </div>

                {/* Quick action buttons */}
                <div className="flex space-x-1 sm:space-x-2 mt-3 sm:mt-4">
                  {tabs.map((tab) => {
                    const accessibility = getTabAccessibility(tab);
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    if (accessibility.disabled) return null;

                    return (
                      <motion.button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`
                          flex-1 flex items-center justify-center space-x-1 sm:space-x-2 py-1.5 sm:py-2 px-2 sm:px-3 rounded-md text-[10px] sm:text-xs font-medium
                          transition-colors ${
                            isActive
                              ? 'bg-pitch-green text-white'
                              : 'bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-600/50'
                          }
                        `}
                      >
                        <Icon size={10} className="sm:size-3" />
                        <span className="hidden sm:inline">{tab.label}</span>
                        <span className="sm:hidden">{tab.label.slice(0, 3)}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Current match indicator */}
      {currentMatch && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/90 text-white py-1.5 sm:py-2 w-full"
        >
          <div className="w-full mx-auto px-3 sm:px-4 max-w-none sm:max-w-4xl sm:container">
            <div className="flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse" />
              <span className="font-medium">
                Match #{currentMatch.gameNumber} in progress
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Unified Settings Modal */}
      <UnifiedSettings
        isOpen={showUnifiedSettings}
        onClose={() => setShowUnifiedSettings(false)}
        onReset={resetApp}
      />
    </motion.header>
  );
};