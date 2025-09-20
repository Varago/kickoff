import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Trophy, Users, Timer, Plus, Minus, Play, ArrowLeftRight } from 'lucide-react';
import { Match, Team } from '../../types';
import { getTeamDisplayName, getMatchStatusColor } from '../../utils/helpers';
import { Card } from '../shared/Card';
import { useHaptic } from '../../hooks/useHaptic';
import { useGameStore } from '../../store/gameStore';
import { TeamSwapModal } from './TeamSwapModal';

interface MatchCardProps {
  match: Match;
  teams: Team[];
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  teams
}) => {
  const haptic = useHaptic();
  const { updateScore, swapTeamsInMatch } = useGameStore();
  const [showSwapModal, setShowSwapModal] = useState(false);

  const teamA = teams.find(t => t.id === match.teamAId);
  const teamB = teams.find(t => t.id === match.teamBId);

  if (!teamA || !teamB) {
    return null;
  }

  const handleScoreChange = (team: 'A' | 'B', delta: number) => {
    const currentScoreA = match.scoreA;
    const currentScoreB = match.scoreB;

    let newScoreA = currentScoreA;
    let newScoreB = currentScoreB;

    if (team === 'A') {
      newScoreA = Math.max(0, currentScoreA + delta);
    } else {
      newScoreB = Math.max(0, currentScoreB + delta);
    }

    updateScore(match.id, newScoreA, newScoreB);
    haptic.light();
  };

  const handleSwapTeams = (matchId: string, newTeamAId: string, newTeamBId: string) => {
    swapTeamsInMatch(matchId, newTeamAId, newTeamBId);
    haptic.success();
  };

  const getStatusIcon = () => {
    switch (match.status) {
      case 'scheduled':
        return <Clock size={16} className="text-gray-400" />;
      case 'in-progress':
        return <Play size={16} className="text-yellow-400" />;
      case 'completed':
        return <CheckCircle size={16} className="text-green-400" />;
      default:
        return <Clock size={16} className="text-gray-400" />;
    }
  };

  const getStatusLabel = () => {
    switch (match.status) {
      case 'scheduled':
        return 'Scheduled';
      case 'in-progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  const getWinner = () => {
    if (match.status !== 'completed') return null;
    if (match.scoreA > match.scoreB) return teamA;
    if (match.scoreB > match.scoreA) return teamB;
    return null; // Draw
  };

  const winner = getWinner();
  const isDraw = match.status === 'completed' && match.scoreA === match.scoreB;

  const getTeamColorClass = (team: Team) => {
    const colorMap = {
      black: 'bg-gray-800 text-white',
      white: 'bg-gray-200 text-black',
      orange: 'bg-orange-500 text-white',
      blue: 'bg-blue-500 text-white',
      yellow: 'bg-yellow-500 text-black',
      'no-pennies': 'bg-gradient-to-r from-green-400 to-blue-500 text-white'
    };
    return colorMap[team.color] || 'bg-gray-500 text-white';
  };

  return (
    <Card
      glass
      padding="md"
      className={`sm:p-6 transition-all duration-200`}
    >
      <div className="space-y-3 sm:space-y-4">
        {/* Match Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-pitch-green/20 border border-pitch-green/30 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-pitch-green">
                {match.gameNumber}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-white">Game {match.gameNumber}</h3>
              <div className="flex items-center space-x-2 text-sm">
                {getStatusIcon()}
                <span className={`font-medium ${getMatchStatusColor(match)}`}>
                  {getStatusLabel()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Team Swap Button */}
            <motion.button
              onClick={() => setShowSwapModal(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-8 h-8 bg-gray-600 hover:bg-gray-500 rounded-full flex items-center justify-center text-gray-300 hover:text-white transition-all"
              title="Swap teams"
            >
              <ArrowLeftRight size={14} />
            </motion.button>

            {/* Match Duration */}
            <div className="text-right">
              <div className="flex items-center space-x-1 text-gray-400">
                <Timer size={14} />
                <span className="text-sm">{match.duration}min</span>
              </div>
              {match.status === 'completed' && match.startTime && match.endTime && (
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(match.endTime).getTime() - new Date(match.startTime).getTime() > 0
                    ? `${Math.round((new Date(match.endTime).getTime() - new Date(match.startTime).getTime()) / 60000)}min played`
                    : 'Duration unknown'
                  }
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Teams and Score - Responsive Layout */}

        {/* Mobile Layout: Compact One Line */}
        <div className="block sm:hidden">
          <div className="flex items-center justify-between space-x-2 text-sm">
            {/* Team A */}
            <div className="flex items-center space-x-1 flex-1 min-w-0">
              <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${getTeamColorClass(teamA)}`}>
                <span className="font-bold text-xs">{teamA.name.charAt(0)}</span>
              </div>
              <div className="flex items-center space-x-1 min-w-0">
                <span className={`font-medium text-xs truncate ${
                  winner && winner.id === teamA.id ? 'text-green-400' : 'text-white'
                }`}>
                  {getTeamDisplayName(teamA)}
                </span>
                {winner && winner.id === teamA.id && (
                  <Trophy size={10} className="text-yellow-400 flex-shrink-0" />
                )}
              </div>
            </div>

            {/* Team A Score Controls */}
            <div className="flex items-center space-x-1">
              <motion.button
                onClick={() => handleScoreChange('A', -1)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-6 h-6 bg-gray-600 hover:bg-gray-500 rounded-full flex items-center justify-center text-gray-300 hover:text-white"
                title="Decrease Team A score"
              >
                <Minus size={10} />
              </motion.button>
              <span className={`text-lg font-bold min-w-[1.5rem] text-center ${
                winner && winner.id === teamA.id ? 'text-green-400' : 'text-white'
              }`}>
                {match.scoreA}
              </span>
              <motion.button
                onClick={() => handleScoreChange('A', 1)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-6 h-6 bg-gray-600 hover:bg-gray-500 rounded-full flex items-center justify-center text-gray-300 hover:text-white"
                title="Increase Team A score"
              >
                <Plus size={10} />
              </motion.button>
            </div>

            {/* VS/Score Divider */}
            <div className="flex items-center justify-center px-2">
              <span className="text-xs text-gray-400 font-medium">
                {match.status === 'scheduled' ? 'vs' : '-'}
              </span>
              {isDraw && match.status === 'completed' && (
                <span className="text-xs text-yellow-400 font-medium ml-1">DRAW</span>
              )}
            </div>

            {/* Team B Score Controls */}
            <div className="flex items-center space-x-1">
              <motion.button
                onClick={() => handleScoreChange('B', -1)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-6 h-6 bg-gray-600 hover:bg-gray-500 rounded-full flex items-center justify-center text-gray-300 hover:text-white"
                title="Decrease Team B score"
              >
                <Minus size={10} />
              </motion.button>
              <span className={`text-lg font-bold min-w-[1.5rem] text-center ${
                winner && winner.id === teamB.id ? 'text-green-400' : 'text-white'
              }`}>
                {match.scoreB}
              </span>
              <motion.button
                onClick={() => handleScoreChange('B', 1)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-6 h-6 bg-gray-600 hover:bg-gray-500 rounded-full flex items-center justify-center text-gray-300 hover:text-white"
                title="Increase Team B score"
              >
                <Plus size={10} />
              </motion.button>
            </div>

            {/* Team B */}
            <div className="flex items-center space-x-1 flex-1 min-w-0 justify-end">
              <div className="flex items-center space-x-1 min-w-0">
                {winner && winner.id === teamB.id && (
                  <Trophy size={10} className="text-yellow-400 flex-shrink-0" />
                )}
                <span className={`font-medium text-xs truncate ${
                  winner && winner.id === teamB.id ? 'text-green-400' : 'text-white'
                }`}>
                  {getTeamDisplayName(teamB)}
                </span>
              </div>
              <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${getTeamColorClass(teamB)}`}>
                <span className="font-bold text-xs">{teamB.name.charAt(0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout: Grid */}
        <div className="hidden sm:grid grid-cols-3 gap-4 items-center">
          {/* Team A */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTeamColorClass(teamA)}`}>
                <span className="font-bold text-sm">{teamA.name.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className={`font-medium truncate ${
                    winner && winner.id === teamA.id ? 'text-green-400' : 'text-white'
                  }`}>
                    {getTeamDisplayName(teamA)}
                  </h4>
                  {winner && winner.id === teamA.id && (
                    <Trophy size={14} className="text-yellow-400" />
                  )}
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <Users size={10} />
                  <span>{teamA.players.length} players</span>
                  <span>•</span>
                  <span>Avg {teamA.averageSkill}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Score */}
          <div className="text-center relative group">
            <div className="text-3xl font-bold text-white mb-1">
              <span className={winner && winner.id === teamA.id ? 'text-green-400' : ''}>
                {match.scoreA}
              </span>
              <span className="text-gray-400 mx-2">-</span>
              <span className={winner && winner.id === teamB.id ? 'text-green-400' : ''}>
                {match.scoreB}
              </span>
            </div>

            {/* Inline Score Controls */}
            <div className="flex items-center justify-center space-x-2 mt-2">
              <div className="flex items-center space-x-1">
                <motion.button
                  onClick={() => handleScoreChange('A', -1)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-6 h-6 bg-gray-600 hover:bg-gray-500 rounded-full flex items-center justify-center text-gray-300 hover:text-white"
                  title="Decrease Team A score"
                >
                  <Minus size={12} />
                </motion.button>
                <motion.button
                  onClick={() => handleScoreChange('A', 1)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-6 h-6 bg-gray-600 hover:bg-gray-500 rounded-full flex items-center justify-center text-gray-300 hover:text-white"
                  title="Increase Team A score"
                >
                  <Plus size={12} />
                </motion.button>
              </div>
              <span className="text-gray-400 text-sm">Score</span>
              <div className="flex items-center space-x-1">
                <motion.button
                  onClick={() => handleScoreChange('B', -1)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-6 h-6 bg-gray-600 hover:bg-gray-500 rounded-full flex items-center justify-center text-gray-300 hover:text-white"
                  title="Decrease Team B score"
                >
                  <Minus size={12} />
                </motion.button>
                <motion.button
                  onClick={() => handleScoreChange('B', 1)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-6 h-6 bg-gray-600 hover:bg-gray-500 rounded-full flex items-center justify-center text-gray-300 hover:text-white"
                  title="Increase Team B score"
                >
                  <Plus size={12} />
                </motion.button>
              </div>
            </div>
            {isDraw && match.status === 'completed' && (
              <div className="text-xs text-yellow-400 font-medium">DRAW</div>
            )}
            {match.status === 'scheduled' && (
              <div className="text-xs text-gray-400">vs</div>
            )}
          </div>

          {/* Team B */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3 justify-end">
              <div className="flex-1 min-w-0 text-right">
                <div className="flex items-center space-x-2 justify-end">
                  {winner && winner.id === teamB.id && (
                    <Trophy size={14} className="text-yellow-400" />
                  )}
                  <h4 className={`font-medium truncate ${
                    winner && winner.id === teamB.id ? 'text-green-400' : 'text-white'
                  }`}>
                    {getTeamDisplayName(teamB)}
                  </h4>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-400 justify-end">
                  <span>Avg {teamB.averageSkill}</span>
                  <span>•</span>
                  <span>{teamB.players.length} players</span>
                  <Users size={10} />
                </div>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTeamColorClass(teamB)}`}>
                <span className="font-bold text-sm">{teamB.name.charAt(0)}</span>
              </div>
            </div>
          </div>
        </div>


        {/* Completed Match Info */}
        {match.status === 'completed' && (
          <div className="pt-2 border-t border-gray-600">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <CheckCircle size={14} className="text-green-400" />
                <span>Match completed</span>
              </div>
              {match.endTime && (
                <div>
                  Finished {new Date(match.endTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Team Swap Modal */}
      <TeamSwapModal
        match={match}
        teams={teams}
        onSwapTeams={handleSwapTeams}
        onClose={() => setShowSwapModal(false)}
        isOpen={showSwapModal}
      />

    </Card>
  );
};