// App Constants
export const APP_NAME = 'Kickoff';
export const APP_VERSION = '1.0.0';

// Timer Constants
export const DEFAULT_MATCH_DURATION = 8; // minutes
export const TIMER_UPDATE_INTERVAL = 1000; // milliseconds
export const WARNING_TIME_THRESHOLD = 10; // seconds

// Animation Constants
export const ANIMATION_DURATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
  EXTRA_SLOW: 800
};

export const SPRING_CONFIG = {
  GENTLE: { tension: 120, friction: 14 },
  WOBBLY: { tension: 180, friction: 12 },
  STIFF: { tension: 210, friction: 20 },
  SLOW: { tension: 280, friction: 60 }
};

// Player Constants
export const MIN_PLAYERS_PER_TEAM = 3;
export const MAX_PLAYERS_PER_TEAM = 11;
export const MIN_TEAMS = 2;
export const MAX_TEAMS = 6;

// Skill Level Constants
export const SKILL_LEVEL_RANGE = [1, 2, 3, 4, 5];
export const SKILL_LEVEL_LABELS = {
  1: 'Beginner',
  2: 'Casual',
  3: 'Regular',
  4: 'Skilled',
  5: 'Expert'
};

export const SKILL_LEVEL_DESCRIPTIONS = {
  1: 'New to soccer, learning basics',
  2: 'Plays occasionally, knows the rules',
  3: 'Plays regularly, good fundamentals',
  4: 'Experienced player, strong skills',
  5: 'Highly skilled, competitive level'
};

// Team Colors and Names
export const TEAM_COLOR_PALETTE = {
  BLACK: '#1A1A1A',
  WHITE: '#F8F8F8',
  ORANGE: '#FF6B35',
  BLUE: '#0084FF',
  YELLOW: '#FFD93D',
  PURPLE_START: '#667eea',
  PURPLE_END: '#764ba2'
};

export const DEFAULT_TEAM_NAMES = [
  'Team Alpha',
  'Team Beta',
  'Team Gamma',
  'Team Delta',
  'Team Epsilon',
  'Team Zeta'
];

// Scoring Constants
export const POINTS_FOR_WIN = 3;
export const POINTS_FOR_DRAW = 1;
export const POINTS_FOR_LOSS = 0;

// Local Storage Keys
export const STORAGE_KEYS = {
  GAME_STATE: 'kickoff-game-state',
  SETTINGS: 'kickoff-settings',
  SOUND_SETTINGS: 'kickoff-sound-settings',
  THEME: 'kickoff-theme'
};

// Sound Effect Constants
export const SOUND_FILES = {
  WHISTLE: '/sounds/whistle.mp3',
  GOAL: '/sounds/goal.mp3',
  CLICK: '/sounds/click.mp3',
  TIMER_END: '/sounds/timer-end.mp3'
};

export const DEFAULT_SOUND_SETTINGS = {
  enabled: true,
  volume: 0.7,
  effects: {
    whistle: true,
    goal: true,
    click: false,
    timerEnd: true
  }
};

// Haptic Feedback Patterns
export const HAPTIC_PATTERNS = {
  LIGHT: [10],
  MEDIUM: [20],
  HEAVY: [30],
  SUCCESS: [10, 10, 10],
  WARNING: [50, 30, 50],
  ERROR: [100, 50, 100, 50, 100]
};

// Screen Breakpoints
export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1280
};

// Z-Index Layers
export const Z_INDEX = {
  BACKGROUND: 0,
  CONTENT: 1,
  FLOATING: 10,
  MODAL_BACKDROP: 1000,
  MODAL: 1001,
  TOAST: 1100,
  TOOLTIP: 1200
};

// Match Status Colors
export const STATUS_COLORS = {
  SCHEDULED: '#6B7280',
  IN_PROGRESS: '#F59E0B',
  COMPLETED: '#10B981',
  CANCELLED: '#EF4444'
};

// Field Dimensions (for visual elements)
export const FIELD_DIMENSIONS = {
  WIDTH: 100,
  HEIGHT: 64,
  GOAL_WIDTH: 8,
  GOAL_HEIGHT: 2.44,
  PENALTY_AREA_WIDTH: 16.5,
  PENALTY_AREA_HEIGHT: 40.3
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  INSUFFICIENT_PLAYERS: 'Not enough players to form teams.',
  INVALID_TEAM_COUNT: 'Invalid number of teams selected.',
  SCHEDULE_GENERATION_FAILED: 'Failed to generate schedule. Please try again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  PLAYER_ADDED: 'Player added successfully!',
  TEAMS_GENERATED: 'Teams generated successfully!',
  SCHEDULE_CREATED: 'Schedule created successfully!',
  MATCH_STARTED: 'Match started!',
  MATCH_COMPLETED: 'Match completed!',
  DATA_EXPORTED: 'Data exported successfully!',
  DATA_IMPORTED: 'Data imported successfully!'
};

// Validation Rules
export const VALIDATION_RULES = {
  PLAYER_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 30,
    PATTERN: /^[a-zA-Z\s'-]+$/
  },
  TEAM_NAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    PATTERN: /^[a-zA-Z0-9\s'-]+$/
  },
  MATCH_DURATION: {
    MIN: 5,
    MAX: 90
  },
  GAMES_PER_TEAM: {
    MIN: 1,
    MAX: 10
  }
};

// PWA Constants
export const PWA_CONFIG = {
  THEME_COLOR: '#00DC82',
  BACKGROUND_COLOR: '#0A0E27',
  DISPLAY: 'standalone',
  ORIENTATION: 'portrait'
};

// API Endpoints (for future features)
export const API_ENDPOINTS = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  PLAYERS: '/api/players',
  TEAMS: '/api/teams',
  MATCHES: '/api/matches',
  STANDINGS: '/api/standings'
};

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_SOUND: true,
  ENABLE_HAPTICS: true,
  ENABLE_PWA: true,
  ENABLE_EXPORT: true,
  ENABLE_ANALYTICS: false,
  ENABLE_MULTIPLAYER: false
};

// Time Formats
export const TIME_FORMATS = {
  MATCH_TIMER: 'mm:ss',
  TIMESTAMP: 'HH:mm:ss',
  DATE: 'MMM dd, yyyy',
  DATETIME: 'MMM dd, yyyy HH:mm'
};