/**
 * GameRound represents a single gameplay session
 */
export interface GameRound {
  id: string;
  duration: number; // in seconds
  startTime: number; // timestamp
  currentScore: number;
  isActive: boolean;
  itemsUsed: string[];
}

/**
 * GameItem represents a word or phrase to be guessed
 */
export interface GameItem {
  id: string;
  text: string;
  category?: string;
}

/**
 * DeviceOrientation represents the physical rotation state of the device
 */
export interface DeviceOrientation {
  x: number; // pitch
  y: number; // roll
  z: number; // yaw
  timestamp: number;
}

/**
 * GameAction represents an action taken by the phone holder
 */
export interface GameAction {
  type: 'CORRECT' | 'SKIP';
  timestamp: number;
  itemId: string;
}

/**
 * TriviaQuestion represents a trivia question with answer
 */
export interface TriviaQuestion {
  id: string;
  question: string;
  answer: string;
  category?: string;
  difficulty?: string;
}
