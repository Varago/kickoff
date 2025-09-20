import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droppable } from 'react-beautiful-dnd';
import { Crown, Users, BarChart3, Plus, Edit3, Check, X, Palette } from 'lucide-react';
import { Team, TEAM_COLOR_OPTIONS, TeamColor } from '../../types';
import { getTeamColorClass } from '../../utils/helpers';
import { Card } from '../shared/Card';
import { useHaptic } from '../../hooks/useHaptic';
import { PlayerDragItem } from './PlayerDragItem';
import { ColorPicker } from '../shared/ColorPicker';

interface TeamCardProps {
  team: Team;
  teams: Team[];
  onMovePlayer: (playerId: string, fromTeamId: string | null, toTeamId: string | null) => void;
  onSetCaptain: (playerId: string) => void;
  onUpdateTeamColor: (teamId: string, color: TeamColor) => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  teams,
  onMovePlayer,
  onSetCaptain,
  onUpdateTeamColor
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(team.name);
  const [draggedOver, setDraggedOver] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const haptic = useHaptic();

  const captains = team.players.filter(p => (team.captainIds || []).includes(p.id));
  const teamColorClass = getTeamColorClass(team);

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
    const fromTeamId = e.dataTransfer.getData('fromTeamId') || null;

    if (playerId && fromTeamId !== team.id) {
      onMovePlayer(playerId, fromTeamId, team.id);
      haptic.success();
    }
  };


  const handleToggleCaptain = (playerId: string) => {
    onSetCaptain(playerId);
    haptic.success();
  };

  const handleSaveName = () => {
    // In a real app, you'd update the team name in the store
    setIsEditingName(false);
    haptic.success();
  };

  const handleCancelEdit = () => {
    setEditedName(team.name);
    setIsEditingName(false);
  };

  const handleColorChange = (color: TeamColor) => {
    onUpdateTeamColor(team.id, color);
    haptic.success();
  };

  // Get available colors (all colors except ones used by other teams)
  const getAvailableColors = (): TeamColor[] => {
    const usedColors = teams.filter(t => t.id !== team.id).map(t => t.color);
    return TEAM_COLOR_OPTIONS.filter(color => !usedColors.includes(color));
  };

  return (
    <Card glass padding="lg" className="h-full">
      <div
        className={`transition-all duration-200 ${
          draggedOver ? 'ring-2 ring-pitch-green ring-opacity-50 bg-pitch-green/5 rounded-lg p-2 -m-2' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
      <div className="space-y-3 sm:space-y-4">
        {/* Team Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <motion.div
              className={`w-8 h-8 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center ${teamColorClass} cursor-pointer hover:shadow-lg transition-all relative group`}
              onClick={() => setShowColorPicker(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Change team color"
            >
              <Users size={14} className="sm:size-5" />
              <div className="absolute inset-0 bg-black/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Palette size={10} className="sm:size-3.5 text-white" />
              </div>
            </motion.div>

            <div className="flex-1">
              {isEditingName ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="bg-surface-dark border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-pitch-green"
                    autoFocus
                    onKeyPress={(e) => e.key === 'Enter' && handleSaveName()}
                  />
                  <button
                    onClick={handleSaveName}
                    className="text-green-400 hover:text-green-300 p-1"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <h3 className="font-semibold text-white text-sm sm:text-base truncate">{team.name}</h3>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-gray-400 hover:text-white p-1 flex-shrink-0"
                  >
                    <Edit3 size={10} className="sm:size-3" />
                  </button>
                </div>
              )}

              <div className="flex items-center space-x-2 sm:space-x-3 mt-1">
                <div className="flex items-center space-x-1 text-gray-400 text-xs">
                  <Users size={8} className="sm:size-2.5" />
                  <span>{team.players.length}</span>
                </div>
                <div className="flex items-center space-x-1 text-gray-400 text-xs">
                  <BarChart3 size={8} className="sm:size-2.5" />
                  <span>{team.averageSkill.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Captains - Moved to top */}
        {captains.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3"
          >
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-yellow-400">
                <Crown size={16} />
                <span className="font-medium">
                  {captains.length === 1 ? 'Captain' : 'Captains'}:
                </span>
              </div>
              <div className="space-y-1">
                {captains.map((captain, index) => (
                  <div key={captain.id} className="flex items-center justify-between">
                    <span className="text-yellow-400 text-sm">{captain.name}</span>
                    <span className="text-xs text-yellow-400/70">
                      Skill: {captain.skillLevel}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Team Players */}
        <Droppable droppableId={`team-${team.id}`}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`space-y-1 sm:space-y-2 min-h-[120px] sm:min-h-[200px] p-1 sm:p-2 rounded-lg transition-all duration-200 ${
                snapshot.isDraggingOver
                  ? 'bg-pitch-green/10 border-2 border-dashed border-pitch-green/50'
                  : 'border-2 border-transparent'
              }`}
            >
              <AnimatePresence>
                {team.players.map((player, index) => (
                  <PlayerDragItem
                    key={player.id}
                    player={player}
                    index={index}
                    isCaptain={(team.captainIds || []).includes(player.id)}
                    showCaptainControls={true}
                    onToggleCaptain={() => handleToggleCaptain(player.id)}
                    isCompact={false}
                  />
                ))}
              </AnimatePresence>

              {provided.placeholder}

              {/* Empty Slots Indicator */}
              {team.players.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-all ${
                    snapshot.isDraggingOver
                      ? 'border-pitch-green/70 bg-pitch-green/5 text-pitch-green'
                      : 'border-gray-600 text-gray-500'
                  }`}
                >
                  <Plus size={24} className="mb-1" />
                  <span className="text-xs font-medium">
                    {snapshot.isDraggingOver ? 'Drop player here' : 'Drag players here'}
                  </span>
                </motion.div>
              )}

              {/* Additional slots visual indicator */}
              {team.players.length > 0 && team.players.length < 5 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`h-12 border-2 border-dashed rounded-lg flex items-center justify-center transition-all ${
                    snapshot.isDraggingOver
                      ? 'border-pitch-green/50 bg-pitch-green/5'
                      : 'border-gray-600'
                  }`}
                >
                  <Plus size={16} className={snapshot.isDraggingOver ? 'text-pitch-green' : 'text-gray-500'} />
                </motion.div>
              )}
            </div>
          )}
        </Droppable>
      </div>
      </div>

      {/* Color Picker Modal */}
      <ColorPicker
        currentColor={team.color}
        availableColors={getAvailableColors()}
        onColorSelect={handleColorChange}
        onClose={() => setShowColorPicker(false)}
        isOpen={showColorPicker}
      />

    </Card>
  );
};

