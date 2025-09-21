import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import {
  Player,
  Team,
  Match,
  GameSettings,
  Standing,
  GameState,
  TeamColor,
  DEFAULT_SETTINGS,
  SCORING_SYSTEM
} from '../types';

interface GameStore extends GameState {
  // App state
  lastResetDate: string;

  // Player actions
  addPlayer: (name: string, skillLevel: number, isWaitlist?: boolean) => void;
  removePlayer: (playerId: string) => void;
  toggleWaitlist: (playerId: string) => void;

  // Team actions
  generateTeams: () => void;
  movePlayer: (playerId: string, fromTeamId: string | null, toTeamId: string | null) => void;
  setCaptain: (teamId: string, playerId: string) => void;
  togglePlayerCaptain: (playerId: string) => void;
  updateTeamColor: (teamId: string, color: TeamColor) => void;
  resetTeams: () => void;

  // Match actions
  generateSchedule: () => void;
  addMatch: (teamAId: string, teamBId: string) => void;
  updateScore: (matchId: string, scoreA: number, scoreB: number) => void;
  swapTeamsInMatch: (matchId: string, newTeamAId: string, newTeamBId: string) => void;

  // Timer actions
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  updateTimer: () => void;

  // Settings actions
  updateSettings: (settings: Partial<GameSettings>) => void;

  // Standings actions
  calculateStandings: () => void;

  // Utility actions
  resetAll: () => void;
  resetAllSafe: () => { success: boolean; reason?: string };
  resetApp: () => void;
  checkDailyAutoReset: () => boolean;
  exportData: () => string;
  setTournamentName: (name: string) => void;
  importData: (data: string) => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
}

const TEAM_NAMES = ['Black', 'White', 'Orange', 'Blue', 'Yellow', 'No Pennies'];
const AVAILABLE_COLORS: TeamColor[] = ['black', 'white', 'orange', 'blue', 'yellow', 'no-pennies'];

const calculateAverageSkill = (players: Player[]): number => {
  if (players.length === 0) return 0;
  const total = players.reduce((sum, player) => sum + player.skillLevel, 0);
  return Number((total / players.length).toFixed(1));
};

const calculateStandingsFromMatches = (matches: Match[], teams: Team[]): Standing[] => {
  const standings: Record<string, Standing> = {};

  // Initialize standings
  teams.forEach(team => {
    standings[team.id] = {
      teamId: team.id,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0
    };
  });

  // Calculate from completed matches
  matches.filter(match => match.status === 'completed').forEach(match => {
    const teamA = standings[match.teamAId];
    const teamB = standings[match.teamBId];

    if (teamA && teamB) {
      teamA.played++;
      teamB.played++;
      teamA.goalsFor += match.scoreA;
      teamA.goalsAgainst += match.scoreB;
      teamB.goalsFor += match.scoreB;
      teamB.goalsAgainst += match.scoreA;

      if (match.scoreA > match.scoreB) {
        teamA.won++;
        teamA.points += SCORING_SYSTEM.WIN_POINTS;
        teamB.lost++;
        teamB.points += SCORING_SYSTEM.LOSS_POINTS;
      } else if (match.scoreA < match.scoreB) {
        teamB.won++;
        teamB.points += SCORING_SYSTEM.WIN_POINTS;
        teamA.lost++;
        teamA.points += SCORING_SYSTEM.LOSS_POINTS;
      } else {
        teamA.drawn++;
        teamB.drawn++;
        teamA.points += SCORING_SYSTEM.DRAW_POINTS;
        teamB.points += SCORING_SYSTEM.DRAW_POINTS;
      }

      teamA.goalDifference = teamA.goalsFor - teamA.goalsAgainst;
      teamB.goalDifference = teamB.goalsFor - teamB.goalsAgainst;
    }
  });

  // Convert to array and sort by points, then goal difference, then goals for
  return Object.values(standings).sort((a, b) => {
    if (a.points !== b.points) return b.points - a.points;
    if (a.goalDifference !== b.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });
};

const getCurrentDateString = (): string => {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Initial state
      players: [],
      teams: [],
      matches: [],
      settings: DEFAULT_SETTINGS,
      currentMatchId: null,
      currentMatch: null,
      standings: [],
      tournamentName: 'Pickup Games',
      lastResetDate: getCurrentDateString(),
      timerState: {
        timeRemaining: DEFAULT_SETTINGS.matchDuration * 60, // Convert to seconds
        isRunning: false,
        isPaused: false
      },

      // Player actions
      addPlayer: (name: string, skillLevel: number, isWaitlist: boolean = false) => {
        const state = get();
        const newPlayer: Player = {
          id: uuidv4(),
          name: name.trim(),
          skillLevel,
          isWaitlist,
          signupOrder: state.players.length,
          createdAt: new Date()
        };

        set({ players: [...state.players, newPlayer] });
      },

      removePlayer: (playerId: string) => {
        const state = get();
        set({
          players: state.players.filter(p => p.id !== playerId),
          teams: state.teams.map(team => {
            const updatedTeam = {
              ...team,
              players: team.players.filter(p => p.id !== playerId),
              captainIds: (team.captainIds || []).filter(id => id !== playerId)
            };

            // Ensure team has at least one captain if it has players
            if (updatedTeam.players.length > 0 && updatedTeam.captainIds.length === 0) {
              const newCaptain = updatedTeam.players.reduce((highest, player) =>
                player.skillLevel > highest.skillLevel ? player : highest
              );
              updatedTeam.captainIds = [newCaptain.id];
            }

            return {
              ...updatedTeam,
              averageSkill: calculateAverageSkill(updatedTeam.players)
            };
          })
        });
      },

      toggleWaitlist: (playerId: string) => {
        const state = get();
        set({
          players: state.players.map(p =>
            p.id === playerId ? { ...p, isWaitlist: !p.isWaitlist } : p
          )
        });
      },

      // Team actions
      generateTeams: () => {
        const state = get();
        const activePlayers = state.players.filter(p => !p.isWaitlist);
        const teamCount = state.settings.teamsCount;
        const playersPerTeam = state.settings.playersPerTeam;

        // Handle edge case - no players
        if (activePlayers.length === 0) {
          console.warn('No active players available for team generation');
          return;
        }

        // Sort players by skill level (highest first) for snake draft
        const sortedPlayers = [...activePlayers].sort((a, b) => b.skillLevel - a.skillLevel);

        // Initialize teams
        const teams: Team[] = Array.from({ length: teamCount }, (_, i) => ({
          id: `team-${i}`,
          name: TEAM_NAMES[i] || AVAILABLE_COLORS[i] || `Team ${i + 1}`,
          color: AVAILABLE_COLORS[i] || 'no-pennies',
          players: [],
          captainIds: [],
          averageSkill: 0
        }));

        // Use all available players - distribute them across teams
        // If there are more players than ideal slots, extras will go to waitlist later
        // If there are fewer players than ideal slots, teams will have fewer players
        const playersToAssign = sortedPlayers;
        const playersToWaitlist: Player[] = [];

        // Calculate flexible distribution
        const maxPlayersToDistribute = teamCount * playersPerTeam;
        let playersAssigned: Player[] = [];
        let playersForWaitlist: Player[] = [];

        if (playersToAssign.length <= maxPlayersToDistribute) {
          // We can fit all players in teams (may result in partial teams)
          playersAssigned = playersToAssign;
        } else {
          // Too many players - take the best ones and move rest to waitlist
          playersAssigned = playersToAssign.slice(0, maxPlayersToDistribute);
          playersForWaitlist = playersToAssign.slice(maxPlayersToDistribute);
        }

        // Snake draft distribution for balanced teams
        let teamIndex = 0;
        let direction = 1;

        playersAssigned.forEach((player) => {
          teams[teamIndex].players.push(player);

          // Change direction at the ends (snake pattern)
          if ((direction === 1 && teamIndex === teamCount - 1) ||
              (direction === -1 && teamIndex === 0)) {
            direction *= -1;
          } else {
            teamIndex += direction;
          }
        });

        // Calculate average skills and set captains (highest skill player on each team)
        teams.forEach(team => {
          team.averageSkill = calculateAverageSkill(team.players);
          if (team.players.length > 0) {
            // First check if any player is pre-designated as captain
            const designatedCaptain = team.players.find(player => player.isCaptain);
            const captain = designatedCaptain || team.players.reduce((highest, player) =>
              player.skillLevel > highest.skillLevel ? player : highest
            );
            team.captainIds = [captain.id];
          }
        });

        // Update player states - move excess players to waitlist
        const updatedPlayers = state.players.map(player => {
          if (playersForWaitlist.some(p => p.id === player.id)) {
            return { ...player, isWaitlist: true };
          }
          return player;
        });

        set({ teams, players: updatedPlayers });

        // Log the team generation results
        console.log(`Generated ${teamCount} teams:`);
        console.log(`- Assigned ${playersAssigned.length} players to teams`);
        if (playersForWaitlist.length > 0) {
          console.log(`- Moved ${playersForWaitlist.length} players to waitlist`);
        }
        const partialTeams = teams.filter(team => team.players.length < playersPerTeam).length;
        if (partialTeams > 0) {
          console.log(`- ${partialTeams} team(s) are partially filled`);
        }
      },

      movePlayer: (playerId: string, fromTeamId: string | null, toTeamId: string | null) => {
        const state = get();
        const player = state.players.find(p => p.id === playerId);
        if (!player) return;

        // Handle moving to/from waitlist (toTeamId === null means moving to waitlist)
        const updatedPlayers = state.players.map(p => {
          if (p.id === playerId) {
            return { ...p, isWaitlist: toTeamId === null };
          }
          return p;
        });

        const updatedTeams = state.teams.map(team => {
          // Remove player from any existing team (enforce one team per player)
          const hasPlayer = team.players.some(p => p.id === playerId);
          if (hasPlayer && team.id !== toTeamId) {
            const updatedTeam = {
              ...team,
              players: team.players.filter(p => p.id !== playerId),
              // Remove captain status if this player was captain
              captainIds: (team.captainIds || []).filter(id => id !== playerId)
            };

            // Auto-assign new captain if team still has players but no captains
            if (updatedTeam.players.length > 0 && updatedTeam.captainIds.length === 0) {
              const newCaptain = updatedTeam.players.reduce((highest, player) =>
                player.skillLevel > highest.skillLevel ? player : highest
              );
              updatedTeam.captainIds = [newCaptain.id];
            }

            return {
              ...updatedTeam,
              averageSkill: calculateAverageSkill(updatedTeam.players)
            };
          } else if (team.id === toTeamId && toTeamId !== null) {
            // Add player to destination team only if not already there
            const playerAlreadyOnTeam = team.players.some(p => p.id === playerId);
            if (playerAlreadyOnTeam) return team;

            const updatedTeam = {
              ...team,
              players: [...team.players, player]
            };

            // Auto-assign captain if team doesn't have any captains
            if (updatedTeam.captainIds.length === 0) {
              updatedTeam.captainIds = [player.id];
            }

            return {
              ...updatedTeam,
              averageSkill: calculateAverageSkill(updatedTeam.players)
            };
          }
          return team;
        });

        set({ teams: updatedTeams, players: updatedPlayers });
      },

      setCaptain: (teamId: string, playerId: string) => {
        const state = get();
        const team = state.teams.find(t => t.id === teamId);
        if (!team) return;

        // Ensure captainIds exists (migration from old captainId structure)
        const captainIds = team.captainIds || [];

        // Check if player is already a captain
        const isAlreadyCaptain = captainIds.includes(playerId);

        set({
          teams: state.teams.map(t => {
            if (t.id === teamId) {
              // Ensure captainIds exists for this team too
              const teamCaptainIds = t.captainIds || [];

              if (isAlreadyCaptain) {
                // Remove from captains, but ensure at least one captain remains
                const newCaptainIds = teamCaptainIds.filter(id => id !== playerId);
                if (newCaptainIds.length === 0) {
                  // Don't allow removing the last captain
                  return t;
                }
                return { ...t, captainIds: newCaptainIds };
              } else {
                // Add as captain
                return { ...t, captainIds: [...teamCaptainIds, playerId] };
              }
            }
            return t;
          })
        });
      },

      togglePlayerCaptain: (playerId: string) => {
        const state = get();
        const player = state.players.find(p => p.id === playerId);
        if (!player) return;

        // First update the player's captain status
        const updatedPlayers = state.players.map(p =>
          p.id === playerId ? { ...p, isCaptain: !p.isCaptain } : p
        );

        // Then update teams if the player is already on a team
        const updatedTeams = state.teams.map(team => {
          // Ensure captainIds exists (migration from old captainId structure)
          const captainIds = team.captainIds || [];

          // Check if this player is on this team
          const playerOnTeam = team.players.find(p => p.id === playerId);
          if (playerOnTeam) {
            const isCurrentlyCaptain = captainIds.includes(playerId);
            const shouldBeCaptain = !player.isCaptain; // Toggle the status

            if (isCurrentlyCaptain && !shouldBeCaptain) {
              // Remove captain status, but ensure at least one captain remains
              const newCaptainIds = captainIds.filter(id => id !== playerId);
              if (newCaptainIds.length === 0) {
                // Don't allow removing the last captain
                return team;
              }
              return { ...team, captainIds: newCaptainIds };
            } else if (!isCurrentlyCaptain && shouldBeCaptain) {
              // Add as captain
              return { ...team, captainIds: [...captainIds, playerId] };
            }
          }
          return team;
        });

        set({ players: updatedPlayers, teams: updatedTeams });
      },

      updateTeamColor: (teamId: string, color: TeamColor) => {
        const state = get();
        set({
          teams: state.teams.map(team =>
            team.id === teamId ? { ...team, color } : team
          )
        });
      },

      resetTeams: () => {
        set({ teams: [], matches: [], standings: [], currentMatchId: null });
      },

      // Match actions
      generateSchedule: () => {
        const state = get();
        const teams = state.teams;
        const gamesPerTeam = state.settings.gamesPerTeam;

        if (teams.length < 2) return;

        const teamIds = teams.map(t => t.id);

        // Generate all possible pairings
        const allPairings: [string, string][] = [];
        for (let i = 0; i < teamIds.length; i++) {
          for (let j = i + 1; j < teamIds.length; j++) {
            allPairings.push([teamIds[i], teamIds[j]]);
          }
        }

        // Smart scheduling to avoid back-to-backs
        const schedule: Match[] = [];
        const lastPlayed: Map<string, number> = new Map();
        let gameNumber = 1;
        const maxGames = Math.min(allPairings.length, (gamesPerTeam * teams.length) / 2);

        while (schedule.length < maxGames) {
          let scheduled = false;

          for (const [teamA, teamB] of allPairings) {
            if (schedule.find(m =>
              (m.teamAId === teamA && m.teamBId === teamB) ||
              (m.teamAId === teamB && m.teamBId === teamA)
            )) {
              continue; // Already scheduled
            }

            const teamALast = lastPlayed.get(teamA) || -999;
            const teamBLast = lastPlayed.get(teamB) || -999;

            // Ensure teams have rested at least 1 game
            if (gameNumber - teamALast > 1 && gameNumber - teamBLast > 1) {
              schedule.push({
                id: `match-${gameNumber}`,
                gameNumber,
                teamAId: teamA,
                teamBId: teamB,
                scoreA: 0,
                scoreB: 0,
                status: 'scheduled',
                duration: state.settings.matchDuration,
              });

              lastPlayed.set(teamA, gameNumber);
              lastPlayed.set(teamB, gameNumber);
              gameNumber++;
              scheduled = true;

              if (schedule.length >= maxGames) break;
            }
          }

          if (!scheduled) break; // Prevent infinite loop
        }

        set({ matches: schedule });
      },

      addMatch: (teamAId: string, teamBId: string) => {
        const state = get();
        const teamA = state.teams.find(t => t.id === teamAId);
        const teamB = state.teams.find(t => t.id === teamBId);

        if (!teamA || !teamB || teamAId === teamBId) return;

        const maxGameNumber = state.matches.length > 0
          ? Math.max(...state.matches.map(m => m.gameNumber))
          : 0;

        const newMatch: Match = {
          id: uuidv4(),
          gameNumber: maxGameNumber + 1,
          teamAId,
          teamBId,
          scoreA: 0,
          scoreB: 0,
          status: 'scheduled',
          duration: state.settings.matchDuration
        };

        set({
          matches: [...state.matches, newMatch]
        });
      },

      updateScore: (matchId: string, scoreA: number, scoreB: number) => {
        const state = get();
        const isCompleted = scoreA > 0 || scoreB > 0; // Match is completed if any score is > 0

        set({
          matches: state.matches.map(match =>
            match.id === matchId
              ? {
                  ...match,
                  scoreA,
                  scoreB,
                  status: isCompleted ? 'completed' : 'scheduled',
                  endTime: isCompleted && match.status !== 'completed' ? new Date() : match.endTime
                }
              : match
          )
        });

        // Recalculate standings after score update
        if (isCompleted) {
          setTimeout(() => get().calculateStandings(), 0);
        }
      },

      swapTeamsInMatch: (matchId: string, newTeamAId: string, newTeamBId: string) => {
        const state = get();

        // Validate that both teams exist and are different
        const teamA = state.teams.find(t => t.id === newTeamAId);
        const teamB = state.teams.find(t => t.id === newTeamBId);
        if (!teamA || !teamB || newTeamAId === newTeamBId) return;

        set({
          matches: state.matches.map(match =>
            match.id === matchId
              ? {
                  ...match,
                  teamAId: newTeamAId,
                  teamBId: newTeamBId,
                  // Reset scores if match hasn't started
                  scoreA: match.status === 'scheduled' ? 0 : match.scoreA,
                  scoreB: match.status === 'scheduled' ? 0 : match.scoreB
                }
              : match
          )
        });

        // Recalculate standings if match was completed
        const updatedMatch = state.matches.find(m => m.id === matchId);
        if (updatedMatch && updatedMatch.status === 'completed') {
          setTimeout(() => get().calculateStandings(), 0);
        }
      },


      // Timer actions
      startTimer: () => {
        set(state => ({
          timerState: { ...state.timerState, isRunning: true, isPaused: false }
        }));
      },

      pauseTimer: () => {
        set(state => ({
          timerState: { ...state.timerState, isRunning: false, isPaused: true }
        }));
      },

      resetTimer: () => {
        const state = get();
        set({
          timerState: {
            timeRemaining: state.settings.matchDuration * 60,
            isRunning: false,
            isPaused: false
          }
        });
      },

      updateTimer: () => {
        const state = get();
        if (state.timerState.isRunning && state.timerState.timeRemaining > 0) {
          set({
            timerState: {
              ...state.timerState,
              timeRemaining: Math.max(0, state.timerState.timeRemaining - 1)
            }
          });

        }
      },

      // Settings actions
      updateSettings: (newSettings: Partial<GameSettings>) => {
        const state = get();
        const updatedSettings = { ...state.settings, ...newSettings };
        set({
          settings: updatedSettings,
          timerState: {
            ...state.timerState,
            timeRemaining: updatedSettings.matchDuration * 60
          }
        });
      },

      // Standings actions
      calculateStandings: () => {
        const state = get();
        const standings = calculateStandingsFromMatches(state.matches, state.teams);
        set({ standings });
      },

      // Utility actions
      resetAll: () => {
        set({
          players: [],
          teams: [],
          matches: [],
          currentMatchId: null,
          standings: [],
          timerState: {
            timeRemaining: DEFAULT_SETTINGS.matchDuration * 60,
            isRunning: false,
            isPaused: false
          }
        });
      },

      // Safe reset with game day protection
      resetAllSafe: () => {
        const state = get();

        // Check if there's an active match in progress
        const hasActiveMatch = state.matches.some(match => match.status === 'in-progress');
        const timerRunning = state.timerState?.isRunning;

        if (hasActiveMatch || timerRunning) {
          // Return false to indicate reset was blocked
          return {
            success: false,
            reason: hasActiveMatch
              ? 'Cannot reset during active match. Complete or cancel the current match first.'
              : 'Cannot reset while timer is running. Stop the timer first.'
          };
        }

        // Safe to reset
        set({
          players: [],
          teams: [],
          matches: [],
          currentMatchId: null,
          standings: [],
          lastResetDate: getCurrentDateString(),
          timerState: {
            timeRemaining: state.settings.matchDuration * 60,
            isRunning: false,
            isPaused: false
          }
        });

        return { success: true };
      },

      checkDailyAutoReset: () => {
        const state = get();
        const currentDate = getCurrentDateString();

        // Check if the date has changed since last reset
        if (state.lastResetDate !== currentDate) {
          console.log(`Auto-reset triggered: ${state.lastResetDate} -> ${currentDate}`);

          // Reset game data but preserve settings, sounds, and haptic preferences
          set({
            players: [],
            teams: [],
            matches: [],
            currentMatchId: null,
            currentMatch: null,
            standings: [],
            tournamentName: 'Pickup Games',
            lastResetDate: currentDate,
            timerState: {
              timeRemaining: state.settings.matchDuration * 60,
              isRunning: false,
              isPaused: false
            }
            // Note: settings are preserved (not reset)
          });

          return true; // Reset occurred
        }

        return false; // No reset needed
      },

      resetApp: () => {
        set({
          players: [],
          teams: [],
          matches: [],
          currentMatchId: null,
          currentMatch: null,
          standings: [],
          settings: DEFAULT_SETTINGS,
          tournamentName: 'Pickup Games',
          lastResetDate: getCurrentDateString(),
          timerState: {
            timeRemaining: DEFAULT_SETTINGS.matchDuration * 60,
            isRunning: false,
            isPaused: false
          }
        });
      },

      updatePlayer: (playerId: string, updates: Partial<Player>) => {
        const state = get();
        set({
          players: state.players.map(player =>
            player.id === playerId ? { ...player, ...updates } : player
          ),
          teams: state.teams.map(team => ({
            ...team,
            players: team.players.map(player =>
              player.id === playerId ? { ...player, ...updates } : player
            ),
            averageSkill: calculateAverageSkill(
              team.players.map(player =>
                player.id === playerId ? { ...player, ...updates } : player
              )
            )
          }))
        });
      },

      exportData: () => {
        const state = get();
        return JSON.stringify({
          players: state.players,
          teams: state.teams,
          matches: state.matches,
          settings: state.settings,
          standings: state.standings
        }, null, 2);
      },

      importData: (data: string) => {
        try {
          const parsed = JSON.parse(data);
          set({
            players: parsed.players || [],
            teams: parsed.teams || [],
            matches: parsed.matches || [],
            settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
            standings: parsed.standings || [],
            currentMatchId: null,
            timerState: {
              timeRemaining: (parsed.settings?.matchDuration || DEFAULT_SETTINGS.matchDuration) * 60,
              isRunning: false,
              isPaused: false
            }
          });
        } catch (error) {
          console.error('Failed to import data:', error);
        }
      },

      setTournamentName: (name: string) => {
        set({ tournamentName: name });
      }
    }),
    {
      name: 'kickoff-storage',
      partialize: (state) => ({
        players: state.players,
        teams: state.teams,
        matches: state.matches,
        settings: state.settings,
        standings: state.standings
      }),
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          // Convert date strings back to Date objects
          if (parsed.state?.players) {
            parsed.state.players = parsed.state.players.map((player: any) => ({
              ...player,
              createdAt: new Date(player.createdAt)
            }));
          }
          if (parsed.state?.matches) {
            parsed.state.matches = parsed.state.matches.map((match: any) => ({
              ...match,
              startTime: match.startTime ? new Date(match.startTime) : undefined,
              endTime: match.endTime ? new Date(match.endTime) : undefined
            }));
          }
          // Migrate teams from old captainId to new captainIds structure
          if (parsed.state?.teams) {
            parsed.state.teams = parsed.state.teams.map((team: any) => {
              if (team.captainId && !team.captainIds) {
                // Migrate from old single captain to new multiple captains
                return {
                  ...team,
                  captainIds: [team.captainId],
                  captainId: undefined // Remove old property
                };
              } else if (!team.captainIds) {
                // Ensure captainIds exists
                return {
                  ...team,
                  captainIds: []
                };
              }
              return team;
            });
          }
          return parsed;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        }
      }
    }
  )
);