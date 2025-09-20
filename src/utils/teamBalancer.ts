import { Player, Team, TeamColor } from '../types';
import { v4 as uuidv4 } from 'uuid';

const TEAM_COLORS: TeamColor[] = ['black', 'white', 'orange', 'blue', 'yellow', 'no-pennies'];
const TEAM_NAMES = ['Team Alpha', 'Team Beta', 'Team Gamma', 'Team Delta', 'Team Epsilon', 'Team Zeta'];

interface TeamBalance {
  teams: Team[];
  balanceScore: number; // Lower is better
}

export const calculateTeamBalance = (teams: Team[]): number => {
  if (teams.length === 0) return 0;

  const averageSkills = teams.map(team => {
    if (team.players.length === 0) return 0;
    return team.players.reduce((sum, player) => sum + player.skillLevel, 0) / team.players.length;
  });

  const globalAverage = averageSkills.reduce((sum, avg) => sum + avg, 0) / averageSkills.length;

  // Calculate variance from global average
  const variance = averageSkills.reduce((sum, avg) => sum + Math.pow(avg - globalAverage, 2), 0) / averageSkills.length;

  return Math.sqrt(variance); // Standard deviation
};

export const balanceTeams = (players: Player[], teamCount: number): Team[] => {
  if (players.length === 0 || teamCount === 0) return [];

  // Sort players by skill level (highest first)
  const sortedPlayers = [...players].sort((a, b) => b.skillLevel - a.skillLevel);

  // Initialize teams
  const teams: Team[] = Array.from({ length: teamCount }, (_, i) => ({
    id: uuidv4(),
    name: TEAM_NAMES[i] || `Team ${i + 1}`,
    color: TEAM_COLORS[i] || 'no-pennies',
    players: [],
    captainIds: [],
    averageSkill: 0,
  }));

  // Snake draft distribution for balanced teams
  let teamIndex = 0;
  let direction = 1;

  sortedPlayers.forEach((player) => {
    teams[teamIndex].players.push(player);

    // Change direction at the ends (snake pattern)
    if ((direction === 1 && teamIndex === teamCount - 1) ||
        (direction === -1 && teamIndex === 0)) {
      direction *= -1;
    } else {
      teamIndex += direction;
    }
  });

  // Calculate average skills and set captains
  teams.forEach(team => {
    if (team.players.length > 0) {
      const total = team.players.reduce((sum, p) => sum + p.skillLevel, 0);
      team.averageSkill = Number((total / team.players.length).toFixed(1));

      // Set captain as the highest skill player on the team
      const captain = team.players.reduce((highest, player) =>
        player.skillLevel > highest.skillLevel ? player : highest
      );
      team.captainIds = [captain.id];
    }
  });

  return teams;
};

export const optimizeTeamBalance = (players: Player[], teamCount: number, maxAttempts: number = 100): Team[] => {
  if (players.length === 0 || teamCount === 0) return [];

  let bestBalance: TeamBalance = {
    teams: balanceTeams(players, teamCount),
    balanceScore: Infinity
  };

  bestBalance.balanceScore = calculateTeamBalance(bestBalance.teams);

  // Try multiple random distributions and keep the best one
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Create a shuffled copy of players for this attempt
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    const teams = balanceTeams(shuffledPlayers, teamCount);
    const balanceScore = calculateTeamBalance(teams);

    if (balanceScore < bestBalance.balanceScore) {
      bestBalance = { teams, balanceScore };
    }
  }

  return bestBalance.teams;
};

export const rebalanceTeam = (teams: Team[], fromTeamIndex: number, toTeamIndex: number): Team[] => {
  if (fromTeamIndex === toTeamIndex ||
      fromTeamIndex < 0 || toTeamIndex < 0 ||
      fromTeamIndex >= teams.length || toTeamIndex >= teams.length) {
    return teams;
  }

  const newTeams = [...teams];
  const fromTeam = newTeams[fromTeamIndex];
  const toTeam = newTeams[toTeamIndex];

  if (fromTeam.players.length === 0) return teams;

  // Find the best player to move for balance
  let bestSwap: { playerIndex: number; newBalance: number } = {
    playerIndex: -1,
    newBalance: Infinity
  };

  fromTeam.players.forEach((player, playerIndex) => {
    // Simulate the move
    const simulatedFromTeam = {
      ...fromTeam,
      players: fromTeam.players.filter((_, i) => i !== playerIndex)
    };
    const simulatedToTeam = {
      ...toTeam,
      players: [...toTeam.players, player]
    };

    // Calculate new balance
    const simulatedTeams = newTeams.map((team, i) => {
      if (i === fromTeamIndex) return simulatedFromTeam;
      if (i === toTeamIndex) return simulatedToTeam;
      return team;
    });

    const balance = calculateTeamBalance(simulatedTeams);

    if (balance < bestSwap.newBalance) {
      bestSwap = { playerIndex, newBalance: balance };
    }
  });

  // Execute the best swap if found
  if (bestSwap.playerIndex !== -1) {
    const playerToMove = fromTeam.players[bestSwap.playerIndex];

    newTeams[fromTeamIndex] = {
      ...fromTeam,
      players: fromTeam.players.filter((_, i) => i !== bestSwap.playerIndex)
    };

    newTeams[toTeamIndex] = {
      ...toTeam,
      players: [...toTeam.players, playerToMove]
    };

    // Recalculate average skills
    newTeams.forEach(team => {
      if (team.players.length > 0) {
        const total = team.players.reduce((sum, p) => sum + p.skillLevel, 0);
        team.averageSkill = Number((total / team.players.length).toFixed(1));
      } else {
        team.averageSkill = 0;
      }
    });
  }

  return newTeams;
};

export const suggestPlayerSwaps = (teams: Team[]): Array<{
  fromTeamId: string;
  toTeamId: string;
  playerId: string;
  improvementScore: number;
}> => {
  const suggestions: Array<{
    fromTeamId: string;
    toTeamId: string;
    playerId: string;
    improvementScore: number;
  }> = [];

  const currentBalance = calculateTeamBalance(teams);

  teams.forEach((fromTeam, fromIndex) => {
    fromTeam.players.forEach(player => {
      teams.forEach((toTeam, toIndex) => {
        if (fromIndex === toIndex) return;

        // Simulate the swap
        const simulatedTeams = teams.map((team, i) => {
          if (i === fromIndex) {
            return {
              ...team,
              players: team.players.filter(p => p.id !== player.id)
            };
          }
          if (i === toIndex) {
            return {
              ...team,
              players: [...team.players, player]
            };
          }
          return team;
        });

        const newBalance = calculateTeamBalance(simulatedTeams);
        const improvement = currentBalance - newBalance;

        if (improvement > 0.1) { // Only suggest if significant improvement
          suggestions.push({
            fromTeamId: fromTeam.id,
            toTeamId: toTeam.id,
            playerId: player.id,
            improvementScore: improvement
          });
        }
      });
    });
  });

  // Sort by improvement score (highest first)
  return suggestions.sort((a, b) => b.improvementScore - a.improvementScore).slice(0, 5);
};

export const validateTeamBalance = (teams: Team[], maxSkillDifference: number = 1.0): {
  isBalanced: boolean;
  issues: string[];
  suggestions: string[];
} => {
  const issues: string[] = [];
  const suggestions: string[] = [];

  if (teams.length === 0) {
    return { isBalanced: true, issues, suggestions };
  }

  // Check if teams have similar player counts
  const playerCounts = teams.map(team => team.players.length);
  const minPlayers = Math.min(...playerCounts);
  const maxPlayers = Math.max(...playerCounts);

  if (maxPlayers - minPlayers > 1) {
    issues.push('Teams have uneven player counts');
    suggestions.push('Redistribute players to balance team sizes');
  }

  // Check skill level balance
  const averageSkills = teams.map(team => team.averageSkill);
  const minSkill = Math.min(...averageSkills);
  const maxSkill = Math.max(...averageSkills);

  if (maxSkill - minSkill > maxSkillDifference) {
    issues.push(`Skill gap too large (${(maxSkill - minSkill).toFixed(1)} points)`);
    suggestions.push('Consider swapping players between teams to balance skills');
  }

  // Check for empty teams
  const emptyTeams = teams.filter(team => team.players.length === 0);
  if (emptyTeams.length > 0) {
    issues.push(`${emptyTeams.length} team(s) have no players`);
    suggestions.push('Add players to empty teams or reduce team count');
  }

  return {
    isBalanced: issues.length === 0,
    issues,
    suggestions
  };
};