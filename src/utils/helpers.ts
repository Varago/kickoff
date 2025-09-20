import { format } from 'date-fns';
import { Player, Team, Match, Standing } from '../types';

// Time utilities
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${remainingMinutes}m`;
};

export const formatDate = (date: Date): string => {
  return format(date, 'MMM dd, yyyy');
};

export const formatDateTime = (date: Date): string => {
  return format(date, 'MMM dd, yyyy HH:mm');
};

// Player utilities
export const getPlayerDisplayName = (player: Player): string => {
  return player.name.trim() || 'Unnamed Player';
};

export const getSkillLevelLabel = (skillLevel: number): string => {
  const labels = ['', 'Beginner', 'Casual', 'Skilled', 'Expert'];
  return labels[skillLevel] || 'Unknown';
};

export const getSkillLevelEmoji = (skillLevel: number): string => {
  const emojis = ['', '⚽', '⚽⚽', '⚽⚽⚽', '⚽⚽⚽⚽'];
  return emojis[skillLevel] || '';
};

// Team utilities
export const getTeamDisplayName = (team: Team): string => {
  // Capitalize the color name properly
  const colorNames: Record<string, string> = {
    'black': 'Black',
    'white': 'White',
    'orange': 'Orange',
    'blue': 'Blue',
    'yellow': 'Yellow',
    'no-pennies': 'No Pennies'
  };

  return colorNames[team.color] || team.name.trim() || `Team ${team.color}`;
};

export const calculateTeamAverageSkill = (team: Team): number => {
  if (team.players.length === 0) return 0;
  const total = team.players.reduce((sum, player) => sum + player.skillLevel, 0);
  return Number((total / team.players.length).toFixed(1));
};

export const getTeamCaptains = (team: Team): Player[] => {
  if (!team.captainIds || team.captainIds.length === 0) return [];
  return team.players.filter(player => (team.captainIds || []).includes(player.id));
};

export const getTeamCaptain = (team: Team): Player | null => {
  const captains = getTeamCaptains(team);
  return captains.length > 0 ? captains[0] : null;
};

export const isPlayerCaptain = (playerId: string, teams: Team[], players?: Player[]): boolean => {
  // Check if player is captain in any team
  const teamCaptain = teams.some(team => team.captainIds && team.captainIds.includes(playerId));

  // If no players array provided, just check teams
  if (!players) return teamCaptain;

  // Check player's own captain status
  const player = players.find(p => p.id === playerId);
  return player?.isCaptain || teamCaptain;
};

export const getPlayerTeam = (playerId: string, teams: Team[]): Team | null => {
  return teams.find(team => team.players.some(player => player.id === playerId)) || null;
};

export const getTeamColorClass = (team: Team): string => {
  const colorMap = {
    black: 'bg-team-black text-white',
    white: 'bg-team-white text-black',
    orange: 'bg-team-orange text-white',
    blue: 'bg-team-blue text-white',
    yellow: 'bg-team-yellow text-black',
    'no-pennies': 'team-gradient text-white'
  };
  return colorMap[team.color] || 'bg-gray-500 text-white';
};

// Match utilities
export const getMatchDisplayName = (match: Match, teams: Team[]): string => {
  const teamA = teams.find(t => t.id === match.teamAId);
  const teamB = teams.find(t => t.id === match.teamBId);

  if (!teamA || !teamB) return `Game ${match.gameNumber}`;

  return `${getTeamDisplayName(teamA)} vs ${getTeamDisplayName(teamB)}`;
};

export const getMatchResult = (match: Match): 'win-a' | 'win-b' | 'draw' | 'scheduled' => {
  if (match.status !== 'completed') return 'scheduled';

  if (match.scoreA > match.scoreB) return 'win-a';
  if (match.scoreB > match.scoreA) return 'win-b';
  return 'draw';
};

export const getMatchStatusColor = (match: Match): string => {
  switch (match.status) {
    case 'scheduled': return 'text-gray-400';
    case 'in-progress': return 'text-yellow-400';
    case 'completed': return 'text-green-400';
    default: return 'text-gray-400';
  }
};

export const getMatchStatusLabel = (match: Match): string => {
  switch (match.status) {
    case 'scheduled': return 'Scheduled';
    case 'in-progress': return 'In Progress';
    case 'completed': return 'Completed';
    default: return 'Unknown';
  }
};

// Standings utilities
export const formatStandingPosition = (position: number): string => {
  const suffix = ['th', 'st', 'nd', 'rd'];
  const value = position % 100;
  return position + (suffix[(value - 20) % 10] || suffix[value] || suffix[0]);
};

export const getStandingTeamName = (standing: Standing, teams: Team[]): string => {
  const team = teams.find(t => t.id === standing.teamId);
  return team ? getTeamDisplayName(team) : 'Unknown Team';
};

export const calculateWinPercentage = (standing: Standing): number => {
  if (standing.played === 0) return 0;
  return Number(((standing.won / standing.played) * 100).toFixed(1));
};

// Validation utilities
export const isValidPlayerName = (name: string): boolean => {
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 30 && /^[a-zA-Z\s'-]+$/.test(trimmed);
};

export const isValidTeamName = (name: string): boolean => {
  const trimmed = name.trim();
  return trimmed.length >= 3 && trimmed.length <= 20 && /^[a-zA-Z0-9\s'-]+$/.test(trimmed);
};

export const isValidSkillLevel = (skillLevel: number): boolean => {
  return Number.isInteger(skillLevel) && skillLevel >= 1 && skillLevel <= 4;
};

export const isValidMatchDuration = (duration: number): boolean => {
  return Number.isInteger(duration) && duration >= 5 && duration <= 90;
};

// Array utilities
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// Statistics utilities
export const calculateAverage = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((total, num) => total + num, 0);
  return Number((sum / numbers.length).toFixed(2));
};

export const calculateMedian = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  return sorted[middle];
};

export const calculateStandardDeviation = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  const average = calculateAverage(numbers);
  const squaredDifferences = numbers.map(num => Math.pow(num - average, 2));
  const variance = calculateAverage(squaredDifferences);
  return Number(Math.sqrt(variance).toFixed(2));
};

// Color utilities
export const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const getContrastColor = (hex: string): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#FFFFFF';
};

// Local Storage utilities
export const saveToLocalStorage = (key: string, data: any): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
};

export const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return defaultValue;
  }
};

export const removeFromLocalStorage = (key: string): boolean => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
    return false;
  }
};

// Device utilities
export const isMobile = (): boolean => {
  return window.innerWidth < 768;
};

export const isTablet = (): boolean => {
  return window.innerWidth >= 768 && window.innerWidth < 1024;
};

export const isDesktop = (): boolean => {
  return window.innerWidth >= 1024;
};

export const supportsHaptics = (): boolean => {
  return 'vibrate' in navigator;
};

export const supportsWebAudio = (): boolean => {
  return 'AudioContext' in window || 'webkitAudioContext' in window;
};

// Performance utilities
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};