import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Clock, Crown, Edit } from 'lucide-react';
import { Player } from '../../types';
import { getSkillLevelLabel } from '../../utils/helpers';
import { Card } from '../shared/Card';
import { PlayerEditModal } from '../shared/PlayerEditModal';

interface PlayerCardProps {
  player: Player;
  onRemove: () => void;
  index?: number;
  isRecentlyAdded?: boolean;
  isRecent?: boolean;
  isCaptain?: boolean;
  onToggleCaptain?: () => void;
  showCaptainControls?: boolean;
  isWaitlist?: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  onRemove,
  index,
  isRecentlyAdded = false,
  isRecent = false,
  isCaptain = false,
  onToggleCaptain,
  showCaptainControls = false,
  isWaitlist = false
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const skillColors = {
    1: 'bg-orange-500',
    2: 'bg-yellow-500',
    3: 'bg-blue-500',
    4: 'bg-green-500'
  };

  // Memoized time calculation that updates intelligently
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  const timeDisplay = useMemo(() => {
    const createdDate = new Date(player.createdAt);
    const diffMs = currentTime - createdDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }, [currentTime, player.createdAt]);

  // Update time display intelligently based on age
  useEffect(() => {
    const createdDate = new Date(player.createdAt);
    const diffMs = Date.now() - createdDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    let updateInterval: number;

    if (diffMins < 1) {
      // Update every 10 seconds for "Just now"
      updateInterval = 10000;
    } else if (diffMins < 60) {
      // Update every minute for "X minutes ago"
      updateInterval = 60000;
    } else if (diffMins < 1440) { // 24 hours
      // Update every hour for "X hours ago"
      updateInterval = 3600000;
    } else {
      // No updates needed for "X days ago"
      return;
    }

    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, updateInterval);

    return () => clearInterval(timer);
  }, [player.createdAt]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: (index || 0) * 0.05 }}
      layout
    >
      <Card
        glass
        padding="md"
        className={`group ${isRecentlyAdded ? 'ring-2 ring-pitch-green ring-opacity-50 bg-pitch-green/5' : ''}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {/* Player Order Badge */}
            <div className="w-8 h-8 bg-pitch-green/20 border border-pitch-green/30 rounded-full flex items-center justify-center">
              <span className="text-xs font-semibold text-pitch-green">
                {player.signupOrder + 1}
              </span>
            </div>

            {/* Player Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-white truncate">
                  {player.name}
                </h3>
                {isCaptain && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-medium"
                  >
                    <Crown size={10} className="mr-1" />
                    Captain
                  </motion.span>
                )}
                {player.isWaitlist && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                    <Clock size={10} className="mr-1" />
                    Waitlist
                  </span>
                )}
                {isRecentlyAdded && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-pitch-green/20 text-pitch-green border border-pitch-green/30 font-medium"
                  >
                    NEW
                  </motion.span>
                )}
              </div>

              <div className="flex items-center space-x-3 mt-1">
                {/* Skill Level */}
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${skillColors[player.skillLevel as keyof typeof skillColors]}`} />
                  <span className="text-xs text-gray-400">
                    {getSkillLevelLabel(player.skillLevel)}
                  </span>
                </div>

                {/* Skill Circles */}
                <div className="flex space-x-1">
                  {Array.from({ length: 4 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < player.skillLevel
                          ? 'bg-pitch-green'
                          : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>

                {/* Signup Time */}
                <span className="text-xs text-gray-500">
                  {timeDisplay}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1">
            {/* Edit Button */}
            <motion.button
              onClick={() => setShowEditModal(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg"
              title="Edit player"
            >
              <Edit size={16} />
            </motion.button>

            {/* Captain Toggle Button */}
            {showCaptainControls && onToggleCaptain && (
              <motion.button
                onClick={onToggleCaptain}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`opacity-0 group-hover:opacity-100 transition-all duration-200 p-2 rounded-lg ${
                  isCaptain
                    ? 'text-yellow-400 bg-yellow-500/10 opacity-100'
                    : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10'
                }`}
                title={isCaptain ? 'Remove captain' : 'Make captain'}
              >
                <Crown size={16} />
              </motion.button>
            )}

            {/* Remove Button */}
            <motion.button
              onClick={onRemove}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
            >
              <Trash2 size={16} />
            </motion.button>
          </div>
        </div>

        {/* Swipe to delete hint on mobile */}
        <div className="md:hidden absolute inset-y-0 right-0 flex items-center pr-4 opacity-0 group-hover:opacity-30 transition-opacity">
          <div className="text-xs text-gray-500">Swipe to delete</div>
        </div>
      </Card>

      {/* Player Edit Modal */}
      <PlayerEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        player={player}
      />
    </motion.div>
  );
};