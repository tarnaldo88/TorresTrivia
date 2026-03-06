import { GameState } from '../../services/gameState';
import { MockGameItemFactory, TestHelpers } from '../utils/testUtils';
import * as fc from 'fast-check';

describe('Heads Up Game Logic Tests', () => {
  describe('GameState Core Functionality', () => {
    let gameState: GameState;

    beforeEach(() => {
      gameState = new GameState();
    });

    afterEach(() => {
      gameState.reset();
    });

    describe('Round Management', () => {
      it('should start a round with correct initial state', () => {
        const round = gameState.startRound(60);
        
        expect(round).toBeDefined();
        expect(round.isActive).toBe(true);
        expect(round.score).toBe(0);
        expect(round.usedItemIds).toEqual([]);
        expect(gameState.isRoundActive()).toBe(true);
        expect(gameState.getCurrentScore()).toBe(0);
      });

      it('should end a round and preserve final state', () => {
        gameState.startRound(60);
        gameState.registerCorrectGuess('item1');
        gameState.registerCorrectGuess('item2');
        
        const scoreBeforeEnd = gameState.getCurrentScore();
        gameState.endRound();
        
        expect(gameState.isRoundActive()).toBe(false);
        expect(gameState.getCurrentScore()).toBe(scoreBeforeEnd);
        expect(gameState.getCurrentScore()).toBe(2);
      });

      it('should reset game state properly', () => {
        gameState.startRound(60);
        gameState.registerCorrectGuess('item1');
        gameState.registerSkip('item2');
        gameState.endRound();
        
        gameState.reset();
        
        expect(gameState.isRoundActive()).toBe(false);
        expect(gameState.getCurrentScore()).toBe(0);
        expect(gameState.getItemsUsed()).toEqual([]);
      });

      it('should prevent multiple active rounds', () => {
        const firstRound = gameState.startRound(60);
        const secondRound = gameState.startRound(60);
        
        expect(firstRound.isActive).toBe(true);
        expect(secondRound.isActive).toBe(true); // Same round reference
        expect(gameState.isRoundActive()).toBe(true);
      });
    });

    describe('Score Tracking', () => {
      it('should increment score on correct guess', () => {
        gameState.startRound(60);
        
        const result = gameState.registerCorrectGuess('item1');
        
        expect(result).toBeDefined();
        expect(result?.score).toBe(1);
        expect(gameState.getCurrentScore()).toBe(1);
      });

      it('should not increment score on skip', () => {
        gameState.startRound(60);
        
        const result = gameState.registerSkip('item1');
        
        expect(result).toBeDefined();
        expect(result?.score).toBe(0);
        expect(gameState.getCurrentScore()).toBe(0);
      });

      it('should track mixed actions correctly', () => {
        gameState.startRound(60);
        
        gameState.registerCorrectGuess('item1');
        gameState.registerSkip('item2');
        gameState.registerCorrectGuess('item3');
        gameState.registerSkip('item4');
        gameState.registerCorrectGuess('item5');
        
        expect(gameState.getCurrentScore()).toBe(3);
      });

      it('should handle zero score scenario', () => {
        gameState.startRound(60);
        
        gameState.registerSkip('item1');
        gameState.registerSkip('item2');
        gameState.registerSkip('item3');
        
        expect(gameState.getCurrentScore()).toBe(0);
      });
    });

    describe('Item Tracking', () => {
      it('should track used items correctly', () => {
        gameState.startRound(60);
        
        gameState.registerCorrectGuess('item1');
        gameState.registerSkip('item2');
        gameState.registerCorrectGuess('item3');
        
        const usedItems = gameState.getItemsUsed();
        expect(usedItems).toContain('item1');
        expect(usedItems).toContain('item2');
        expect(usedItems).toContain('item3');
        expect(usedItems.length).toBe(3);
      });

      it('should not track duplicate items', () => {
        gameState.startRound(60);
        
        gameState.registerCorrectGuess('item1');
        gameState.registerCorrectGuess('item1'); // Same item again
        
        const usedItems = gameState.getItemsUsed();
        expect(usedItems.filter(id => id === 'item1').length).toBe(1);
      });

      it('should clear used items on reset', () => {
        gameState.startRound(60);
        gameState.registerCorrectGuess('item1');
        gameState.registerSkip('item2');
        gameState.reset();
        
        expect(gameState.getItemsUsed()).toEqual([]);
      });
    });

    describe('Action Validation', () => {
      it('should reject actions when round is not active', () => {
        // Don't start round
        const correctResult = gameState.registerCorrectGuess('item1');
        const skipResult = gameState.registerSkip('item1');
        
        expect(correctResult).toBeNull();
        expect(skipResult).toBeNull();
      });

      it('should reject actions after round ends', () => {
        gameState.startRound(60);
        gameState.endRound();
        
        const correctResult = gameState.registerCorrectGuess('item1');
        const skipResult = gameState.registerSkip('item1');
        
        expect(correctResult).toBeNull();
        expect(skipResult).toBeNull();
      });

      it('should accept valid actions during active round', () => {
        gameState.startRound(60);
        
        const correctResult = gameState.registerCorrectGuess('item1');
        const skipResult = gameState.registerSkip('item2');
        
        expect(correctResult).toBeDefined();
        expect(skipResult).toBeDefined();
        expect(correctResult?.action).toBe('CORRECT');
        expect(skipResult?.action).toBe('SKIP');
      });
    });
  });

  describe('Property-Based Tests', () => {
    describe('Score Consistency', () => {
      it('should maintain score consistency across random action sequences', async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.array(fc.constantFrom('CORRECT', 'SKIP'), { minLength: 1, maxLength: 50 }),
            async (actions) => {
              const freshGameState = new GameState();
              freshGameState.startRound(60);
              
              let expectedScore = 0;
              for (let i = 0; i < actions.length; i++) {
                const itemId = `item-${i}`;
                if (actions[i] === 'CORRECT') {
                  freshGameState.registerCorrectGuess(itemId);
                  expectedScore++;
                } else {
                  freshGameState.registerSkip(itemId);
                }
                
                const currentScore = freshGameState.getCurrentScore();
                expect(currentScore).toBe(expectedScore);
              }
            }
          ),
          { numRuns: 100 }
        );
      });
    });

    describe('Item Uniqueness', () => {
      it('should maintain item uniqueness across rounds', async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.array(fc.string(), { minLength: 1, maxLength: 20 }),
            async (itemIds) => {
              const freshGameState = new GameState();
              freshGameState.startRound(60);
              
              // Register all items
              itemIds.forEach(itemId => {
                freshGameState.registerCorrectGuess(itemId);
              });
              
              const usedItems = freshGameState.getItemsUsed();
              
              // Check for duplicates
              const uniqueItems = new Set(usedItems);
              expect(uniqueItems.size).toBe(usedItems.length);
              
              // Check all items are present
              itemIds.forEach(itemId => {
                expect(usedItems).toContain(itemId);
              });
            }
          ),
          { numRuns: 50 }
        );
      });
    });

    describe('Round State Transitions', () => {
      it('should handle valid state transitions correctly', async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.array(fc.constantFrom('START', 'CORRECT', 'SKIP', 'END'), { minLength: 1, maxLength: 10 }),
            async (actions) => {
              const freshGameState = new GameState();
              let isActive = false;
              let hasStarted = false;
              
              for (const action of actions) {
                switch (action) {
                  case 'START':
                    if (!hasStarted) {
                      freshGameState.startRound(60);
                      hasStarted = true;
                      isActive = true;
                    }
                    break;
                    
                  case 'CORRECT':
                    if (isActive) {
                      const result = freshGameState.registerCorrectGuess(`item-${Math.random()}`);
                      expect(result).toBeDefined();
                    } else {
                      const result = freshGameState.registerCorrectGuess(`item-${Math.random()}`);
                      expect(result).toBeNull();
                    }
                    break;
                    
                  case 'SKIP':
                    if (isActive) {
                      const result = freshGameState.registerSkip(`item-${Math.random()}`);
                      expect(result).toBeDefined();
                    } else {
                      const result = freshGameState.registerSkip(`item-${Math.random()}`);
                      expect(result).toBeNull();
                    }
                    break;
                    
                  case 'END':
                    if (isActive) {
                      freshGameState.endRound();
                      isActive = false;
                    }
                    break;
                }
                
                expect(freshGameState.isRoundActive()).toBe(isActive);
              }
            }
          ),
          { numRuns: 100 }
        );
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    let gameState: GameState;

    beforeEach(() => {
      gameState = new GameState();
    });

    it('should handle empty item IDs gracefully', () => {
      gameState.startRound(60);
      
      const result = gameState.registerCorrectGuess('');
      expect(result).toBeDefined();
      expect(gameState.getItemsUsed()).toContain('');
    });

    it('should handle special characters in item IDs', () => {
      gameState.startRound(60);
      
      const specialIds = ['item-1', 'item_2', 'item.3', 'item@4', 'item#5'];
      specialIds.forEach(id => {
        gameState.registerCorrectGuess(id);
      });
      
      const usedItems = gameState.getItemsUsed();
      specialIds.forEach(id => {
        expect(usedItems).toContain(id);
      });
    });

    it('should handle very long item IDs', () => {
      gameState.startRound(60);
      
      const longId = 'a'.repeat(1000);
      gameState.registerCorrectGuess(longId);
      
      expect(gameState.getItemsUsed()).toContain(longId);
    });

    it('should handle rapid successive actions', () => {
      gameState.startRound(60);
      
      // Register many actions quickly
      for (let i = 0; i < 100; i++) {
        gameState.registerCorrectGuess(`item-${i}`);
      }
      
      expect(gameState.getCurrentScore()).toBe(100);
      expect(gameState.getItemsUsed().length).toBe(100);
    });

    it('should handle concurrent round operations', () => {
      gameState.startRound(60);
      
      // Try to start another round while one is active
      const secondRound = gameState.startRound(60);
      
      expect(secondRound.isActive).toBe(true);
      expect(gameState.isRoundActive()).toBe(true);
      expect(gameState.getCurrentScore()).toBe(0);
    });
  });

  describe('Performance Tests', () => {
    it('should handle large numbers of items efficiently', async () => {
      const gameState = new GameState();
      gameState.startRound(60);
      
      const startTime = performance.now();
      
      // Register 1000 items
      for (let i = 0; i < 1000; i++) {
        gameState.registerCorrectGuess(`item-${i}`);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(gameState.getCurrentScore()).toBe(1000);
      expect(gameState.getItemsUsed().length).toBe(1000);
      expect(duration).toBeLessThan(100); // Should complete in less than 100ms
    });

    it('should handle rapid state transitions efficiently', async () => {
      const iterations = 100;
      const startTime = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        const gameState = new GameState();
        gameState.startRound(60);
        gameState.registerCorrectGuess(`item-${i}`);
        gameState.endRound();
        gameState.reset();
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      const averageTime = duration / iterations;
      
      expect(averageTime).toBeLessThan(1); // Average less than 1ms per cycle
    });
  });

  describe('Integration with Other Services', () => {
    it('should work correctly with mock item database', async () => {
      const { MockItemDatabase, MockGameItemFactory } = await import('../utils/testUtils');
      
      const mockItems = MockGameItemFactory.createMockItems(10);
      const mockDatabase = new MockItemDatabase(mockItems);
      const gameState = new GameState();
      
      gameState.startRound(60);
      
      // Simulate getting items from database
      for (const item of mockItems.slice(0, 5)) {
        gameState.registerCorrectGuess(item.id);
      }
      
      expect(gameState.getCurrentScore()).toBe(5);
      expect(gameState.getItemsUsed().length).toBe(5);
    });

    it('should maintain consistency with timer simulation', async () => {
      const { MockTimerManager } = await import('../utils/testUtils');
      
      const mockTimer = new MockTimerManager();
      const gameState = new GameState();
      
      gameState.startRound(60);
      mockTimer.initialize(60);
      mockTimer.start();
      
      // Simulate game actions over time
      gameState.registerCorrectGuess('item1');
      mockTimer.simulateTimeElapsed(10000);
      gameState.registerSkip('item2');
      mockTimer.simulateTimeElapsed(20000);
      gameState.registerCorrectGuess('item3');
      
      expect(gameState.getCurrentScore()).toBe(2);
      expect(mockTimer.getRemainingTime()).toBe(30000);
    });
  });
});
