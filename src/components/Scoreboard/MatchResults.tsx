import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Target, Clock, Calendar } from 'lucide-react';
import { Match, Team } from '../../types';
import { getTeamDisplayName } from '../../utils/helpers';
import { Card } from '../shared/Card';

interface MatchResultsProps {
  matches: Match[];
  teams: Team[];
}

export const MatchResults: React.FC<MatchResultsProps> = ({
  matches,
  teams
}) => {
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

  const getMatchResult = (match: Match) => {
    if (match.scoreA > match.scoreB) return 'team-a-win';
    if (match.scoreB > match.scoreA) return 'team-b-win';
    return 'draw';
  };

  const formatMatchTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMatchDate = (date: Date) => {
    const today = new Date();
    const matchDate = new Date(date);

    if (matchDate.toDateString() === today.toDateString()) {
      return 'Today';
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (matchDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    return matchDate.toLocaleDateString([], {
      month: 'short',
      day: 'numeric'
    });
  };

  const sortedMatches = [...matches].sort((a, b) => {
    const aTime = a.endTime ? new Date(a.endTime).getTime() : 0;
    const bTime = b.endTime ? new Date(b.endTime).getTime() : 0;
    return bTime - aTime; // Most recent first
  });

  if (matches.length === 0) {
    return (
      <Card glass padding="lg">
        <div className="text-center py-8">
          <Target size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No results yet</h3>
          <p className="text-gray-400">Complete some matches to see results here</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results Header */}
      <Card glass padding="md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Target size={20} className="text-green-400" />
            <h3 className="font-semibold text-white">Match Results</h3>
          </div>
          <div className="text-sm text-gray-400">
            {matches.length} match{matches.length !== 1 ? 'es' : ''} completed
          </div>
        </div>
      </Card>

      {/* Results List */}
      <div className="space-y-3">
        <AnimatePresence>
          {sortedMatches.map((match, index) => {
            const teamA = teams.find(t => t.id === match.teamAId);
            const teamB = teams.find(t => t.id === match.teamBId);

            if (!teamA || !teamB) return null;

            const result = getMatchResult(match);
            const isHighScoring = (match.scoreA + match.scoreB) >= 5;
            const isDraw = match.scoreA === match.scoreB;

            return (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                layout
              >
                <Card
                  glass
                  padding="lg"
                  className={`transition-all duration-200 hover:bg-gray-700/30 ${
                    isHighScoring ? 'border-l-4 border-orange-400' : ''
                  } ${
                    isDraw ? 'border-l-4 border-yellow-400' : ''
                  }`}
                >
                  <div className="space-y-4">
                    {/* Match Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-pitch-green/20 border border-pitch-green/30 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-pitch-green">
                            {match.gameNumber}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-white">Game {match.gameNumber}</h4>
                          <div className="flex items-center space-x-2 text-xs text-gray-400">
                            {match.endTime && (
                              <>
                                <Calendar size={12} />
                                <span>{formatMatchDate(match.endTime)}</span>
                                <Clock size={12} />
                                <span>{formatMatchTime(match.endTime)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Result Badge */}
                      <div className="flex items-center space-x-2">
                        {isHighScoring && (
                          <div className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full text-xs font-medium">
                            HIGH SCORING
                          </div>
                        )}
                        {isDraw && (
                          <div className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs font-medium">
                            DRAW
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Teams and Score */}
                    <div className="grid grid-cols-5 gap-4 items-center">
                      {/* Team A */}
                      <div className="col-span-2">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTeamColorClass(teamA)}`}>
                            <span className="font-bold text-sm">{teamA.name.charAt(0)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium truncate ${
                              result === 'team-a-win' ? 'text-green-400' : 'text-white'
                            }`}>
                              {getTeamDisplayName(teamA)}
                            </div>
                            <div className="text-xs text-gray-400">
                              Avg {teamA.averageSkill}
                            </div>
                          </div>
                          {result === 'team-a-win' && (
                            <Trophy size={16} className="text-yellow-400" />
                          )}
                        </div>
                      </div>

                      {/* Score */}
                      <div className="col-span-1 text-center">
                        <div className="text-2xl font-bold text-white">
                          <span className={result === 'team-a-win' ? 'text-green-400' : ''}>
                            {match.scoreA}
                          </span>
                          <span className="text-gray-400 mx-1">-</span>
                          <span className={result === 'team-b-win' ? 'text-green-400' : ''}>
                            {match.scoreB}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Final
                        </div>
                      </div>

                      {/* Team B */}
                      <div className="col-span-2">
                        <div className="flex items-center space-x-3 justify-end">
                          {result === 'team-b-win' && (
                            <Trophy size={16} className="text-yellow-400" />
                          )}
                          <div className="flex-1 min-w-0 text-right">
                            <div className={`font-medium truncate ${
                              result === 'team-b-win' ? 'text-green-400' : 'text-white'
                            }`}>
                              {getTeamDisplayName(teamB)}
                            </div>
                            <div className="text-xs text-gray-400">
                              Avg {teamB.averageSkill}
                            </div>
                          </div>
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTeamColorClass(teamB)}`}>
                            <span className="font-bold text-sm">{teamB.name.charAt(0)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Match Details */}
                    <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-600">
                      <div className="flex items-center space-x-4">
                        <span className="text-gray-400">
                          Duration: {match.duration} minutes
                        </span>
                        {match.startTime && match.endTime && (
                          <span className="text-gray-400">
                            Played: {Math.round((new Date(match.endTime).getTime() - new Date(match.startTime).getTime()) / 60000)} min
                          </span>
                        )}
                      </div>

                      <div className="text-gray-400">
                        Total Goals: {match.scoreA + match.scoreB}
                      </div>
                    </div>

                    {/* Goal Difference Impact */}
                    {Math.abs(match.scoreA - match.scoreB) >= 3 && (
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
                        <div className="text-center">
                          <span className="text-blue-400 text-xs font-medium">
                            {Math.abs(match.scoreA - match.scoreB)} goal difference - Dominant performance!
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Results Summary */}
      <Card glass padding="lg" className="border-t-2 border-green-400/30">
        <div className="text-center space-y-3">
          <h4 className="font-semibold text-white">Results Summary</h4>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">
                {matches.reduce((sum, m) => sum + m.scoreA + m.scoreB, 0)}
              </div>
              <div className="text-gray-400">Total Goals</div>
            </div>

            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">
                {(matches.reduce((sum, m) => sum + m.scoreA + m.scoreB, 0) / matches.length).toFixed(1)}
              </div>
              <div className="text-gray-400">Goals/Match</div>
            </div>

            <div className="text-center">
              <div className="text-lg font-bold text-yellow-400">
                {matches.filter(m => m.scoreA === m.scoreB).length}
              </div>
              <div className="text-gray-400">Draws</div>
            </div>

            <div className="text-center">
              <div className="text-lg font-bold text-orange-400">
                {Math.max(...matches.map(m => m.scoreA + m.scoreB))}
              </div>
              <div className="text-gray-400">Highest Total</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};