import React from 'react';
import { motion } from 'framer-motion';
import { NavigationTab } from './Navigation';
import { useGameStore } from '../../store/gameStore';
import { useScrollDirection } from '../../hooks/useScrollDirection';

interface NavigationTabConfig {
  id: NavigationTab;
  label: string;
  icon: React.ComponentType<any>;
  component: React.ComponentType;
  requiresPlayers?: boolean;
  requiresTeams?: boolean;
  requiresMatches?: boolean;
}

interface TabBarProps {
  tabs: NavigationTabConfig[];
  activeTab: NavigationTab;
  onTabChange: (tabId: NavigationTab) => void;
  getTabAccessibility: (tab: NavigationTabConfig) => { disabled: boolean; reason?: string };
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTab,
  onTabChange,
  getTabAccessibility
}) => {
  const {
    players,
    teams,
    matches,
    currentMatch
  } = useGameStore();

  // Auto-hiding navigation based on scroll direction
  const { direction, isAtTop, isAtBottom } = useScrollDirection({
    threshold: 15,
    debounceMs: 50,
    idleTimeoutMs: 200
  });

  // Determine if navigation should be visible
  const shouldShowNavigation =
    direction === 'up' ||         // Scrolling up
    direction === 'idle' ||       // Not scrolling
    isAtTop ||                   // At top of page
    isAtBottom;                  // At bottom of page

  const getTabBadge = (tab: NavigationTabConfig) => {
    switch (tab.id) {
      case 'signup':
        const activePlayers = players.filter(p => !p.isWaitlist).length;
        const waitlistPlayers = players.filter(p => p.isWaitlist).length;
        return activePlayers > 0 ? activePlayers + (waitlistPlayers > 0 ? `+${waitlistPlayers}` : '') : null;

      case 'teams':
        return teams.length > 0 ? teams.length : null;

      case 'timer':
        return currentMatch ? '●' : null;

      case 'schedule':
        const scheduledMatches = matches.filter(m => m.status === 'scheduled').length;
        return scheduledMatches > 0 ? scheduledMatches : null;

      case 'scoreboard':
        const completedMatches = matches.filter(m => m.status === 'completed').length;
        return completedMatches > 0 ? completedMatches : null;

      default:
        return null;
    }
  };

  const getTabIndicatorColor = (tab: NavigationTabConfig) => {
    const accessibility = getTabAccessibility(tab);
    if (accessibility.disabled) return 'bg-gray-500';

    switch (tab.id) {
      case 'signup':
        return 'bg-blue-500';
      case 'teams':
        return 'bg-purple-500';
      case 'timer':
        return currentMatch ? 'bg-red-500' : 'bg-orange-500';
      case 'schedule':
        return 'bg-green-500';
      case 'scoreboard':
        return 'bg-yellow-500';
      default:
        return 'bg-pitch-green';
    }
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{
        y: shouldShowNavigation ? 0 : 100,
        opacity: shouldShowNavigation ? 1 : 0
      }}
      transition={{
        duration: 0.3,
        ease: "easeInOut"
      }}
      className="fixed bottom-0 left-0 right-0 z-40"
    >
      {/* Glass morphism background */}
      <div className="bg-surface-dark/80 backdrop-blur-lg border-t border-gray-600/30">
        <div className="flex items-center justify-around px-2 py-2">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const accessibility = getTabAccessibility(tab);
            const badge = getTabBadge(tab);
            const isActive = activeTab === tab.id;
            const indicatorColor = getTabIndicatorColor(tab);

            return (
              <motion.button
                key={tab.id}
                onClick={() => !accessibility.disabled && onTabChange(tab.id)}
                disabled={accessibility.disabled}
                className={`
                  mobile-touch-target relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200
                  ${isActive
                    ? 'bg-pitch-green/20 text-white'
                    : accessibility.disabled
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                  }
                  min-w-[60px] flex-1 min-h-[48px]
                `}
                whileTap={!accessibility.disabled ? { scale: 0.95 } : {}}
                whileHover={!accessibility.disabled ? { scale: 1.05 } : {}}
                layout
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute inset-0 bg-pitch-green/10 rounded-xl border border-pitch-green/30"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}

                {/* Icon with badge */}
                <div className="relative">
                  <Icon
                    size={22}
                    className={`
                      transition-colors duration-200
                      ${isActive ? 'text-pitch-green' : ''}
                    `}
                  />

                  {/* Badge */}
                  {badge && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`
                        absolute -top-2 -right-2 min-w-[18px] h-[18px] rounded-full
                        flex items-center justify-center text-[10px] font-bold text-white
                        ${indicatorColor}
                        ${typeof badge === 'string' && badge.includes('+') ? 'px-1' : ''}
                      `}
                    >
                      {badge}
                    </motion.div>
                  )}
                </div>

                {/* Label */}
                <span className={`
                  text-[10px] font-medium mt-1 transition-colors duration-200
                  ${isActive ? 'text-pitch-green' : ''}
                `}>
                  {tab.label}
                </span>

                {/* Disabled overlay with tooltip */}
                {accessibility.disabled && accessibility.reason && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="opacity-0 hover:opacity-100 transition-opacity duration-200 absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50">
                      {accessibility.reason}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Active tab indicator line */}
        <motion.div
          className="h-1 bg-gradient-to-r from-pitch-green/50 via-pitch-green to-pitch-green/50"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          style={{
            transformOrigin: `${(tabs.findIndex(t => t.id === activeTab) + 0.5) * (100 / tabs.length)}% center`
          }}
        />
      </div>

      {/* iPhone home indicator simulation */}
      <div className="bg-surface-dark/80 backdrop-blur-lg pb-safe">
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-32 h-1 bg-gray-600 rounded-full opacity-60"></div>
        </div>
      </div>
    </motion.div>
  );
};