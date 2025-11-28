import { GameState } from './gameState';
import * as fc from 'fast-check';

describe('GameState', () => {
  let gameState: GameState;

  beforeEach(() => {
    gameState = new GameState();
  });

  describe('startRound', () => {
    it('should create a new round with default 60-second duration', () => {
      const round = gameState.startRound();
      expect(round).toBeDefined();
      expect(round.duration).toBe(60);
      expect(round.currentScore).toBe(0);
      expect(round.isActive).toBe(true);
      expect(round.itemsUsed).toEqual([]);
    });

    it('should create a new round with custom duration', () => {
      const customDuration = 90;
      const round = gameState.startRound(customDuration);
      expect(round.duration).toBe(customDuration);
    });

    it('should generate unique round IDs', () => {
      const round1 = gameState.startRound();
      gameState.reset();
      const round2 = gameState.startRound();
      expect(round1.id).not.toBe(round2.id);
    });
  });

  describe('registerCorrectGuess', () => {
    beforeEach(() => {
      gameState.startRound();
    });

    it('should increment score by 1', () => {
      const initialScore = gameState.getCurrentScore();
      gameState.registerCorrectGuess('item1');
      expect(gameState.getCurrentScore()).toBe(initialScore + 1);
    });

    it('should add item to itemsUsed', () => {
      gameState.registerCorrectGuess('item1');
      const itemsUsed = gameState.getItemsUsed();
      expect(itemsUsed).toContain('item1');
    });

    it('should return null if no round is active', () => {
      gameState.reset();
      const result = gameState.registerCorrectGuess('item1');
      expect(result).toBeNull();
    });
  });

  describe('registerSkip', () => {
    beforeEach(() => {
      gameState.startRound();
    });

    it('should not modify the score', () => {
      const initialScore = gameState.getCurrentScore();
      gameState.registerSkip('item1');
      expect(gameState.getCurrentScore()).toBe(initialScore);
    });

    it('should add item to itemsUsed', () => {
      gameState.registerSkip('item1');
      const itemsUsed = gameState.getItemsUsed();
      expect(itemsUsed).toContain('item1');
    });

    it('should return null if no round is active', () => {
      gameState.reset();
      const result = gameState.registerSkip('item1');
      expect(result).toBeNull();
    });
  });

  describe('endRound', () => {
    it('should set isActive to false', () => {
      gameState.startRound();
      gameState.endRound();
      expect(gameState.isRoundActive()).toBe(false);
    });
  });

  describe('pauseRound and resumeRound', () => {
    it('should pause and resume round state', () => {
      gameState.startRound();
      expect(gameState.isRoundActive()).toBe(true);
      gameState.pauseRound();
      expect(gameState.isRoundActive()).toBe(false);
      gameState.resumeRound();
      expect(gameState.isRoundActive()).toBe(true);
    });
  });

  describe('getRemainingTime', () => {
    it('should return remaining time in milliseconds', () => {
      gameState.startRound(10); // 10 seconds
      const remaining = gameState.getRemainingTime();
      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(10000);
    });

    it('should return 0 when time has expired', (done) => {
      gameState.startRound(1); // 1 second
      setTimeout(() => {
        const remaining = gameState.getRemainingTime();
        expect(remaining).toBe(0);
        done();
      }, 1100);
    });
  });

  describe('hasRoundExpired', () => {
    it('should return false for active round', () => {
      gameState.startRound(10);
      expect(gameState.hasRoundExpired()).toBe(false);
    });

    it('should return true when time expires', (done) => {
      gameState.startRound(1); // 1 second
      setTimeout(() => {
        expect(gameState.hasRoundExpired()).toBe(true);
        done();
      }, 1100);
    });
  });

  describe('reset', () => {
    it('should clear current round and reset duration', () => {
      gameState.startRound(90);
      gameState.reset();
      expect(gameState.getCurrentRound()).toBeNull();
      expect(gameState.getRoundDuration()).toBe(60);
    });
  });

  describe('Property 5: Correct guess increments score', () => {
    /**
     * **Feature: heads-up-game, Property 5: Correct guess increments score**
     * **Validates: Requirements 2.2**
     *
     * For any active round with a starting score, when a correct guess is registered,
     * the score should increase by exactly one.
     */
    it('should increment score by exactly 1 for each correct guess', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.uuid(), { minLength: 1, maxLength: 20 }),
          async (itemIds) => {
            const freshGameState = new GameState();
            freshGameState.startRound();

            const initialScore = freshGameState.getCurrentScore();
            expect(initialScore).toBe(0);

            for (let i = 0; i < itemIds.length; i++) {
              freshGameState.registerCorrectGuess(itemIds[i]);
              const currentScore = freshGameState.getCurrentScore();
              expect(currentScore).toBe(i + 1);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 7: Skip preserves score', () => {
    /**
     * **Feature: heads-up-game, Property 7: Skip preserves score**
     * **Validates: Requirements 3.3**
     *
     * For any active round with a starting score, when a skip action is registered,
     * the score should remain unchanged.
     */
    it('should not modify score when skip is registered', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.uuid(), { minLength: 1, maxLength: 20 }),
          async (itemIds) => {
            const freshGameState = new GameState();
            freshGameState.startRound();

            const initialScore = freshGameState.getCurrentScore();

            for (const itemId of itemIds) {
              freshGameState.registerSkip(itemId);
              const currentScore = freshGameState.getCurrentScore();
              expect(currentScore).toBe(initialScore);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 8: Custom duration is used', () => {
    /**
     * **Feature: heads-up-game, Property 8: Custom duration is used**
     * **Validates: Requirements 4.2**
     *
     * For any round configured with a custom duration value, the round should use
     * that duration as the time limit.
     */
    it('should use custom duration when provided', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 600 }),
          async (customDuration) => {
            const freshGameState = new GameState();
            const round = freshGameState.startRound(customDuration);

            expect(round.duration).toBe(customDuration);
            expect(freshGameState.getRoundDuration()).toBe(customDuration);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 9: Default duration is 60 seconds', () => {
    /**
     * **Feature: heads-up-game, Property 9: Default duration is 60 seconds**
     * **Validates: Requirements 4.3**
     *
     * For any round started without an explicit duration configuration, the round
     * should default to a 60-second duration.
     */
    it('should default to 60 seconds when no duration is provided', async () => {
      await fc.assert(
        fc.asyncProperty(fc.constant(null), async () => {
          const freshGameState = new GameState();
          const round = freshGameState.startRound();

          expect(round.duration).toBe(60);
          expect(freshGameState.getRoundDuration()).toBe(60);
        }),
        { numRuns: 100 }
      );
    });

    it('should default to 60 seconds when invalid duration is provided', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.integer({ max: 0 }),
            fc.constant(undefined),
            fc.constant(null)
          ),
          async (invalidDuration) => {
            const freshGameState = new GameState();
            const round = freshGameState.startRound(invalidDuration as any);

            expect(round.duration).toBe(60);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 14: Score resets on new round', () => {
    /**
     * **Feature: heads-up-game, Property 14: Score resets on new round**
     * **Validates: Requirements 5.4**
     *
     * For any new round started after a previous round, the score should be reset to zero.
     */
    it('should reset score when starting a new round', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.uuid(), { minLength: 1, maxLength: 20 }),
          async (itemIds) => {
            const freshGameState = new GameState();

            // First round
            freshGameState.startRound();
            for (const itemId of itemIds) {
              freshGameState.registerCorrectGuess(itemId);
            }
            const firstRoundScore = freshGameState.getCurrentScore();
            expect(firstRoundScore).toBeGreaterThan(0);

            // Start new round
            freshGameState.reset();
            freshGameState.startRound();
            const newRoundScore = freshGameState.getCurrentScore();

            expect(newRoundScore).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
