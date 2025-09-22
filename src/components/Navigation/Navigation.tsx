import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Shuffle, Clock, Trophy, Calendar } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { PlayerSignup } from '../PlayerSignup';
import { TeamBuilder } from '../TeamBuilder';
import { GameTimer } from '../GameTimer';
import { MatchScheduler } from '../MatchScheduler';
import { Scoreboard } from '../Scoreboard';
import { TabBar } from './TabBar';
import { AppHeader } from './AppHeader';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import { useSwipeGestures } from '../../hooks/useSwipeGestures';

export type NavigationTab = 'signup' | 'teams' | 'timer' | 'schedule' | 'scoreboard';

interface NavigationTabConfig {
  id: NavigationTab;
  label: string;
  icon: React.ComponentType<any>;
  component: React.ComponentType;
  requiresPlayers?: boolean;
  requiresTeams?: boolean;
  requiresMatches?: boolean;
}

export const Navigation: React.FC = () => {
  const {
    players,
    teams,
    matches,
    currentMatch,
    calculateStandings
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<NavigationTab>('signup');
  const [previousTab, setPreviousTab] = useState<NavigationTab>('signup');
  const [lastManualNavigation, setLastManualNavigation] = useState<number>(0);
  const mainRef = useRef<HTMLElement>(null);

  // Pull-to-refresh functionality
  const { bindToElement } = usePullToRefresh({
    onRefresh: async () => {
      // Simulate data refresh with a small delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Recalculate standings and trigger any necessary updates
      calculateStandings();

      // You could add API calls here in a real implementation
      console.log('Data refreshed via pull-to-refresh');
    },
    enabled: true
  });

  // Swipe navigation functionality
  const { bindToElement: bindSwipeElement } = useSwipeGestures({
    onSwipeLeft: () => {
      // Navigate to next tab
      const currentIndex = tabs.findIndex(t => t.id === activeTab);
      const nextIndex = Math.min(currentIndex + 1, tabs.length - 1);
      const nextTab = tabs[nextIndex];

      if (nextTab && !getTabAccessibility(nextTab).disabled) {
        handleTabChange(nextTab.id);
      }
    },
    onSwipeRight: () => {
      // Navigate to previous tab
      const currentIndex = tabs.findIndex(t => t.id === activeTab);
      const prevIndex = Math.max(currentIndex - 1, 0);
      const prevTab = tabs[prevIndex];

      if (prevTab && !getTabAccessibility(prevTab).disabled) {
        handleTabChange(prevTab.id);
      }
    },
    threshold: 60,
    enabled: true
  });

  const tabs: NavigationTabConfig[] = [
    {
      id: 'signup',
      label: 'Players',
      icon: Users,
      component: PlayerSignup,
    },
    {
      id: 'teams',
      label: 'Teams',
      icon: Shuffle,
      component: TeamBuilder,
      requiresPlayers: true,
    },
    {
      id: 'timer',
      label: 'Timer',
      icon: Clock,
      component: GameTimer,
      requiresTeams: true,
    },
    {
      id: 'schedule',
      label: 'Schedule',
      icon: Calendar,
      component: MatchScheduler,
      requiresTeams: true,
    },
    {
      id: 'scoreboard',
      label: 'Results',
      icon: Trophy,
      component: Scoreboard,
      requiresMatches: true,
    },
  ];

  // Smart tab suggestion based on app state (respects manual navigation)
  useEffect(() => {
    const activePlayers = players.filter(p => !p.isWaitlist);
    const completedMatches = matches.filter(m => m.status === 'completed');
    const timeSinceManualNav = Date.now() - lastManualNavigation;

    // Don't auto-navigate if user manually navigated within the last 5 seconds
    if (timeSinceManualNav < 5000) {
      return;
    }

    // Auto-suggest next logical step with a small delay to prevent aggressive navigation
    const autoNavigateTimer = setTimeout(() => {
      if (activePlayers.length >= 4 && teams.length === 0 && activeTab === 'signup') {
        // Suggest moving to teams when enough players
        setActiveTab('teams');
      } else if (currentMatch && activeTab !== 'timer' && activeTab !== 'schedule') {
        // Suggest timer when there's an active match
        setActiveTab('timer');
      } else if (completedMatches.length > 0 && activeTab === 'timer') {
        // Suggest scoreboard after matches complete
        setActiveTab('scoreboard');
      }
    }, 1000);

    return () => clearTimeout(autoNavigateTimer);
  }, [players, teams, matches, currentMatch, activeTab, lastManualNavigation]);

  const handleTabChange = (tabId: NavigationTab) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;

    // Check requirements
    if (tab.requiresPlayers && players.filter(p => !p.isWaitlist).length < 2) {
      return;
    }
    if (tab.requiresTeams && teams.length < 2) {
      return;
    }
    if (tab.requiresMatches && matches.filter(m => m.status === 'completed').length === 0) {
      return;
    }

    // Track manual navigation to prevent auto-navigation interference
    setLastManualNavigation(Date.now());
    setPreviousTab(activeTab);
    setActiveTab(tabId);
  };

  const getTabAccessibility = (tab: NavigationTabConfig) => {
    const activePlayers = players.filter(p => !p.isWaitlist);
    const completedMatches = matches.filter(m => m.status === 'completed');

    if (tab.requiresPlayers && activePlayers.length < 2) {
      return {
        disabled: true,
        reason: `Need at least 2 players (${activePlayers.length}/2)`
      };
    }
    if (tab.requiresTeams && teams.length < 2) {
      return {
        disabled: true,
        reason: `Need at least 2 teams (${teams.length}/2)`
      };
    }
    if (tab.requiresMatches && completedMatches.length === 0) {
      return {
        disabled: true,
        reason: 'No completed matches yet'
      };
    }
    return { disabled: false };
  };


  const pageVariants = {
    initial: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95
    }),
    in: {
      x: 0,
      opacity: 1,
      scale: 1
    },
    out: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95
    })
  };

  const pageTransition = {
    type: "tween" as const,
    ease: "anticipate" as const,
    duration: 0.4
  };

  // Determine slide direction
  const currentIndex = tabs.findIndex(t => t.id === activeTab);
  const previousIndex = tabs.findIndex(t => t.id === previousTab);
  const direction = currentIndex > previousIndex ? 1 : -1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-dark via-gray-900 to-surface-elevated">
      {/* App Header */}
      <div className="pt-safe w-full">
        <AppHeader
          activeTab={activeTab}
          onTabChange={handleTabChange}
          tabs={tabs}
          getTabAccessibility={getTabAccessibility}
        />
      </div>

      {/* Main Content */}
      <main
        ref={(el) => {
          mainRef.current = el;
          bindToElement(el);
          bindSwipeElement(el);
        }}
        className="pb-20 pt-2 sm:pt-4 overflow-auto swipe-area w-full mobile-page-scroll"
      >
        <div className="w-full mx-auto px-3 sm:px-4 max-w-none sm:max-w-4xl sm:container">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeTab}
              custom={direction}
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
              transition={pageTransition}
              className="min-h-[calc(100vh-8rem)] gpu-accelerated w-full"
            >
              {activeTab === 'signup' && <PlayerSignup />}
              {activeTab === 'teams' && <TeamBuilder />}
              {activeTab === 'timer' && <GameTimer />}
              {activeTab === 'schedule' && <MatchScheduler />}
              {activeTab === 'scoreboard' && <Scoreboard />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom Navigation */}
      <TabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        getTabAccessibility={getTabAccessibility}
      />

      {/* Global Status Indicator */}
      {currentMatch && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed top-4 right-4 z-50"
        >
          <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
            Match #{currentMatch.gameNumber} Live
          </div>
        </motion.div>
      )}
    </div>
  );
};