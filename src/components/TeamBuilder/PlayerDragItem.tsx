import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { motion } from 'framer-motion';
import { Crown, GripVertical } from 'lucide-react';
import { Player } from '../../types';
import { SKILL_LEVELS } from '../../types';

interface PlayerDragItemProps {
  player: Player;
  index: number;
  isCaptain: boolean;
  showCaptainControls?: boolean;
  onToggleCaptain?: () => void;
  isCompact?: boolean;
}

export const PlayerDragItem: React.FC<PlayerDragItemProps> = ({
  player,
  index,
  isCaptain,
  showCaptainControls = false,
  onToggleCaptain,
  isCompact = false
}) => {
  const skillInfo = SKILL_LEVELS.find(s => s.value === player.skillLevel);

  return (
    <Draggable draggableId={`player-${player.id}`} index={index}>
      {(provided, snapshot) => (
        <motion.div
          ref={provided.innerRef}
          {...provided.draggableProps}
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          whileHover={{ scale: 1.02 }}
          className={`
            group relative bg-surface-elevated rounded-lg border transition-all duration-200
            ${snapshot.isDragging
              ? 'border-pitch-green shadow-lg shadow-pitch-green/25 bg-surface-dark scale-105 rotate-2'
              : 'border-white/10 hover:border-white/20'
            }
            ${isCompact ? 'p-2' : 'p-4'}
          `}
        >
          <div className={`flex items-center ${isCompact ? 'space-x-2' : 'space-x-3'}`}>
            {/* Drag Handle */}
            <div
              {...provided.dragHandleProps}
              className={`
                text-gray-400 hover:text-white transition-colors cursor-grab active:cursor-grabbing
                ${snapshot.isDragging ? 'text-pitch-green' : ''}
              `}
            >
              <GripVertical size={isCompact ? 16 : 18} />
            </div>

            {/* Player Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h4 className={`font-medium text-white ${isCompact ? 'text-xs' : 'text-sm'}`} title={player.name}>
                  {isCompact ? player.name.split(' ')[0] : player.name}
                </h4>

                {/* Captain Badge */}
                {isCaptain && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center space-x-1"
                  >
                    <Crown size={14} className="text-yellow-400" />
                    <span className="text-xs text-yellow-400 font-medium">C</span>
                  </motion.div>
                )}

                {/* Waitlist Indicator */}
                {player.isWaitlist && (
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                    Waitlist
                  </span>
                )}
              </div>

              {/* Skill Level */}
              {!isCompact && (
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: 4 }, (_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${
                          i < player.skillLevel ? 'bg-pitch-green' : 'bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">
                    {skillInfo?.label || `Level ${player.skillLevel}`}
                  </span>
                  {/* Signup Order */}
                  <span className="text-xs text-gray-500 opacity-60">
                    #{player.signupOrder + 1}
                  </span>
                </div>
              )}
              {isCompact && (
                <div className="flex items-center space-x-1 mt-0.5">
                  <div className="flex items-center space-x-0.5">
                    {Array.from({ length: 4 }, (_, i) => (
                      <div
                        key={i}
                        className={`w-1 h-1 rounded-full ${
                          i < player.skillLevel ? 'bg-pitch-green' : 'bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    #{player.signupOrder + 1}
                  </span>
                </div>
              )}
            </div>

            {/* Captain Toggle */}
            {showCaptainControls && onToggleCaptain && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onToggleCaptain}
                className={`
                  p-2 rounded-lg transition-all
                  ${isCaptain
                    ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                    : 'bg-gray-600/20 text-gray-400 hover:bg-gray-600/30 hover:text-white'
                  }
                `}
                title={isCaptain ? 'Remove captain' : 'Make captain'}
              >
                <Crown size={16} />
              </motion.button>
            )}
          </div>

          {/* Drag Overlay */}
          {snapshot.isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-gradient-to-r from-pitch-green/20 to-green-400/20 rounded-lg pointer-events-none"
            />
          )}

          {/* Glow Effect When Dragging */}
          {snapshot.isDragging && (
            <div className="absolute -inset-1 bg-gradient-to-r from-pitch-green/50 to-green-400/50 rounded-lg blur opacity-75 -z-10" />
          )}
        </motion.div>
      )}
    </Draggable>
  );
};