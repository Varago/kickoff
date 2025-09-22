export interface Player {
  id: string;
  name: string;
  skillLevel: number; // 1-4
  isWaitlist: boolean;
  signupOrder: number;
  createdAt: Date;
  isCaptain?: boolean;
}

export interface Team {
  id: string;
  name: string;
  color: TeamColor;
  players: Player[];
  captainIds: string[];
  averageSkill: number;
}

export interface Match {
  id: string;
  gameNumber: number;
  teamAId: string;
  teamBId: string;
  scoreA: number;
  scoreB: number;
  status: 'scheduled' | 'in-progress' | 'completed';
  startTime?: Date;
  endTime?: Date;
  duration: number; // in minutes
}

export interface GameSettings {
  teamsCount: number;
  playersPerTeam: number;
  matchDuration: number; // minutes
  gamesPerTeam: number;
  fieldNumber?: number;
}

export interface Standing {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export type TeamColor = 'black' | 'white' | 'orange' | 'blue' | 'yellow' | 'red' | 'green' | 'purple' | 'pink' | 'teal' | 'no-pennies';

export interface GameState {
  players: Player[];
  teams: Team[];
  matches: Match[];
  settings: GameSettings;
  currentMatchId: string | null;
  currentMatch: Match | null;
  standings: Standing[];
  timerState: TimerState;
  tournamentName: string;
}

export interface TimerState {
  timeRemaining: number; // seconds
  isRunning: boolean;
  isPaused: boolean;
}

export interface DragDropResult {
  draggableId: string;
  type: string;
  source: {
    droppableId: string;
    index: number;
  };
  destination: {
    droppableId: string;
    index: number;
  } | null;
}

export interface SoundSettings {
  enabled: boolean;
  volume: number;
}

export interface HapticSettings {
  enabled: boolean;
  intensity: 'light' | 'medium' | 'heavy';
}

export interface AppSettings {
  sounds: SoundSettings;
  haptics: HapticSettings;
  theme: 'dark' | 'light';
}

export interface WaitlistPlayer extends Player {
  position: number;
  estimatedWaitTime?: number;
}

export interface SubstitutionRequest {
  id: string;
  playerOutId: string;
  playerInId: string;
  teamId: string;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
}

export interface MatchEvent {
  id: string;
  matchId: string;
  type: 'goal' | 'substitution' | 'timeout' | 'start' | 'end';
  timestamp: Date;
  teamId?: string;
  playerId?: string;
  details?: any;
}

export const TEAM_COLORS: Record<TeamColor, { name: string; bg: string; text: string; accent: string }> = {
  'black': {
    name: 'Black',
    bg: 'bg-team-black',
    text: 'text-white',
    accent: 'border-white'
  },
  'white': {
    name: 'White',
    bg: 'bg-team-white',
    text: 'text-black',
    accent: 'border-black'
  },
  'orange': {
    name: 'Orange',
    bg: 'bg-team-orange',
    text: 'text-white',
    accent: 'border-orange-300'
  },
  'blue': {
    name: 'Blue',
    bg: 'bg-team-blue',
    text: 'text-white',
    accent: 'border-blue-300'
  },
  'yellow': {
    name: 'Yellow',
    bg: 'bg-team-yellow',
    text: 'text-black',
    accent: 'border-yellow-600'
  },
  'red': {
    name: 'Red',
    bg: 'bg-team-red',
    text: 'text-white',
    accent: 'border-red-300'
  },
  'green': {
    name: 'Green',
    bg: 'bg-team-green',
    text: 'text-white',
    accent: 'border-green-300'
  },
  'purple': {
    name: 'Purple',
    bg: 'bg-team-purple',
    text: 'text-white',
    accent: 'border-purple-300'
  },
  'pink': {
    name: 'Pink',
    bg: 'bg-team-pink',
    text: 'text-white',
    accent: 'border-pink-300'
  },
  'teal': {
    name: 'Teal',
    bg: 'bg-team-teal',
    text: 'text-white',
    accent: 'border-teal-300'
  },
  'no-pennies': {
    name: 'No Pennies',
    bg: 'team-gradient',
    text: 'text-white',
    accent: 'border-purple-300'
  }
};

export const TEAM_COLOR_OPTIONS: TeamColor[] = ['black', 'white', 'orange', 'blue', 'yellow', 'red', 'green', 'purple', 'pink', 'teal', 'no-pennies'];

export const SKILL_LEVELS = [
  { value: 1, label: 'Beginner', description: 'New to soccer' },
  { value: 2, label: 'Casual', description: 'Plays occasionally' },
  { value: 3, label: 'Regular', description: 'Plays weekly' },
  { value: 4, label: 'Expert', description: 'Highly skilled' }
];

export const DEFAULT_SETTINGS: GameSettings = {
  teamsCount: 2,
  playersPerTeam: 5,
  matchDuration: 8,
  gamesPerTeam: 3,
  fieldNumber: 1
};

export const SCORING_SYSTEM = {
  WIN_POINTS: 3,
  DRAW_POINTS: 1,
  LOSS_POINTS: 0
};

export interface NavigationRoute {
  path: string;
  name: string;
  icon: string;
  component: React.ComponentType;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface AnimationVariants {
  initial: any;
  animate: any;
  exit?: any;
  transition?: any;
}