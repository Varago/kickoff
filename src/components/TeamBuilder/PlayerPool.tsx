import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droppable } from 'react-beautiful-dnd';
import { Users, UserPlus, ArrowRight } from 'lucide-react';
import { Player, Team } from '../../types';
import { getSkillLevelLabel } from '../../utils/helpers';
import { Card } from '../shared/Card';
import { useHaptic } from '../../hooks/useHaptic';
import { PlayerDragItem } from './PlayerDragItem';

interface PlayerPoolProps {
  players: Player[];
  teams: Team[];
  onMovePlayer: (playerId: string, fromTeamId: string | null, toTeamId: string | null) => void;
}

export const PlayerPool: React.FC<PlayerPoolProps> = ({
  players,
  teams,
  onMovePlayer
}) => {
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [draggedOver, setDraggedOver] = useState(false);
  const haptic = useHaptic();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(true);
  };

  const handleDragLeave = () => {
    setDraggedOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(false);

    const playerId = e.dataTransfer.getData('playerId');
    const fromTeamId = e.dataTransfer.getData('fromTeamId');

    if (playerId && fromTeamId) {
      onMovePlayer(playerId, fromTeamId, null);
      haptic.success();
    }
  };

  const togglePlayerSelection = (playerId: string) => {
    const newSelected = new Set(selectedPlayers);
    if (newSelected.has(playerId)) {
      newSelected.delete(playerId);
    } else {
      newSelected.add(playerId);
    }
    setSelectedPlayers(newSelected);
    haptic.light();
  };

  const assignSelectedToTeam = (teamId: string) => {
    selectedPlayers.forEach(playerId => {
      onMovePlayer(playerId, null, teamId);
    });
    setSelectedPlayers(new Set());
    haptic.success();
  };

  const clearSelection = () => {
    setSelectedPlayers(new Set());
  };

  return (
    <Card glass padding="lg">
      <div
        className={`transition-all duration-200 ${
          draggedOver ? 'ring-2 ring-blue-500 ring-opacity-50 bg-blue-500/5 rounded-lg p-2 -m-2' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <UserPlus className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-white">Available Players</h3>
              <p className="text-sm text-gray-400">
                {players.filter(p => !p.isWaitlist).length} unassigned, {players.filter(p => p.isWaitlist).length} waitlist
              </p>
            </div>
          </div>

          {selectedPlayers.size > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">
                {selectedPlayers.size} selected
              </span>
              <button
                onClick={clearSelection}
                className="text-gray-400 hover:text-white text-sm px-2 py-1 rounded hover:bg-gray-600 transition-colors"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Quick Assign Buttons */}
        {selectedPlayers.size > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-400">
                Assign {selectedPlayers.size} player{selectedPlayers.size !== 1 ? 's' : ''} to:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {teams.map(team => (
                <button
                  key={team.id}
                  onClick={() => assignSelectedToTeam(team.id)}
                  className="flex items-center space-x-2 px-3 py-2 bg-surface-elevated rounded-lg text-white hover:bg-gray-600 transition-colors text-sm"
                >
                  <div className={`w-3 h-3 rounded-full ${
                    team.color === 'black' ? 'bg-gray-800' :
                    team.color === 'white' ? 'bg-gray-200' :
                    team.color === 'orange' ? 'bg-orange-500' :
                    team.color === 'blue' ? 'bg-blue-500' :
                    team.color === 'yellow' ? 'bg-yellow-500' :
                    'bg-gradient-to-r from-green-400 to-blue-500'
                  }`} />
                  <span>{team.name}</span>
                  <ArrowRight size={12} />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Players with Drag & Drop */}
        <Droppable droppableId="unassigned">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`min-h-[100px] p-3 rounded-lg transition-all duration-200 ${
                snapshot.isDraggingOver
                  ? 'bg-blue-500/10 border-2 border-dashed border-blue-500/50'
                  : 'border-2 border-transparent'
              }`}
            >
              {players.length > 0 ? (
                <div className="space-y-3">
                  <AnimatePresence>
                    {players.map((player, index) => (
                      <div key={player.id} className="relative">
                        <PlayerDragItem
                          player={player}
                          index={index}
                          isCaptain={false}
                          showCaptainControls={false}
                          isCompact={false}
                        />
                        {player.isWaitlist && (
                          <div className="absolute top-1 right-1 bg-orange-500/90 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                            Waitlist
                          </div>
                        )}
                      </div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-center py-8 rounded-lg transition-all ${
                    snapshot.isDraggingOver
                      ? 'bg-blue-500/5 border border-blue-500/30 text-blue-400'
                      : 'text-gray-400'
                  }`}
                >
                  <Users size={32} className="mx-auto mb-2" />
                  <p>
                    {snapshot.isDraggingOver
                      ? 'Drop player here to unassign'
                      : 'All players have been assigned to teams'
                    }
                  </p>
                </motion.div>
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
      </div>
    </Card>
  );
};

interface PoolPlayerProps {
  player: Player;
  isSelected: boolean;
  onToggleSelect: () => void;
  onMoveToTeam: (playerId: string, fromTeamId: string | null, toTeamId: string | null) => void;
  index: number;
  teams: Team[];
}

const PoolPlayer: React.FC<PoolPlayerProps> = ({
  player,
  isSelected,
  onToggleSelect,
  onMoveToTeam,
  index,
  teams
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('playerId', player.id);
    e.dataTransfer.setData('fromTeamId', '');
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const skillColors = {
    1: 'bg-orange-500',
    2: 'bg-yellow-500',
    3: 'bg-blue-500',
    4: 'bg-green-500'
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={onToggleSelect}
      className={`
        relative group bg-surface-elevated rounded-lg p-3 cursor-move transition-all
        hover:bg-gray-700 border-2 hover:border-gray-500
        ${isDragging ? 'opacity-50 scale-95' : ''}
        ${isSelected
          ? 'border-pitch-green bg-pitch-green/10'
          : 'border-gray-600'
        }
      `}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ delay: index * 0.05 }}
        layout
      >
      <div className="space-y-2">
        {/* Player Info */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-pitch-green/20 border border-pitch-green/30 rounded-full flex items-center justify-center">
            <span className="text-xs font-semibold text-pitch-green">
              {player.signupOrder + 1}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-white truncate text-sm">
                {player.name}
              </span>
              {isSelected && (
                <div className="w-2 h-2 bg-pitch-green rounded-full" />
              )}
            </div>
          </div>
        </div>

        {/* Skill Level */}
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${skillColors[player.skillLevel as keyof typeof skillColors]}`} />
          <span className="text-xs text-gray-400">
            {getSkillLevelLabel(player.skillLevel)}
          </span>

          {/* Skill Circles */}
          <div className="flex space-x-1 ml-auto">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${
                  i < player.skillLevel ? 'bg-pitch-green' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Quick Assign on Hover */}
        <div className="absolute inset-x-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-surface-dark rounded border border-gray-600 p-2">
            <div className="text-xs text-gray-400 mb-1">Assign to:</div>
            <div className="flex flex-wrap gap-1">
              {teams.map(team => (
                <button
                  key={team.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveToTeam(player.id, null, team.id);
                  }}
                  className="flex items-center space-x-1 px-2 py-1 bg-gray-600 rounded text-xs text-white hover:bg-gray-500 transition-colors"
                  title={`Assign to ${team.name}`}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    team.color === 'black' ? 'bg-gray-800' :
                    team.color === 'white' ? 'bg-gray-200' :
                    team.color === 'orange' ? 'bg-orange-500' :
                    team.color === 'blue' ? 'bg-blue-500' :
                    team.color === 'yellow' ? 'bg-yellow-500' :
                    'bg-gradient-to-r from-green-400 to-blue-500'
                  }`} />
                  <span>{team.name.slice(0, 4)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      </motion.div>
    </div>
  );
};