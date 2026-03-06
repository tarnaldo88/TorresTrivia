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
export class MockTimerManager extends TimerManager {
  private callbacks: Array<(time: number) => void> = [];
  private isRunning = false;
  private currentTime = 60000;

  start(duration: number, callback: (time: number) => void): void {
    this.isRunning = true;
    this.currentTime = duration;
    this.callbacks.push(callback);
  }

  stop(): void {
    this.isRunning = false;
    this.callbacks = [];
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

export class MockOrientationDetector extends OrientationDetector {
  private orientationCallbacks: Array<(orientation: string) => void> = [];
  private currentOrientation = 'FACE_UP';
  private isListening = false;

  startListening(callback: (orientation: string) => void): void {
    this.orientationCallbacks.push(callback);
    this.isListening = true;
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
    this.orientationCallbacks.forEach(callback => callback(orientation));
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

export class MockItemDatabase extends ItemDatabase {
  private items: MockGameItem[] = [];
  private usedItems: Set<string> = new Set();

  constructor(items?: MockGameItem[]) {
    super();
    this.items = items || MockGameItemFactory.createMockItems(10);
  }

  async getRandomItem(): Promise<GameItem | null> {
    const availableItems = this.items.filter(item => !this.usedItems.has(item.id));
    
    if (availableItems.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * availableItems.length);
    const selectedItem = availableItems[randomIndex];
    this.usedItems.add(selectedItem.id);

    return selectedItem;
  }

  async getItemById(id: string): Promise<GameItem | null> {
    return this.items.find(item => item.id === id) || null;
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

export class MockCountdownManager extends CountdownManager {
  private countdownCallbacks: Array<(message: string) => void> = [];
  private currentMessage = '';
  private isCountingDown = false;

  startCountdown(callback: (message: string) => void): void {
    this.countdownCallbacks.push(callback);
    this.isCountingDown = true;
    this.currentMessage = 'Get Ready...';
    callback(this.currentMessage);
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
