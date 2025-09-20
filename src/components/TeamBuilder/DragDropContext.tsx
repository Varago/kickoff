import React from 'react';
import { DragDropContext, DropResult, DragStart } from 'react-beautiful-dnd';
import { Player, Team } from '../../types';
import { useGameStore } from '../../store/gameStore';
import { useSounds } from '../../hooks/useSoundSystem';
import { useHaptic } from '../../hooks/useHaptic';

interface DragDropWrapperProps {
  children: React.ReactNode;
  teams: Team[];
  unassignedPlayers: Player[];
}

export const DragDropWrapper: React.FC<DragDropWrapperProps> = ({
  children,
  teams,
  unassignedPlayers
}) => {
  const { movePlayer } = useGameStore();
  const { sounds } = useSounds();
  const haptic = useHaptic();

  const onDragStart = (start: DragStart) => {
    // Haptic feedback when drag starts
    haptic.light();
    sounds.buttonClick();
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If dropped outside a valid drop zone
    if (!destination) {
      haptic.warning();
      return;
    }

    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Extract player ID from draggableId
    const playerId = draggableId.replace('player-', '');

    // Determine source and destination team IDs
    const sourceTeamId = source.droppableId === 'unassigned' ? null : source.droppableId.replace('team-', '');
    const destTeamId = destination.droppableId === 'unassigned' ? null : destination.droppableId.replace('team-', '');

    // Execute the move
    try {
      movePlayer(playerId, sourceTeamId, destTeamId);

      // Success feedback
      haptic.success();
      sounds.playerAdded();

      // Special sound for moving to unassigned (removing from team)
      if (destTeamId === null) {
        sounds.buttonClick();
      }
    } catch (error) {
      console.error('Failed to move player:', error);
      haptic.warning();
      sounds.error();
    }
  };

  return (
    <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
      {children}
    </DragDropContext>
  );
};