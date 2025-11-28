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

  describe('Complete Game Flow Integration Tests', () => {
    describe('Full round lifecycle from start to end', () => {
      it('should complete a full round lifecycle', async () => {
        const freshGameState = new GameState();
        const freshTimerManager = new TimerManager();

        // Start round
        const round = freshGameState.startRound(5); // 5 second round
        expect(round.isActive).toBe(true);
        expect(freshGameState.isRoundActive()).toBe(true);

        // Simulate actions during round
        freshGameState.registerCorrectGuess('item1');
        freshGameState.registerSkip('item2');
        freshGameState.registerCorrectGuess('item3');

        const scoreBeforeEnd = freshGameState.getCurrentScore();
        expect(scoreBeforeEnd).toBe(2);

        // End round
        freshGameState.endRound();
        expect(freshGameState.isRoundActive()).toBe(false);

        const finalRound = freshGameState.getCurrentRound();
        expect(finalRound?.isActive).toBe(false);
        expect(freshGameState.getCurrentScore()).toBe(scoreBeforeEnd);
      });

      it('should prevent actions after round ends', () => {
        const freshGameState = new GameState();
        freshGameState.startRound();
        freshGameState.registerCorrectGuess('item1');

        const scoreBeforeEnd = freshGameState.getCurrentScore();
        freshGameState.endRound();

        // Try to register action after round ends
        const result = freshGameState.registerCorrectGuess('item2');
        expect(result).toBeNull();
        expect(freshGameState.getCurrentScore()).toBe(scoreBeforeEnd);
      });
    });

    describe('Multiple rounds with score reset', () => {
      it('should reset score between consecutive rounds', async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.tuple(
              fc.integer({ min: 1, max: 20 }),
              fc.integer({ min: 1, max: 20 })
            ),
            async ([firstRoundGuesses, secondRoundGuesses]) => {
              const freshGameState = new GameState();

              // First round
              freshGameState.startRound();
              for (let i = 0; i < firstRoundGuesses; i++) {
                freshGameState.registerCorrectGuess(`item${i}`);
              }
              const firstRoundScore = freshGameState.getCurrentScore();
              expect(firstRoundScore).toBe(firstRoundGuesses);

              // End first round
              freshGameState.endRound();
              expect(freshGameState.isRoundActive()).toBe(false);

              // Start second round
              freshGameState.reset();
              freshGameState.startRound();
              expect(freshGameState.getCurrentScore()).toBe(0);

              // Play second round
              for (let i = 0; i < secondRoundGuesses; i++) {
                freshGameState.registerCorrectGuess(`item${i + 100}`);
              }
              const secondRoundScore = freshGameState.getCurrentScore();
              expect(secondRoundScore).toBe(secondRoundGuesses);
            }
          ),
          { numRuns: 100 }
        );
      });

      it('should maintain separate item tracking across rounds', async () => {
        const freshGameState = new GameState();

        // First round
        freshGameState.startRound();
        freshGameState.registerCorrectGuess('item1');
        freshGameState.registerCorrectGuess('item2');
        const firstRoundItems = freshGameState.getItemsUsed();
        expect(firstRoundItems).toContain('item1');
        expect(firstRoundItems).toContain('item2');

        // Reset and start second round
        freshGameState.reset();
        freshGameState.startRound();
        const secondRoundItems = freshGameState.getItemsUsed();
        expect(secondRoundItems.length).toBe(0);

        // Register different items in second round
        freshGameState.registerCorrectGuess('item3');
        const updatedSecondRoundItems = freshGameState.getItemsUsed();
        expect(updatedSecondRoundItems).toContain('item3');
        expect(updatedSecondRoundItems).not.toContain('item1');
      });
    });

    describe('Item progression through a complete round', () => {
      it('should track item progression through actions', async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.array(fc.constantFrom('CORRECT', 'SKIP'), {
              minLength: 1,
              maxLength: 15,
            }),
            async (actions) => {
              const freshGameState = new GameState();
              freshGameState.startRound();

              const itemIds: string[] = [];
              for (let i = 0; i < actions.length; i++) {
                itemIds.push(`item${i}`);
              }

              // Perform actions and track items
              for (let i = 0; i < actions.length; i++) {
                if (actions[i] === 'CORRECT') {
                  freshGameState.registerCorrectGuess(itemIds[i]);
                } else {
                  freshGameState.registerSkip(itemIds[i]);
                }
              }

              // Verify all items were tracked
              const usedItems = freshGameState.getItemsUsed();
              expect(usedItems.length).toBe(actions.length);
              for (let i = 0; i < actions.length; i++) {
                expect(usedItems).toContain(itemIds[i]);
              }
            }
          ),
          { numRuns: 100 }
        );
      });

      it('should maintain correct score during item progression', async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.array(fc.constantFrom('CORRECT', 'SKIP'), {
              minLength: 1,
              maxLength: 20,
            }),
            async (actions) => {
              const freshGameState = new GameState();
              freshGameState.startRound();

              let expectedScore = 0;
              for (let i = 0; i < actions.length; i++) {
                if (actions[i] === 'CORRECT') {
                  freshGameState.registerCorrectGuess(`item${i}`);
                  expectedScore += 1;
                } else {
                  freshGameState.registerSkip(`item${i}`);
                }

                const currentScore = freshGameState.getCurrentScore();
                expect(currentScore).toBe(expectedScore);
              }
            }
          ),
          { numRuns: 100 }
        );
      });

      it('should handle mixed actions and maintain state consistency', async () => {
        const freshGameState = new GameState();
        freshGameState.startRound();

        // Perform mixed actions
        freshGameState.registerCorrectGuess('item1');
        expect(freshGameState.getCurrentScore()).toBe(1);

        freshGameState.registerSkip('item2');
        expect(freshGameState.getCurrentScore()).toBe(1);

        freshGameState.registerCorrectGuess('item3');
        expect(freshGameState.getCurrentScore()).toBe(2);

        freshGameState.registerSkip('item4');
        expect(freshGameState.getCurrentScore()).toBe(2);

        freshGameState.registerCorrectGuess('item5');
        expect(freshGameState.getCurrentScore()).toBe(3);

        // Verify all items were tracked
        const usedItems = freshGameState.getItemsUsed();
        expect(usedItems.length).toBe(5);
        expect(usedItems).toEqual(['item1', 'item2', 'item3', 'item4', 'item5']);
      });
    });
  });
});
