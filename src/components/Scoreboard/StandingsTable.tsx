import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Award, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Standing, Team } from '../../types';
import { getTeamDisplayName, calculateWinPercentage } from '../../utils/helpers';
import { Card } from '../shared/Card';

interface StandingsTableProps {
  standings: Standing[];
  teams: Team[];
  onSelectTeam: (teamId: string | null) => void;
  selectedTeamId: string | null;
}

export const StandingsTable: React.FC<StandingsTableProps> = ({
  standings,
  teams,
  onSelectTeam,
  selectedTeamId
}) => {
  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy size={16} className="text-yellow-400" />;
      case 2:
        return <Medal size={16} className="text-gray-300" />;
      case 3:
        return <Award size={16} className="text-orange-400" />;
      default:
        return <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-xs text-white font-bold">{position}</div>;
    }
  };

  const getPositionChange = (teamId: string, currentPosition: number) => {
    // This would typically compare with previous standings
    // For now, we'll show neutral for all teams
    return 'neutral';
  };

  const getPositionChangeIcon = (change: string) => {
    switch (change) {
      case 'up':
        return <TrendingUp size={12} className="text-green-400" />;
      case 'down':
        return <TrendingDown size={12} className="text-red-400" />;
      default:
        return <Minus size={12} className="text-gray-400" />;
    }
  };

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

  if (standings.length === 0) {
    return (
      <Card glass padding="lg">
        <div className="text-center py-8">
          <Trophy size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No standings available</h3>
          <p className="text-gray-400">Complete some matches to see team standings</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table Header */}
      <Card glass padding="md">
        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-300">
          <div className="col-span-1 text-center">Pos</div>
          <div className="col-span-4">Team</div>
          <div className="col-span-1 text-center">P</div>
          <div className="col-span-1 text-center">W</div>
          <div className="col-span-1 text-center">D</div>
          <div className="col-span-1 text-center">L</div>
          <div className="col-span-1 text-center">GD</div>
          <div className="col-span-1 text-center">Win%</div>
          <div className="col-span-1 text-center">Pts</div>
        </div>
      </Card>

      {/* Standings Rows */}
      <div className="space-y-2">
        <AnimatePresence>
          {standings.map((standing, index) => {
            const team = teams.find(t => t.id === standing.teamId);
            if (!team) return null;

            const position = index + 1;
            const winPercentage = calculateWinPercentage(standing);
            const isSelected = selectedTeamId === standing.teamId;
            const positionChange = getPositionChange(standing.teamId, position);

            return (
              <motion.div
                key={standing.teamId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                layout
              >
                <Card
                  glass
                  padding="md"
                  className={`cursor-pointer transition-all duration-200 hover:bg-gray-700/50 ${
                    isSelected ? 'ring-2 ring-pitch-green ring-opacity-50 bg-pitch-green/5' : ''
                  } ${
                    position === 1 ? 'border-l-4 border-yellow-400' :
                    position === 2 ? 'border-l-4 border-gray-300' :
                    position === 3 ? 'border-l-4 border-orange-400' : ''
                  }`}
                  onClick={() => onSelectTeam(isSelected ? null : standing.teamId)}
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Position */}
                    <div className="col-span-1 flex items-center justify-center space-x-1">
                      {getPositionIcon(position)}
                      {getPositionChangeIcon(positionChange)}
                    </div>

                    {/* Team */}
                    <div className="col-span-4 flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getTeamColorClass(team)}`}>
                        <span className="font-bold text-sm">{team.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate">
                          {getTeamDisplayName(team)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {team.players.length} players • Avg {team.averageSkill}
                        </div>
                      </div>
                    </div>

                    {/* Played */}
                    <div className="col-span-1 text-center">
                      <div className="font-medium text-white">{standing.played}</div>
                    </div>

                    {/* Won */}
                    <div className="col-span-1 text-center">
                      <div className="font-medium text-green-400">{standing.won}</div>
                    </div>

                    {/* Drawn */}
                    <div className="col-span-1 text-center">
                      <div className="font-medium text-yellow-400">{standing.drawn}</div>
                    </div>

                    {/* Lost */}
                    <div className="col-span-1 text-center">
                      <div className="font-medium text-red-400">{standing.lost}</div>
                    </div>

                    {/* Goal Difference */}
                    <div className="col-span-1 text-center">
                      <div className={`font-medium ${
                        standing.goalDifference > 0 ? 'text-green-400' :
                        standing.goalDifference < 0 ? 'text-red-400' : 'text-gray-400'
                      }`}>
                        {standing.goalDifference > 0 ? '+' : ''}{standing.goalDifference}
                      </div>
                    </div>

                    {/* Win Percentage */}
                    <div className="col-span-1 text-center">
                      <div className="font-medium text-blue-400">{winPercentage}%</div>
                    </div>

                    {/* Points */}
                    <div className="col-span-1 text-center">
                      <div className="font-bold text-white text-lg">{standing.points}</div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 pt-4 border-t border-gray-600"
                      >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-400">{standing.goalsFor}</div>
                            <div className="text-gray-400">Goals For</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-red-400">{standing.goalsAgainst}</div>
                            <div className="text-gray-400">Goals Against</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-400">
                              {standing.played > 0 ? (standing.goalsFor / standing.played).toFixed(1) : '0.0'}
                            </div>
                            <div className="text-gray-400">Goals/Game</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-orange-400">
                              {standing.played > 0 ? (standing.points / standing.played).toFixed(1) : '0.0'}
                            </div>
                            <div className="text-gray-400">Points/Game</div>
                          </div>
                        </div>

                        {/* Team Captains */}
                        {team.captainIds && team.captainIds.length > 0 && (
                          <div className="mt-3 text-center">
                            <div className="text-xs text-gray-400">
                              {team.captainIds.length === 1 ? 'Captain' : 'Captains'}: {
                                team.captainIds
                                  .map(captainId => team.players.find(p => p.id === captainId)?.name)
                                  .filter(Boolean)
                                  .join(', ') || 'Unknown'
                              }
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Standings Legend */}
      <Card glass padding="md">
        <div className="text-center space-y-2">
          <h4 className="font-medium text-white">Standings Guide</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-400">
            <div>P = Played</div>
            <div>W = Won</div>
            <div>D = Drawn</div>
            <div>L = Lost</div>
            <div>GD = Goal Difference</div>
            <div>Win% = Win Percentage</div>
            <div>Pts = Points</div>
            <div>Click team for details</div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Teams ranked by: Points → Goal Difference → Goals For
          </div>
        </div>
      </Card>
    </div>
  );
};