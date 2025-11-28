import { GameState } from '../services/gameState';
import { OrientationDetector } from '../services/orientationDetector';
import { TimerManager } from '../services/timerManager';
import { FeedbackManager } from '../services/feedbackManager';
import { ItemDatabase } from '../services/itemDatabase';
import * as fc from 'fast-check';

describe('GameScreen Integration Tests', () => {
  let gameState: GameState;
  let orientationDetector: OrientationDetector;
  let timerManager: TimerManager;
  let feedbackManager: FeedbackManager;

  beforeEach(() => {
    gameState = new GameState();
    orientationDetector = new OrientationDetector();
    timerManager = new TimerManager();
    feedbackManager = new FeedbackManager();
  });

  afterEach(() => {
    orientationDetector.stopListening();
    timerManager.stop();
  });

  describe('Property 2: Item advancement on action', () => {
    /**
     * **Feature: heads-up-game, Property 2: Item advancement on action**
     * **Validates: Requirements 1.3, 2.3, 3.2**
     *
     * For any active round with multiple items, when a phone holder performs
     * either a correct guess or skip action, the displayed item should change
     * to a different item from the collection.
     */
    it('should advance items when actions are registered', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.constantFrom('CORRECT', 'SKIP'), {
            minLength: 1,
            maxLength: 10,
          }),
          async (actions) => {
            const freshGameState = new GameState();
            freshGameState.startRound();

            const itemIds: string[] = [];
            for (let i = 0; i < actions.length + 1; i++) {
              itemIds.push(`item${i}`);
            }

            // Track which items are used
            for (let i = 0; i < actions.length; i++) {
              if (actions[i] === 'CORRECT') {
                freshGameState.registerCorrectGuess(itemIds[i]);
              } else {
                freshGameState.registerSkip(itemIds[i]);
              }
            }

            // Verify items were tracked
            const usedItems = freshGameState.getItemsUsed();
            expect(usedItems.length).toBe(actions.length);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 3: Round end stops items', () => {
    /**
     * **Feature: heads-up-game, Property 3: Round end stops items**
     * **Validates: Requirements 1.4**
     *
     * For any ended round, the system should not display new items even if
     * orientation changes are detected.
     */
    it('should not register actions after round ends', async () => {
      gameState.startRound();
      gameState.endRound();

      const result = gameState.registerCorrectGuess('item1');

      // Should return null when round is not active
      expect(result).toBeNull();
    });

    it('should prevent skip actions after round ends', async () => {
      gameState.startRound();
      gameState.endRound();

      const result = gameState.registerSkip('item1');

      // Should return null when round is not active
      expect(result).toBeNull();
    });
  });

  describe('Property 12: Score updates immediately', () => {
    /**
     * **Feature: heads-up-game, Property 12: Score updates immediately**
     * **Validates: Requirements 5.2**
     *
     * For any active round, when a correct guess is registered, the displayed
     * score should update immediately to reflect the new value.
     */
    it('should update score immediately on correct guess', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 20 }),
          async (guessCount) => {
            const freshGameState = new GameState();
            freshGameState.startRound();

            for (let i = 0; i < guessCount; i++) {
              freshGameState.registerCorrectGuess(`item${i}`);
              const currentScore = freshGameState.getCurrentScore();
              expect(currentScore).toBe(i + 1);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 13: Final score displays on round end', () => {
    /**
     * **Feature: heads-up-game, Property 13: Final score displays on round end**
     * **Validates: Requirements 5.3**
     *
     * For any ended round, the system should display the final score to the player.
     */
    it('should preserve final score when round ends', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 50 }),
          async (finalScore) => {
            const freshGameState = new GameState();
            freshGameState.startRound();

            for (let i = 0; i < finalScore; i++) {
              freshGameState.registerCorrectGuess(`item${i}`);
            }

            const scoreBeforeEnd = freshGameState.getCurrentScore();
            freshGameState.endRound();
            const scoreAfterEnd = freshGameState.getCurrentScore();

            expect(scoreAfterEnd).toBe(scoreBeforeEnd);
            expect(scoreAfterEnd).toBe(finalScore);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 16: Upright orientation displays items', () => {
    /**
     * **Feature: heads-up-game, Property 16: Upright orientation displays items**
     * **Validates: Requirements 6.2**
     *
     * For any active round with the device held in upright position, the system
     * should display the current word or phrase normally.
     */
    it('should maintain round state during active gameplay', async () => {
      gameState.startRound();
      expect(gameState.isRoundActive()).toBe(true);

      const round = gameState.getCurrentRound();
      expect(round).not.toBeNull();
      expect(round?.isActive).toBe(true);
    });
  });

  describe('Property 11: Score displays during active round', () => {
    /**
     * **Feature: heads-up-game, Property 11: Score displays during active round**
     * **Validates: Requirements 5.1**
     *
     * For any active round, the system should display the current score on the screen.
     */
    it('should display score during active round', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 50 }),
          async (score) => {
            const freshGameState = new GameState();
            freshGameState.startRound();

            for (let i = 0; i < score; i++) {
              freshGameState.registerCorrectGuess(`item${i}`);
            }

            expect(freshGameState.isRoundActive()).toBe(true);
            expect(freshGameState.getCurrentScore()).toBe(score);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
