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
  teamsScore: number[];
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

/**
 * QuestionPack represents a collection of custom trivia questions
 */
export interface QuestionPack {
  id: string;
  name: string;
  description?: string;
  author?: string;
  category?: string;
  difficulty?: string;
  questionCount: number;
  isPublic: boolean;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
}

/**
 * PackQuestion represents a question within a question pack
 */
export interface PackQuestion {
  id: string;
  packId: string;
  question: string;
  answer: string;
  category?: string;
  difficulty?: string;
  orderIndex: number;
}

/**
 * ExportableQuestionPack represents the structure for import/export
 */
export interface ExportableQuestionPack {
  name: string;
  description?: string;
  author?: string;
  category?: string;
  difficulty?: string;
  tags?: string[];
  questions: {
    question: string;
    answer: string;
    category?: string;
    difficulty?: string;
  }[];
  version: string;
  exportedAt: number;
}
