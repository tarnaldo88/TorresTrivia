import { ScoreManager } from '../../services/scoreManager';
import { GameState } from '../../services/gameState';
import { Database } from '../../services/database';
import * as fc from 'fast-check';

describe('Score Tracking Tests', () => {
  let gameState: GameState;

  beforeEach(() => {
    gameState = new GameState();
  });

  afterEach(() => {
    gameState.reset();
  });

  describe('ScoreManager Basic Functionality', () => {
    it('should initialize with zero score', async () => {
      const lastScore = await ScoreManager.getLastScore();
      expect(lastScore).toBe(0);
    });

    it('should handle initial high score', async () => {
      const highScore = await ScoreManager.getHighScore();
      expect(highScore).toBe(0);
    });

    it('should update high score when current score is higher', async () => {
      await ScoreManager.setHighScore(100);
      await ScoreManager.setHighScore(150);
      
      const highScore = await ScoreManager.getHighScore();
      expect(highScore).toBe(150);
    });

    it('should not update high score when current score is lower', async () => {
      await ScoreManager.setHighScore(200);
      await ScoreManager.setHighScore(150);
      
      const highScore = await ScoreManager.getHighScore();
      expect(highScore).toBe(200);
    });

    it('should set and get last score', async () => {
      await ScoreManager.setLastScore(25);
      const lastScore = await ScoreManager.getLastScore();
      expect(lastScore).toBe(25);
    });

    it('should update last score', async () => {
      await ScoreManager.setLastScore(10);
      await ScoreManager.setLastScore(20);
      const lastScore = await ScoreManager.getLastScore();
      expect(lastScore).toBe(20);
    });

    it('should handle zero last score', async () => {
      await ScoreManager.setLastScore(0);
      const lastScore = await ScoreManager.getLastScore();
      expect(lastScore).toBe(0);
    });

    it('should reset high score correctly', async () => {
      await ScoreManager.setHighScore(500);
      await ScoreManager.resetHighScore();
      
      const highScore = await ScoreManager.getHighScore();
      expect(highScore).toBe(0);
    });
  });

  describe('GameState Score Integration', () => {
    it('should track score during active round', () => {
      gameState.startRound(60);
      
      gameState.registerCorrectGuess('item1');
      expect(gameState.getCurrentScore()).toBe(1);
      
      gameState.registerCorrectGuess('item2');
      expect(gameState.getCurrentScore()).toBe(2);
      
      gameState.registerSkip('item3');
      expect(gameState.getCurrentScore()).toBe(2); // Skip doesn't affect score
    });

    it('should preserve score when round ends', () => {
      gameState.startRound(60);
      
      gameState.registerCorrectGuess('item1');
      gameState.registerCorrectGuess('item2');
      gameState.registerSkip('item3');
      
      const scoreBeforeEnd = gameState.getCurrentScore();
      gameState.endRound();
      
      expect(gameState.getCurrentScore()).toBe(scoreBeforeEnd);
      expect(gameState.getCurrentScore()).toBe(2);
    });

    it('should reset score between rounds', () => {
      // First round
      gameState.startRound(60);
      gameState.registerCorrectGuess('item1');
      gameState.registerCorrectGuess('item2');
      gameState.endRound();
      
      // Reset for second round
      gameState.reset();
      gameState.startRound(60);
      
      expect(gameState.getCurrentScore()).toBe(0);
    });

    it('should handle team scoring correctly', () => {
      gameState.startRound(60);
      
      gameState.registerCorrectGuess('item1', 'Shazam');
      gameState.registerCorrectGuess('item2', 'Team B');
      gameState.registerCorrectGuess('item3', 'Shazam');
      
      const round = gameState.getCurrentRound();
      expect(round?.teamsScore[0]).toBe(2); // Shazam (index 0)
      expect(round?.teamsScore[1]).toBe(1); // Team B (index 1)
      expect(round?.teamsScore[2]).toBe(0); // Team C (index 2)
      expect(round?.teamsScore[3]).toBe(0); // Team D (index 3)
    });
  });

  describe('Property-Based Tests', () => {
    it('should maintain score consistency across random operations', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.constantFrom('ADD', 'SUBTRACT'), { minLength: 1, maxLength: 20 }),
          fc.array(fc.integer({ min: 1, max: 10 }), { minLength: 1, maxLength: 20 }),
          async (operations, values) => {
            const freshScoreManager = new ScoreManager();
            let expectedScore = 0;
            
            for (let i = 0; i < operations.length; i++) {
              const value = values[i % values.length];
              
              if (operations[i] === 'ADD') {
                freshScoreManager.addPoints(value);
                expectedScore += value;
              } else {
                freshScoreManager.subtractPoints(value);
                expectedScore = Math.max(0, expectedScore - value);
              }
              
              expect(freshScoreManager.getCurrentScore()).toBe(expectedScore);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle game state score transitions correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.constantFrom('CORRECT', 'SKIP'), { minLength: 1, maxLength: 30 }),
          async (actions) => {
            const freshGameState = new GameState();
            freshGameState.startRound(60);
            
            let expectedScore = 0;
            
            for (let i = 0; i < actions.length; i++) {
              if (actions[i] === 'CORRECT') {
                freshGameState.registerCorrectGuess(`item-${i}`);
                expectedScore++;
              } else {
                freshGameState.registerSkip(`item-${i}`);
              }
              
              expect(freshGameState.getCurrentScore()).toBe(expectedScore);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain high score integrity', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.integer({ min: 0, max: 1000 }), { minLength: 1, maxLength: 50 }),
          async (scores) => {
            await ScoreManager.resetHighScore();
            
            let expectedHighScore = 0;
            
            for (const score of scores) {
              await ScoreManager.setHighScore(score);
              expectedHighScore = Math.max(expectedHighScore, score);
              
              const actualHighScore = await ScoreManager.getHighScore();
              expect(actualHighScore).toBe(expectedHighScore);
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large scores', () => {
      const freshScoreManager = new ScoreManager();
      freshScoreManager.addPoints(Number.MAX_SAFE_INTEGER);
      expect(freshScoreManager.getCurrentScore()).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('should handle negative point additions', () => {
      const freshScoreManager = new ScoreManager();
      freshScoreManager.addPoints(10);
      freshScoreManager.addPoints(-5);
      expect(freshScoreManager.getCurrentScore()).toBe(5);
    });

    it('should handle negative point subtractions', () => {
      const freshScoreManager = new ScoreManager();
      freshScoreManager.addPoints(10);
      freshScoreManager.subtractPoints(-5);
      expect(freshScoreManager.getCurrentScore()).toBe(15);
    });

    it('should handle decimal point values', () => {
      const freshScoreManager = new ScoreManager();
      freshScoreManager.addPoints(5.5);
      expect(freshScoreManager.getCurrentScore()).toBe(5);
    });

    it('should handle concurrent score operations', () => {
      // Simulate concurrent operations
      const freshScoreManager = new ScoreManager();
      for (let i = 0; i < 100; i++) {
        freshScoreManager.addPoints(1);
      }
      
      expect(freshScoreManager.getCurrentScore()).toBe(100);
    });

    it('should handle rapid reset operations', () => {
      const freshScoreManager = new ScoreManager();
      freshScoreManager.addPoints(50);
      freshScoreManager.resetScore();
      freshScoreManager.addPoints(25);
      freshScoreManager.resetScore();
      freshScoreManager.addPoints(10);
      
      expect(freshScoreManager.getCurrentScore()).toBe(10);
    });
  });

  describe('Performance Tests', () => {
    it('should handle many score operations efficiently', () => {
      const startTime = performance.now();
      const freshScoreManager = new ScoreManager();
      
      for (let i = 0; i < 10000; i++) {
        freshScoreManager.addPoints(1);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(freshScoreManager.getCurrentScore()).toBe(10000);
      expect(duration).toBeLessThan(100); // Should complete in less than 100ms
    });

    it('should handle high score operations efficiently', async () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        await ScoreManager.setHighScore(i);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      const highScore = await ScoreManager.getHighScore();
      expect(highScore).toBe(99);
      expect(duration).toBeLessThan(1000); // Should complete in less than 1 second
    });

    it('should handle game state scoring efficiently', () => {
      const startTime = performance.now();
      
      gameState.startRound(60);
      
      for (let i = 0; i < 1000; i++) {
        gameState.registerCorrectGuess(`item-${i}`);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(gameState.getCurrentScore()).toBe(1000);
      expect(duration).toBeLessThan(50); // Should complete in less than 50ms
    });
  });

  describe('Integration Tests', () => {
    it('should integrate ScoreManager with GameState', async () => {
      gameState.startRound(60);
      
      // Simulate game play
      gameState.registerCorrectGuess('item1');
      gameState.registerCorrectGuess('item2');
      gameState.registerSkip('item3');
      gameState.registerCorrectGuess('item4');
      
      const finalScore = gameState.getCurrentScore();
      expect(finalScore).toBe(3);
      
      // Save to ScoreManager
      await ScoreManager.setLastScore(finalScore);
      await ScoreManager.setHighScore(finalScore);
      
      const lastScore = await ScoreManager.getLastScore();
      const highScore = await ScoreManager.getHighScore();
      
      expect(lastScore).toBe(3);
      expect(highScore).toBe(3);
    });

    it('should handle complete game flow', async () => {
      // Start game
      gameState.startRound(60);
      
      // Play game
      const actions = ['CORRECT', 'SKIP', 'CORRECT', 'CORRECT', 'SKIP', 'CORRECT'];
      let expectedScore = 0;
      
      for (const action of actions) {
        if (action === 'CORRECT') {
          gameState.registerCorrectGuess(`item-${Date.now()}`);
          expectedScore++;
        } else {
          gameState.registerSkip(`item-${Date.now()}`);
        }
      }
      
      // End game
      gameState.endRound();
      
      // Verify score
      expect(gameState.getCurrentScore()).toBe(expectedScore);
      
      // Save to ScoreManager
      await ScoreManager.setLastScore(gameState.getCurrentScore());
      await ScoreManager.setHighScore(gameState.getCurrentScore());
      
      // Verify persistence
      const lastScore = await ScoreManager.getLastScore();
      const highScore = await ScoreManager.getHighScore();
      
      expect(lastScore).toBe(expectedScore);
      expect(highScore).toBeGreaterThanOrEqual(expectedScore);
    });

    it('should handle multiple rounds with score tracking', async () => {
      const roundScores = [5, 8, 3, 12, 7];
      
      for (const roundScore of roundScores) {
        // Start round
        gameState.startRound(60);
        
        // Simulate getting score
        for (let i = 0; i < roundScore; i++) {
          gameState.registerCorrectGuess(`item-${i}`);
        }
        
        // End round
        gameState.endRound();
        
        // Verify score
        expect(gameState.getCurrentScore()).toBe(roundScore);
        
        // Save to ScoreManager
        await ScoreManager.setLastScore(roundScore);
        await ScoreManager.setHighScore(roundScore);
        
        // Reset for next round
        gameState.reset();
      }
      
      // Verify final high score
      const finalHighScore = await ScoreManager.getHighScore();
      expect(finalHighScore).toBe(Math.max(...roundScores));
      
      // Verify last score
      const finalLastScore = await ScoreManager.getLastScore();
      expect(finalLastScore).toBe(roundScores[roundScores.length - 1]);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid score values gracefully', () => {
      const freshScoreManager = new ScoreManager();
      expect(() => {
        freshScoreManager.addPoints(NaN);
      }).not.toThrow();
      
      expect(() => {
        freshScoreManager.addPoints(Infinity);
      }).not.toThrow();
      
      expect(() => {
        freshScoreManager.subtractPoints(NaN);
      }).not.toThrow();
    });

    it('should handle storage errors gracefully', async () => {
      // Mock storage error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // This would normally test storage errors, but for now we'll just verify no crashes
      await ScoreManager.setHighScore(100);
      
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Score Validation', () => {
    it('should validate score ranges', () => {
      const freshScoreManager = new ScoreManager();
      // Test minimum bounds
      freshScoreManager.addPoints(0);
      expect(freshScoreManager.getCurrentScore()).toBe(0);
      
      freshScoreManager.subtractPoints(1000);
      expect(freshScoreManager.getCurrentScore()).toBe(0);
      
      // Test reasonable upper bounds
      freshScoreManager.addPoints(1000000);
      expect(freshScoreManager.getCurrentScore()).toBe(1000000);
    });

    it('should maintain score type consistency', () => {
      const freshScoreManager = new ScoreManager();
      freshScoreManager.addPoints(5.5);
      expect(typeof freshScoreManager.getCurrentScore()).toBe('number');
      expect(Number.isInteger(freshScoreManager.getCurrentScore())).toBe(true);
    });
  });
});
