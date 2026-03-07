import { GameItem } from '../../types/index';
import { GameState } from '../../services/gameState';
import { TimerManager } from '../../services/timerManager';
import { OrientationDetector } from '../../services/orientationDetector';
import { FeedbackManager } from '../../services/feedbackManager';
import { ItemDatabase } from '../../services/itemDatabase';
import { CountdownManager } from '../../services/countdownManager';

/**
 * Test utilities for Heads Up game testing
 */

export interface MockGameItem extends GameItem {
  id: string;
  text: string;
  category: string;
}

export interface MockTriviaQuestion {
  id: string;
  question: string;
  answer: string;
  category: string;
  difficulty: string;
}

export interface TestGameState {
  score: number;
  isRoundActive: boolean;
  currentItem: MockGameItem | null;
  remainingTime: number;
  usedItems: string[];
  correctGuesses: number;
  skips: number;
}

/**
 * Factory for creating mock trivia questions
 */
export class MockTriviaQuestionFactory {
  static createMockQuestions(count: number, difficulty: string = 'Medium'): MockTriviaQuestion[] {
    return Array.from({ length: count }, (_, index) => ({
      id: `question-${index}`,
      question: `Mock Question ${index}`,
      answer: `Mock Answer ${index}`,
      category: 'Test Category',
      difficulty,
    }));
  }

  static createMockQuestion(id: string, question: string, answer: string, category: string, difficulty: string): MockTriviaQuestion {
    return {
      id,
      question,
      answer,
      category,
      difficulty,
    };
  }

  static createCategorizedQuestions(): MockTriviaQuestion[] {
    return [
      {
        id: 'science-1',
        question: 'What is the chemical symbol for water?',
        answer: 'H2O',
        category: 'Science',
        difficulty: 'Easy',
      },
      {
        id: 'science-2',
        question: 'What is the speed of light?',
        answer: '299,792,458 meters per second',
        category: 'Science',
        difficulty: 'Hard',
      },
      {
        id: 'history-1',
        question: 'Who was the first President of the United States?',
        answer: 'George Washington',
        category: 'History',
        difficulty: 'Easy',
      },
      {
        id: 'history-2',
        question: 'In which year did World War II end?',
        answer: '1945',
        category: 'History',
        difficulty: 'Medium',
      },
      {
        id: 'geography-1',
        question: 'What is the capital of France?',
        answer: 'Paris',
        category: 'Geography',
        difficulty: 'Easy',
      },
      {
        id: 'geography-2',
        question: 'What is the longest river in the world?',
        answer: 'Nile River',
        category: 'Geography',
        difficulty: 'Medium',
      },
      {
        id: 'sports-1',
        question: 'How many players are on a basketball team?',
        answer: '5',
        category: 'Sports',
        difficulty: 'Easy',
      },
      {
        id: 'sports-2',
        question: 'In which sport would you perform a slam dunk?',
        answer: 'Basketball',
        category: 'Sports',
        difficulty: 'Easy',
      },
      {
        id: 'entertainment-1',
        question: 'Who directed the movie "Jaws"?',
        answer: 'Steven Spielberg',
        category: 'Entertainment',
        difficulty: 'Medium',
      },
      {
        id: 'entertainment-2',
        question: 'Which movie won the Academy Award for Best Picture in 2020?',
        answer: 'Parasite',
        category: 'Entertainment',
        difficulty: 'Hard',
      },
    ];
  }
}

/**
 * Factory for creating mock game items
 */
export class MockGameItemFactory {
  static createMockItems(count: number): MockGameItem[] {
    return Array.from({ length: count }, (_, index) => ({
      id: `item-${index}`,
      text: `Test Item ${index}`,
      category: 'Test Category',
    }));
  }

  static createMockItem(id: string, text: string, category: string): MockGameItem {
    return {
      id,
      text,
      category,
    };
  }

  static createCategorizedItems(): MockGameItem[] {
    return [
      { id: 'animal-1', text: 'Elephant', category: 'Animals' },
      { id: 'animal-2', text: 'Lion', category: 'Animals' },
      { id: 'food-1', text: 'Pizza', category: 'Food' },
      { id: 'food-2', text: 'Sushi', category: 'Food' },
      { id: 'movie-1', text: 'Star Wars', category: 'Movies' },
      { id: 'movie-2', text: 'Titanic', category: 'Movies' },
    ];
  }
}

/**
 * Mock trivia database for testing
 */
export class MockTriviaDatabase {
  private questions: MockTriviaQuestion[] = [];
  private usedQuestionIds: Set<string> = new Set();
  private shouldError: boolean = false;

  constructor(questions?: MockTriviaQuestion[], shouldError: boolean = false) {
    this.questions = questions || MockTriviaQuestionFactory.createMockQuestions(10);
    this.shouldError = shouldError;
  }

  async initialize(): Promise<void> {
    if (this.shouldError) {
      throw new Error('Mock database initialization error');
    }
  }

  async getRandomQuestion(): Promise<MockTriviaQuestion> {
    if (this.questions.length === 0) {
      throw new Error('No trivia questions available');
    }

    // If all questions have been used, reset the used set to cycle back
    if (this.usedQuestionIds.size >= this.questions.length) {
      this.usedQuestionIds.clear();
    }

    // Get list of unused questions
    const unusedQuestions = this.questions.filter((q) => !this.usedQuestionIds.has(q.id));

    // If no unused questions remain, cycle back
    if (unusedQuestions.length === 0) {
      this.usedQuestionIds.clear();
      unusedQuestions.push(...this.questions);
    }

    // Select a random unused question
    const randomIndex = Math.floor(Math.random() * unusedQuestions.length);
    const selectedQuestion = unusedQuestions[randomIndex];
    this.usedQuestionIds.add(selectedQuestion.id);

    return selectedQuestion;
  }

  async getQuestionById(id: string): Promise<MockTriviaQuestion> {
    const question = this.questions.find((q) => q.id === id);
    if (!question) {
      throw new Error(`Question with id ${id} not found`);
    }
    return question;
  }

  async getQuestionsByCategory(category: string): Promise<MockTriviaQuestion[]> {
    return this.questions.filter((q) => q.category === category);
  }

  async getAllQuestions(): Promise<MockTriviaQuestion[]> {
    return [...this.questions];
  }

  async addQuestion(question: MockTriviaQuestion): Promise<void> {
    // Validate question
    if (!question.id || !question.question || !question.answer) {
      throw new Error('Invalid question: missing required fields');
    }

    // Check for duplicate ID
    if (this.questions.some(q => q.id === question.id)) {
      throw new Error(`Question with id ${question.id} already exists`);
    }

    this.questions.push(question);
  }

  getUsedQuestionIds(): string[] {
    return Array.from(this.usedQuestionIds);
  }

  resetUsedQuestions(): void {
    this.usedQuestionIds.clear();
  }

  getAvailableQuestions(): MockTriviaQuestion[] {
    return this.questions.filter(q => !this.usedQuestionIds.has(q.id));
  }

  setQuestions(questions: MockTriviaQuestion[]): void {
    this.questions = questions;
    this.usedQuestionIds.clear();
  }

  setShouldError(shouldError: boolean): void {
    this.shouldError = shouldError;
  }
}
  /**
 * Factory for creating mock game state
 */
export class MockGameStateFactory {
  static createInitialState(): TestGameState {
    return {
      score: 0,
      isRoundActive: false,
      currentItem: null,
      remainingTime: 60000,
      usedItems: [],
      correctGuesses: 0,
      skips: 0,
    };
  }

  static createActiveRoundState(score: number = 0): TestGameState {
    return {
      score,
      isRoundActive: true,
      currentItem: MockGameItemFactory.createMockItem('current', 'Current Item', 'Test'),
      remainingTime: 45000,
      usedItems: ['item-1', 'item-2'],
      correctGuesses: score,
      skips: 2,
    };
  }

  static createEndedRoundState(finalScore: number): TestGameState {
    return {
      score: finalScore,
      isRoundActive: false,
      currentItem: null,
      remainingTime: 0,
      usedItems: ['item-1', 'item-2', 'item-3'],
      correctGuesses: finalScore,
      skips: 1,
    };
  }
}

/**
 * Mock service classes for testing
 */
export class MockTimerManager {
  private callbacks: Array<(time: number) => void> = [];
  private isRunning = false;
  private currentTime = 60000;
  private duration = 60;

  initialize(duration: number): void {
    this.duration = duration > 0 ? duration : 60;
    this.currentTime = duration * 1000;
    this.isRunning = false;
  }

  start(): void {
    this.isRunning = true;
    this.currentTime = this.duration * 1000;
  }

  stop(): void {
    this.isRunning = false;
  }

  pause(): void {
    this.isRunning = false;
  }

  resume(): void {
    this.isRunning = true;
  }

  getRemainingTime(): number {
    return this.currentTime;
  }

  isTimerRunning(): boolean {
    return this.isRunning;
  }

  setOnTimerUpdate(callback: (remainingMs: number) => void): void {
    this.callbacks.push(callback);
  }

  setOnRoundEnd(callback: () => void): void {
    // Store callback for round end
  }

  // Test helper methods
  simulateTimeElapsed(elapsedMs: number): void {
    this.currentTime = Math.max(0, this.currentTime - elapsedMs);
    this.callbacks.forEach(callback => callback(this.currentTime));
  }

  simulateTimerComplete(): void {
    this.currentTime = 0;
    this.callbacks.forEach(callback => callback(0));
    this.isRunning = false;
  }
}

export class MockOrientationDetector {
  private orientationCallbacks: Array<(action: 'CORRECT' | 'SKIP') => void> = [];
  private currentOrientation = 'FACE_UP';
  private isListening = false;

  startListening(): void {
    this.isListening = true;
  }

  addCallback(callback: (action: 'CORRECT' | 'SKIP') => void): void {
    this.orientationCallbacks.push(callback);
  }

  stopListening(): void {
    this.orientationCallbacks = [];
    this.isListening = false;
  }

  getCurrentOrientation(): string {
    return this.currentOrientation;
  }

  isDeviceListening(): boolean {
    return this.isListening;
  }

  // Test helper methods
  simulateOrientationChange(orientation: string): void {
    this.currentOrientation = orientation;
    const action = orientation === 'FACE_DOWN' ? 'CORRECT' : 'SKIP';
    this.orientationCallbacks.forEach(callback => callback(action));
  }

  simulateUpright(): void {
    this.simulateOrientationChange('FACE_UP');
  }

  simulateTiltedDown(): void {
    this.simulateOrientationChange('FACE_DOWN');
  }
}

export class MockFeedbackManager extends FeedbackManager {
  private feedbackHistory: Array<{ type: string; timestamp: number }> = [];

  playCorrectSound(): void {
    this.feedbackHistory.push({ type: 'correct', timestamp: Date.now() });
  }

  playSkipSound(): void {
    this.feedbackHistory.push({ type: 'skip', timestamp: Date.now() });
  }

  playGameOverSound(): void {
    this.feedbackHistory.push({ type: 'gameOver', timestamp: Date.now() });
  }

  triggerHapticFeedback(): void {
    this.feedbackHistory.push({ type: 'haptic', timestamp: Date.now() });
  }

  // Test helper methods
  getFeedbackHistory(): Array<{ type: string; timestamp: number }> {
    return [...this.feedbackHistory];
  }

  clearFeedbackHistory(): void {
    this.feedbackHistory = [];
  }

  getFeedbackCount(type?: string): number {
    if (type) {
      return this.feedbackHistory.filter(f => f.type === type).length;
    }
    return this.feedbackHistory.length;
  }
}

export class MockItemDatabase {
  private items: MockGameItem[] = [];
  private usedItems: Set<string> = new Set();

  constructor(items?: MockGameItem[]) {
    this.items = items || MockGameItemFactory.createMockItems(10);
  }

  async initialize(): Promise<void> {
    // Mock initialization
  }

  async getRandomItem(): Promise<GameItem> {
    const availableItems = this.items.filter(item => !this.usedItems.has(item.id));
    
    if (availableItems.length === 0) {
      // Return a random item if all have been used (cycle back)
      const randomIndex = Math.floor(Math.random() * this.items.length);
      return this.items[randomIndex];
    }

    const randomIndex = Math.floor(Math.random() * availableItems.length);
    const selectedItem = availableItems[randomIndex];
    this.usedItems.add(selectedItem.id);

    return selectedItem;
  }

  async getItemById(id: string): Promise<GameItem> {
    const item = this.items.find(item => item.id === id);
    if (!item) {
      throw new Error(`Item with id ${id} not found`);
    }
    return item;
  }

  async getItemsByCategory(category: string): Promise<GameItem[]> {
    return this.items.filter(item => item.category === category);
  }

  async getAllItems(): Promise<GameItem[]> {
    return [...this.items];
  }

  markItemAsUsed(itemId: string): void {
    this.usedItems.add(itemId);
  }

  resetUsedItems(): void {
    this.usedItems.clear();
  }

  // Test helper methods
  getUsedItems(): string[] {
    return Array.from(this.usedItems);
  }

  getAvailableItems(): MockGameItem[] {
    return this.items.filter(item => !this.usedItems.has(item.id));
  }

  addItem(item: MockGameItem): void {
    this.items.push(item);
  }

  removeItem(itemId: string): void {
    this.items = this.items.filter(item => item.id !== itemId);
    this.usedItems.delete(itemId);
  }
}

export class MockCountdownManager {
  private countdownCallbacks: Array<(message: string) => void> = [];
  private currentMessage = '';
  private isCountingDown = false;

  async startCountdown(): Promise<void> {
    this.isCountingDown = true;
    this.currentMessage = 'Get Ready...';
    this.countdownCallbacks.forEach(callback => callback(this.currentMessage));
  }

  stopCountdown(): void {
    this.isCountingDown = false;
    this.countdownCallbacks = [];
  }

  getCurrentMessage(): string {
    return this.currentMessage;
  }

  isCountdownActive(): boolean {
    return this.isCountingDown;
  }

  setCallback(callback: (message: string) => void): void {
    this.countdownCallbacks.push(callback);
  }

  // Test helper methods
  simulateCountdownStep(message: string): void {
    this.currentMessage = message;
    this.countdownCallbacks.forEach(callback => callback(message));
  }

  simulateCompleteCountdown(): void {
    this.simulateCountdownStep('Go!');
    this.isCountingDown = false;
  }
}

/**
 * Test helper functions
 */
export class TestHelpers {
  static async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static createMockGameState(): GameState {
    const gameState = new GameState();
    return gameState;
  }

  static simulateGameActions(
    gameState: GameState,
    actions: Array<{ type: 'CORRECT' | 'SKIP'; itemId: string }>
  ): void {
    actions.forEach(action => {
      if (action.type === 'CORRECT') {
        gameState.registerCorrectGuess(action.itemId);
      } else {
        gameState.registerSkip(action.itemId);
      }
    });
  }

  static generateRandomActions(count: number): Array<{ type: 'CORRECT' | 'SKIP'; itemId: string }> {
    return Array.from({ length: count }, (_, index) => ({
      type: Math.random() > 0.5 ? 'CORRECT' : 'SKIP',
      itemId: `item-${index}`,
    }));
  }

  static calculateExpectedScore(actions: Array<{ type: 'CORRECT' | 'SKIP' }>): number {
    return actions.filter(action => action.type === 'CORRECT').length;
  }

  static async waitForCondition(
    condition: () => boolean,
    timeout: number = 5000,
    interval: number = 100
  ): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (condition()) {
        return true;
      }
      await this.delay(interval);
    }
    
    return false;
  }

  static createMockNavigation() {
    const navigate = jest.fn();
    const goBack = jest.fn();
    const reset = jest.fn();
    
    return {
      navigate,
      goBack,
      reset,
      setParams: jest.fn(),
      dispatch: jest.fn(),
      isFocused: jest.fn(() => true),
      canGoBack: jest.fn(() => true),
      getId: jest.fn(() => 'test-id'),
    };
  }

  static createMockRoute(params?: any) {
    return {
      key: 'test-route',
      name: 'TestScreen',
      params: params || {},
    };
  }
}

/**
 * Performance testing utilities
 */
export class PerformanceTestUtils {
  static measureExecutionTime<T>(
    fn: () => T | Promise<T>,
    iterations: number = 1
  ): Promise<{ result: T; averageTime: number; totalTime: number }> {
    return new Promise(async (resolve) => {
      const results: T[] = [];
      const times: number[] = [];
      
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        const result = await fn();
        const end = performance.now();
        
        results.push(result);
        times.push(end - start);
      }
      
      const totalTime = times.reduce((sum, time) => sum + time, 0);
      const averageTime = totalTime / iterations;
      
      resolve({
        result: results[0],
        averageTime,
        totalTime,
      });
    });
  }

  static async stressTest(
    testName: string,
    testFn: () => Promise<void>,
    concurrency: number = 10,
    iterations: number = 100
  ): Promise<{ passed: boolean; errors: Error[]; totalTime: number }> {
    const errors: Error[] = [];
    const start = performance.now();
    
    const promises = Array.from({ length: concurrency }, async () => {
      for (let i = 0; i < iterations; i++) {
        try {
          await testFn();
        } catch (error) {
          errors.push(error as Error);
        }
      }
    });
    
    await Promise.all(promises);
    const totalTime = performance.now() - start;
    
    return {
      passed: errors.length === 0,
      errors,
      totalTime,
    };
  }
}
