import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Target, Shield, TrendingUp } from 'lucide-react';
import { Standing, Team, Match } from '../../types';
import { getTeamDisplayName, calculateWinPercentage } from '../../utils/helpers';
import { Card } from '../shared/Card';

interface TeamStatsProps {
  standings: Standing[];
  teams: Team[];
  matches: Match[];
  tournamentStats: {
    totalGoals: number;
    totalMatches: number;
    averageGoalsPerMatch: string;
    highestScore: number;
    mostGoalsTeam: Standing | null;
    bestDefense: Standing | null;
  };
}

export const TeamStats: React.FC<TeamStatsProps> = ({
  standings,
  teams,
  matches,
  tournamentStats
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'attack' | 'defense' | 'efficiency' | 'overview'>('overview');

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

  // Calculate additional statistics
  const enhancedStats = standings.map(standing => {
    const team = teams.find(t => t.id === standing.teamId);
    if (!team) return null;

    const teamMatches = matches.filter(m =>
      m.teamAId === standing.teamId || m.teamBId === standing.teamId
    );

    const wins = teamMatches.filter(m => {
      if (m.teamAId === standing.teamId) return m.scoreA > m.scoreB;
      return m.scoreB > m.scoreA;
    });

    const bigWins = wins.filter(m => {
      const diff = m.teamAId === standing.teamId ?
        m.scoreA - m.scoreB : m.scoreB - m.scoreA;
      return diff >= 3;
    });

    const cleanSheets = teamMatches.filter(m => {
      return m.teamAId === standing.teamId ? m.scoreB === 0 : m.scoreA === 0;
    });

    return {
      ...standing,
      team,
      winPercentage: calculateWinPercentage(standing),
      goalEfficiency: standing.played > 0 ? (standing.goalsFor / standing.played).toFixed(1) : '0.0',
      defenseRating: standing.played > 0 ? (standing.goalsAgainst / standing.played).toFixed(1) : '0.0',
      pointsPerGame: standing.played > 0 ? (standing.points / standing.played).toFixed(1) : '0.0',
      bigWins: bigWins.length,
      cleanSheets: cleanSheets.length,
      averageSkill: team.averageSkill
    };
  }).filter(Boolean);

  const getTopTeams = (category: string, count: number = 3) => {
    let sorted = [...enhancedStats];

    switch (category) {
      case 'attack':
        sorted.sort((a, b) => b!.goalsFor - a!.goalsFor);
        break;
      case 'defense':
        sorted.sort((a, b) => a!.goalsAgainst - b!.goalsAgainst);
        break;
      case 'efficiency':
        sorted.sort((a, b) => parseFloat(b!.pointsPerGame) - parseFloat(a!.pointsPerGame));
        break;
      case 'goalEfficiency':
        sorted.sort((a, b) => parseFloat(b!.goalEfficiency) - parseFloat(a!.goalEfficiency));
        break;
      case 'winPercentage':
        sorted.sort((a, b) => b!.winPercentage - a!.winPercentage);
        break;
      default:
        sorted.sort((a, b) => b!.points - a!.points);
    }

    return sorted.slice(0, count);
  };

  if (standings.length === 0) {
    return (
      <Card glass padding="lg">
        <div className="text-center py-8">
          <BarChart3 size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No statistics available</h3>
          <p className="text-gray-400">Complete some matches to see detailed team statistics</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Selector */}
      <Card glass padding="md">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'overview', label: 'Overview', icon: BarChart3 },
            { key: 'attack', label: 'Attack', icon: Target },
            { key: 'defense', label: 'Defense', icon: Shield },
            { key: 'efficiency', label: 'Efficiency', icon: TrendingUp }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key as any)}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg transition-all
                ${selectedCategory === key
                  ? 'bg-pitch-green text-white shadow-lg'
                  : 'bg-surface-elevated text-gray-400 hover:text-white hover:bg-gray-600'
                }
              `}
            >
              <Icon size={16} />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Stats Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCategory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {selectedCategory === 'overview' && (
            <div className="space-y-6">
              {/* Tournament Leaders */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Top Scorer */}
                <Card glass padding="lg" className="border-t-4 border-green-400">
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                      <Target size={20} className="text-green-400" />
                    </div>
                    <h4 className="font-semibold text-white">Top Scorer</h4>
                    {tournamentStats.mostGoalsTeam && (
                      <div>
                        <div className="text-2xl font-bold text-green-400">
                          {tournamentStats.mostGoalsTeam.goalsFor}
                        </div>
                        <div className="text-sm text-gray-400">
                          {teams.find(t => t.id === tournamentStats.mostGoalsTeam?.teamId)?.name}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Best Defense */}
                <Card glass padding="lg" className="border-t-4 border-blue-400">
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                      <Shield size={20} className="text-blue-400" />
                    </div>
                    <h4 className="font-semibold text-white">Best Defense</h4>
                    {tournamentStats.bestDefense && (
                      <div>
                        <div className="text-2xl font-bold text-blue-400">
                          {tournamentStats.bestDefense.goalsAgainst}
                        </div>
                        <div className="text-sm text-gray-400">
                          {teams.find(t => t.id === tournamentStats.bestDefense?.teamId)?.name}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Most Efficient */}
                <Card glass padding="lg" className="border-t-4 border-yellow-400">
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto">
                      <TrendingUp size={20} className="text-yellow-400" />
                    </div>
                    <h4 className="font-semibold text-white">Most Efficient</h4>
                    {getTopTeams('efficiency', 1)[0] && (
                      <div>
                        <div className="text-2xl font-bold text-yellow-400">
                          {getTopTeams('efficiency', 1)[0]!.pointsPerGame}
                        </div>
                        <div className="text-sm text-gray-400">
                          {getTopTeams('efficiency', 1)[0]!.team!.name} (pts/game)
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Complete Team Overview */}
              <Card glass padding="lg">
                <h4 className="font-semibold text-white mb-4 flex items-center">
                  <BarChart3 className="mr-2" size={20} />
                  Complete Team Statistics
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-600">
                        <th className="text-left py-2 text-gray-300">Team</th>
                        <th className="text-center py-2 text-gray-300">GF</th>
                        <th className="text-center py-2 text-gray-300">GA</th>
                        <th className="text-center py-2 text-gray-300">Win%</th>
                        <th className="text-center py-2 text-gray-300">PPG</th>
                        <th className="text-center py-2 text-gray-300">CS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enhancedStats.map((stat, index) => (
                        <tr key={stat!.teamId} className="border-b border-gray-700">
                          <td className="py-3">
                            <div className="flex items-center space-x-3">
                              <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${getTeamColorClass(stat!.team!)}`}>
                                {stat!.team!.name.charAt(0)}
                              </div>
                              <span className="text-white">{getTeamDisplayName(stat!.team!)}</span>
                            </div>
                          </td>
                          <td className="text-center py-3 text-green-400 font-medium">{stat!.goalsFor}</td>
                          <td className="text-center py-3 text-red-400 font-medium">{stat!.goalsAgainst}</td>
                          <td className="text-center py-3 text-blue-400 font-medium">{stat!.winPercentage}%</td>
                          <td className="text-center py-3 text-yellow-400 font-medium">{stat!.pointsPerGame}</td>
                          <td className="text-center py-3 text-gray-300 font-medium">{stat!.cleanSheets}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 text-xs text-gray-400 grid grid-cols-3 md:grid-cols-6 gap-2">
                  <div>GF = Goals For</div>
                  <div>GA = Goals Against</div>
                  <div>Win% = Win Percentage</div>
                  <div>PPG = Points Per Game</div>
                  <div>CS = Clean Sheets</div>
                </div>
              </Card>
            </div>
          )}

          {selectedCategory === 'attack' && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <Target className="mr-2" size={24} />
                Attacking Statistics
              </h3>

              {getTopTeams('attack', 5).map((stat, index) => (
                <Card key={stat!.teamId} glass padding="lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getTeamColorClass(stat!.team!)}`}>
                        <span className="font-bold">{stat!.team!.name.charAt(0)}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{getTeamDisplayName(stat!.team!)}</h4>
                        <div className="text-sm text-gray-400">
                          {stat!.goalEfficiency} goals/game • {stat!.bigWins} big wins
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-400">{stat!.goalsFor}</div>
                      <div className="text-sm text-gray-400">Total Goals</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                        style={{
                          width: `${(stat!.goalsFor / Math.max(...enhancedStats.map(s => s!.goalsFor))) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {selectedCategory === 'defense' && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <Shield className="mr-2" size={24} />
                Defensive Statistics
              </h3>

              {getTopTeams('defense', 5).map((stat, index) => (
                <Card key={stat!.teamId} glass padding="lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getTeamColorClass(stat!.team!)}`}>
                        <span className="font-bold">{stat!.team!.name.charAt(0)}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{getTeamDisplayName(stat!.team!)}</h4>
                        <div className="text-sm text-gray-400">
                          {stat!.defenseRating} goals/game conceded • {stat!.cleanSheets} clean sheets
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-400">{stat!.goalsAgainst}</div>
                      <div className="text-sm text-gray-400">Goals Against</div>
                    </div>
                  </div>

                  {/* Progress Bar (inverted for defense - lower is better) */}
                  <div className="mt-4">
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                        style={{
                          width: `${100 - (stat!.goalsAgainst / Math.max(...enhancedStats.map(s => s!.goalsAgainst), 1)) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {selectedCategory === 'efficiency' && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <TrendingUp className="mr-2" size={24} />
                Efficiency Statistics
              </h3>

              {getTopTeams('efficiency', 5).map((stat, index) => (
                <Card key={stat!.teamId} glass padding="lg">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTeamColorClass(stat!.team!)}`}>
                        <span className="font-bold text-sm">{stat!.team!.name.charAt(0)}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{getTeamDisplayName(stat!.team!)}</h4>
                        <div className="text-xs text-gray-400">Team Avg: {stat!.averageSkill}</div>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-lg font-bold text-yellow-400">{stat!.pointsPerGame}</div>
                      <div className="text-xs text-gray-400">Points/Game</div>
                    </div>

                    <div className="text-center">
                      <div className="text-lg font-bold text-green-400">{stat!.goalEfficiency}</div>
                      <div className="text-xs text-gray-400">Goals/Game</div>
                    </div>

                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-400">{stat!.winPercentage}%</div>
                      <div className="text-xs text-gray-400">Win Rate</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};