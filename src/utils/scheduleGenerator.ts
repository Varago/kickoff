import { Team, Match, GameSettings } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface ScheduleConstraints {
  minimumRestGames: number; // Minimum games between a team's matches
  maxGamesPerTeam: number;
  preferredGameSpacing: number;
}

interface TeamScheduleInfo {
  teamId: string;
  gamesPlayed: number;
  lastGameNumber: number;
  opponents: Set<string>;
}

export const generateRoundRobin = (
  teams: Team[],
  settings: GameSettings,
  constraints: ScheduleConstraints = {
    minimumRestGames: 1,
    maxGamesPerTeam: settings.gamesPerTeam,
    preferredGameSpacing: 2
  }
): Match[] => {
  if (teams.length < 2) return [];

  const matches: Match[] = [];
  const teamIds = teams.map(t => t.id);

  // Initialize team schedule tracking
  const teamInfo: Map<string, TeamScheduleInfo> = new Map();
  teamIds.forEach(id => {
    teamInfo.set(id, {
      teamId: id,
      gamesPlayed: 0,
      lastGameNumber: -999,
      opponents: new Set()
    });
  });

  // Generate all possible pairings
  const allPairings: [string, string][] = [];
  for (let i = 0; i < teamIds.length; i++) {
    for (let j = i + 1; j < teamIds.length; j++) {
      allPairings.push([teamIds[i], teamIds[j]]);
    }
  }

  // Shuffle pairings for variety
  const shuffledPairings = [...allPairings].sort(() => Math.random() - 0.5);

  let gameNumber = 1;
  const maxPossibleGames = Math.min(
    allPairings.length,
    Math.floor((constraints.maxGamesPerTeam * teams.length) / 2)
  );

  // Schedule games with smart constraints
  while (matches.length < maxPossibleGames) {
    let scheduledThisRound = false;

    // Try to schedule a game this round
    for (const [teamA, teamB] of shuffledPairings) {
      const teamAInfo = teamInfo.get(teamA)!;
      const teamBInfo = teamInfo.get(teamB)!;

      // Check if this pairing has already been scheduled
      if (teamAInfo.opponents.has(teamB)) continue;

      // Check if teams have reached their game limit
      if (teamAInfo.gamesPlayed >= constraints.maxGamesPerTeam ||
          teamBInfo.gamesPlayed >= constraints.maxGamesPerTeam) continue;

      // Check rest constraints
      const teamARestGames = gameNumber - teamAInfo.lastGameNumber - 1;
      const teamBRestGames = gameNumber - teamBInfo.lastGameNumber - 1;

      if (teamARestGames < constraints.minimumRestGames ||
          teamBRestGames < constraints.minimumRestGames) continue;

      // Schedule the match
      const match: Match = {
        id: uuidv4(),
        gameNumber,
        teamAId: teamA,
        teamBId: teamB,
        scoreA: 0,
        scoreB: 0,
        status: 'scheduled',
        duration: settings.matchDuration,
      };

      matches.push(match);

      // Update team info
      teamAInfo.gamesPlayed++;
      teamAInfo.lastGameNumber = gameNumber;
      teamAInfo.opponents.add(teamB);

      teamBInfo.gamesPlayed++;
      teamBInfo.lastGameNumber = gameNumber;
      teamBInfo.opponents.add(teamA);

      scheduledThisRound = true;
      break;
    }

    if (!scheduledThisRound) {
      // If we couldn't schedule anything this round, try with relaxed constraints
      for (const [teamA, teamB] of shuffledPairings) {
        const teamAInfo = teamInfo.get(teamA)!;
        const teamBInfo = teamInfo.get(teamB)!;

        if (teamAInfo.opponents.has(teamB)) continue;
        if (teamAInfo.gamesPlayed >= constraints.maxGamesPerTeam ||
            teamBInfo.gamesPlayed >= constraints.maxGamesPerTeam) continue;

        // Relaxed constraint - allow back-to-back games if necessary
        const match: Match = {
          id: uuidv4(),
          gameNumber,
          teamAId: teamA,
          teamBId: teamB,
          scoreA: 0,
          scoreB: 0,
          status: 'scheduled',
          duration: settings.matchDuration,
        };

        matches.push(match);

        teamAInfo.gamesPlayed++;
        teamAInfo.lastGameNumber = gameNumber;
        teamAInfo.opponents.add(teamB);

        teamBInfo.gamesPlayed++;
        teamBInfo.lastGameNumber = gameNumber;
        teamBInfo.opponents.add(teamA);

        scheduledThisRound = true;
        break;
      }
    }

    if (!scheduledThisRound) break; // Prevent infinite loop

    gameNumber++;
  }

  return matches;
};

export const generateTournamentBracket = (teams: Team[], settings: GameSettings): Match[] => {
  if (teams.length < 2) return [];

  const matches: Match[] = [];
  let gameNumber = 1;

  // For now, implement a simple single-elimination tournament
  // This can be expanded for double-elimination or other formats

  const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
  let currentRoundTeams = shuffledTeams.map(t => t.id);

  while (currentRoundTeams.length > 1) {
    const nextRoundTeams: string[] = [];

    // Pair up teams for this round
    for (let i = 0; i < currentRoundTeams.length; i += 2) {
      if (i + 1 < currentRoundTeams.length) {
        const match: Match = {
          id: uuidv4(),
          gameNumber,
          teamAId: currentRoundTeams[i],
          teamBId: currentRoundTeams[i + 1],
          scoreA: 0,
          scoreB: 0,
          status: 'scheduled',
          duration: settings.matchDuration,
        };

        matches.push(match);
        gameNumber++;

        // For now, just advance team A (this would be determined by match results)
        nextRoundTeams.push(currentRoundTeams[i]);
      } else {
        // Bye - team advances automatically
        nextRoundTeams.push(currentRoundTeams[i]);
      }
    }

    currentRoundTeams = nextRoundTeams;
  }

  return matches;
};

export const generateFinalsSchedule = (topTeams: Team[], settings: GameSettings): Match[] => {
  if (topTeams.length < 2) return [];

  const match: Match = {
    id: uuidv4(),
    gameNumber: 1,
    teamAId: topTeams[0].id,
    teamBId: topTeams[1].id,
    scoreA: 0,
    scoreB: 0,
    status: 'scheduled',
    duration: settings.matchDuration,
  };

  return [match];
};

export const validateSchedule = (matches: Match[], teams: Team[], settings: GameSettings): {
  isValid: boolean;
  issues: string[];
  warnings: string[];
} => {
  const issues: string[] = [];
  const warnings: string[] = [];

  if (matches.length === 0) {
    issues.push('No matches scheduled');
    return { isValid: false, issues, warnings };
  }

  // Check for valid team references
  const teamIds = new Set(teams.map(t => t.id));
  matches.forEach(match => {
    if (!teamIds.has(match.teamAId)) {
      issues.push(`Match ${match.gameNumber}: Invalid team A ID`);
    }
    if (!teamIds.has(match.teamBId)) {
      issues.push(`Match ${match.gameNumber}: Invalid team B ID`);
    }
    if (match.teamAId === match.teamBId) {
      issues.push(`Match ${match.gameNumber}: Team cannot play itself`);
    }
  });

  // Check game numbering
  const gameNumbers = matches.map(m => m.gameNumber).sort((a, b) => a - b);
  for (let i = 0; i < gameNumbers.length; i++) {
    if (gameNumbers[i] !== i + 1) {
      warnings.push(`Game numbering is not sequential`);
      break;
    }
  }

  // Check for back-to-back games
  const teamLastGame: Map<string, number> = new Map();
  matches.forEach(match => {
    const teamALast = teamLastGame.get(match.teamAId) || 0;
    const teamBLast = teamLastGame.get(match.teamBId) || 0;

    if (match.gameNumber - teamALast === 1) {
      warnings.push(`Team A in match ${match.gameNumber} has back-to-back games`);
    }
    if (match.gameNumber - teamBLast === 1) {
      warnings.push(`Team B in match ${match.gameNumber} has back-to-back games`);
    }

    teamLastGame.set(match.teamAId, match.gameNumber);
    teamLastGame.set(match.teamBId, match.gameNumber);
  });

  // Check games per team balance
  const gamesPerTeam: Map<string, number> = new Map();
  teams.forEach(team => gamesPerTeam.set(team.id, 0));

  matches.forEach(match => {
    gamesPerTeam.set(match.teamAId, (gamesPerTeam.get(match.teamAId) || 0) + 1);
    gamesPerTeam.set(match.teamBId, (gamesPerTeam.get(match.teamBId) || 0) + 1);
  });

  const gameCounts = Array.from(gamesPerTeam.values());
  const minGames = Math.min(...gameCounts);
  const maxGames = Math.max(...gameCounts);

  if (maxGames - minGames > 1) {
    warnings.push(`Uneven games per team (${minGames}-${maxGames})`);
  }

  if (maxGames > settings.gamesPerTeam) {
    warnings.push(`Some teams exceed maximum games per team (${maxGames} > ${settings.gamesPerTeam})`);
  }

  return {
    isValid: issues.length === 0,
    issues,
    warnings
  };
};

export const optimizeSchedule = (
  teams: Team[],
  settings: GameSettings,
  maxAttempts: number = 50
): Match[] => {
  let bestSchedule: Match[] = [];
  let bestScore = Infinity;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const schedule = generateRoundRobin(teams, settings);
    const validation = validateSchedule(schedule, teams, settings);

    // Score based on warnings (fewer is better)
    const score = validation.warnings.length;

    if (score < bestScore && validation.isValid) {
      bestSchedule = schedule;
      bestScore = score;

      // If we found a perfect schedule, return it
      if (score === 0) break;
    }
  }

  return bestSchedule.length > 0 ? bestSchedule : generateRoundRobin(teams, settings);
};

export const getScheduleStats = (matches: Match[], teams: Team[]): {
  totalGames: number;
  gamesPerTeam: Record<string, number>;
  averageGamesPerTeam: number;
  backToBackGames: number;
  uniqueMatchups: number;
  estimatedDuration: number;
} => {
  const gamesPerTeam: Record<string, number> = {};
  teams.forEach(team => {
    gamesPerTeam[team.id] = 0;
  });

  let backToBackGames = 0;
  const teamLastGame: Map<string, number> = new Map();
  const uniqueMatchups = new Set<string>();

  matches.forEach(match => {
    // Count games per team
    gamesPerTeam[match.teamAId] = (gamesPerTeam[match.teamAId] || 0) + 1;
    gamesPerTeam[match.teamBId] = (gamesPerTeam[match.teamBId] || 0) + 1;

    // Check for back-to-back games
    const teamALast = teamLastGame.get(match.teamAId) || 0;
    const teamBLast = teamLastGame.get(match.teamBId) || 0;

    if (match.gameNumber - teamALast === 1) backToBackGames++;
    if (match.gameNumber - teamBLast === 1) backToBackGames++;

    teamLastGame.set(match.teamAId, match.gameNumber);
    teamLastGame.set(match.teamBId, match.gameNumber);

    // Track unique matchups
    const matchup = [match.teamAId, match.teamBId].sort().join('-');
    uniqueMatchups.add(matchup);
  });

  const gameValues = Object.values(gamesPerTeam);
  const averageGamesPerTeam = gameValues.length > 0 ? gameValues.reduce((a, b) => a + b, 0) / gameValues.length : 0;

  // Estimate duration assuming 5 minutes between games
  const estimatedDuration = matches.length > 0 ?
    matches.reduce((total, match) => total + match.duration, 0) + (matches.length - 1) * 5 : 0;

  return {
    totalGames: matches.length,
    gamesPerTeam,
    averageGamesPerTeam,
    backToBackGames,
    uniqueMatchups: uniqueMatchups.size,
    estimatedDuration
  };
};