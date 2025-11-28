import { GameState } from './gameState';
import { ItemDatabase } from './itemDatabase';
import { OrientationDetector } from './orientationDetector';
import { TimerManager } from './timerManager';
import { FeedbackManager } from './feedbackManager';
import { GameRound, GameItem } from '../types/index';

/**
 * GameManager orchestrates the complete game flow, wiring together all components
 * for game initialization, round management, and lifecycle handling
 */
export class GameManager {
  private gameState: GameState;
  private itemDatabase: ItemDatabase;
  private orientationDetector: OrientationDetector;
  private timerManager: TimerManager;
  private feedbackManager: FeedbackManager;

  private currentItem: GameItem | null = null;
  private isInitialized: boolean = false;

  // Callbacks
  private onItemChange: ((item: GameItem | null) => void) | null = null;
  private onScoreChange: ((score: number) => void) | null = null;
  private onTimerUpdate: ((remainingMs: number) => void) | null = null;
  private onRoundEnd: ((finalScore: number) => void) | null = null;
  private onRoundStart: ((round: GameRound) => void) | null = null;

  constructor() {
    this.gameState = new GameState();
    this.itemDatabase = new ItemDatabase();
    this.orientationDetector = new OrientationDetector();
    this.timerManager = new TimerManager();
    this.feedbackManager = new FeedbackManager();
  }

  /**
   * Initialize the game manager and all components
   */
  async initialize(): Promise<void> {
    try {
      await this.itemDatabase.initialize();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize GameManager:', error);
      throw error;
    }
  }

  /**
   * Start a new round with optional custom duration
   * @param duration - Round duration in seconds (defaults to 60)
   */
  async startRound(duration?: number): Promise<GameRound> {
    if (!this.isInitialized) {
      throw new Error('GameManager not initialized. Call initialize() first.');
    }

    // Reset state for new round
    this.gameState.reset();
    this.itemDatabase.resetRound();

    // Start the round
    const round = this.gameState.startRound(duration);

    // Set up timer
    this.timerManager.initialize(round.duration);
    this.timerManager.setOnTimerUpdate(() => {
      const remaining = this.timerManager.getRemainingTime();
      if (this.onTimerUpdate) {
        this.onTimerUpdate(remaining);
      }
    });

    this.timerManager.setOnRoundEnd(() => {
      this.endRound();
    });

    // Set up orientation detection
    this.orientationDetector.onOrientationChange((action) => {
      if (!this.gameState.isRoundActive()) {
        return;
      }
      this.handleAction(action);
    });

    this.orientationDetector.startListening();

    // Display first item
    try {
      const item = await this.itemDatabase.getRandomItem();
      this.currentItem = item;
      if (this.onItemChange) {
        this.onItemChange(item);
      }
    } catch (error) {
      console.error('Failed to get first item:', error);
    }

    // Start timer
    this.timerManager.start();

    // Notify round start
    if (this.onRoundStart) {
      this.onRoundStart(round);
    }

    return round;
  }

  /**
   * End the current round
   */
  endRound(): void {
    this.gameState.endRound();
    this.timerManager.stop();
    this.orientationDetector.stopListening();

    const finalScore = this.gameState.getCurrentScore();
    if (this.onRoundEnd) {
      this.onRoundEnd(finalScore);
    }
  }

  /**
   * Handle a game action (correct guess or skip)
   */
  private async handleAction(action: string): Promise<void> {
    if (!this.currentItem) {
      return;
    }

    const actionType = action === 'CORRECT' ? 'CORRECT' : 'SKIP';

    if (action === 'CORRECT') {
      this.gameState.registerCorrectGuess(this.currentItem.id);
    } else if (action === 'SKIP') {
      this.gameState.registerSkip(this.currentItem.id);
    }

    // Generate feedback
    this.feedbackManager.generateFeedback({
      type: actionType,
      timestamp: Date.now(),
      itemId: this.currentItem.id,
    });

    // Update score
    const newScore = this.gameState.getCurrentScore();
    if (this.onScoreChange) {
      this.onScoreChange(newScore);
    }

    // Display next item
    try {
      const nextItem = await this.itemDatabase.getRandomItem();
      this.currentItem = nextItem;
      if (this.onItemChange) {
        this.onItemChange(nextItem);
      }
    } catch (error) {
      console.error('Failed to get next item:', error);
    }
  }

  /**
   * Get the current game state
   */
  getGameState(): GameState {
    return this.gameState;
  }

  /**
   * Get the current item
   */
  getCurrentItem(): GameItem | null {
    return this.currentItem;
  }

  /**
   * Get the current score
   */
  getCurrentScore(): number {
    return this.gameState.getCurrentScore();
  }

  /**
   * Check if a round is currently active
   */
  isRoundActive(): boolean {
    return this.gameState.isRoundActive();
  }

  /**
   * Register callback for item changes
   */
  setOnItemChange(callback: (item: GameItem | null) => void): void {
    this.onItemChange = callback;
  }

  /**
   * Register callback for score changes
   */
  setOnScoreChange(callback: (score: number) => void): void {
    this.onScoreChange = callback;
  }

  /**
   * Register callback for timer updates
   */
  setOnTimerUpdate(callback: (remainingMs: number) => void): void {
    this.onTimerUpdate = callback;
  }

  /**
   * Register callback for round end
   */
  setOnRoundEnd(callback: (finalScore: number) => void): void {
    this.onRoundEnd = callback;
  }

  /**
   * Register callback for round start
   */
  setOnRoundStart(callback: (round: GameRound) => void): void {
    this.onRoundStart = callback;
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.orientationDetector.stopListening();
    this.timerManager.stop();
  }
}
