import * as fc from 'fast-check';
import { PowerUpManager, PowerUpType } from '../../services/powerUpManager';
import { TriviaQuestion } from '../../types/index';

// Mock trivia question factory
const createMockTriviaQuestion = (): TriviaQuestion => ({
  id: `test-${Math.random()}`,
  question: 'Test question?',
  answer: 'Test answer',
  category: 'Test',
  difficulty: 'Easy',
});

describe('Power-Up System Property-Based Tests', () => {
  let powerUpManager: PowerUpManager;

  beforeEach(() => {
    powerUpManager = new PowerUpManager();
  });

  describe('Power-Up Usage Properties', () => {
    it('should maintain consistent state across power-up usage sequences', async () => {
      await fc.assert(fc.asyncProperty(
        fc.array(fc.record({
          powerUpType: fc.constantFrom(...Object.values(PowerUpType)),
          hasQuestion: fc.boolean(),
          hasScore: fc.boolean(),
          hasTimeRemaining: fc.boolean(),
        })),
        async (usageSequence) => {
          // Reset for each test run
          const testPlayerId = `test-player-${Math.random()}`;
          powerUpManager.resetPlayerInventory(testPlayerId);
          
          // Track invariants
          let totalUses = 0;
          let successfulUses = 0;
          
          for (const usage of usageSequence) {
            const context = {
              question: usage.hasQuestion ? createMockTriviaQuestion() : undefined,
              currentScore: usage.hasScore ? Math.floor(Math.random() * 1000) : undefined,
              timeRemaining: usage.hasTimeRemaining ? Math.floor(Math.random() * 120) + 1 : undefined,
            };
            
            const result = powerUpManager.usePowerUp(testPlayerId, usage.powerUpType, context);
            totalUses++;
            
            if (result.success) {
              successfulUses++;
              
              // Invariant: Successful usage should not exceed available uses
              const inventory = powerUpManager.getPlayerInventory(testPlayerId);
              const availableUses = inventory.powerUps.get(usage.powerUpType) || 0;
              expect(availableUses).toBeGreaterThanOrEqual(0);
              
              // Invariant: Remaining uses should be tracked correctly
              expect(result.remainingUses).toBeDefined();
              expect(result.remainingUses).toBeGreaterThanOrEqual(0);
            }
          }
          
          // Final invariants
          const finalInventory = powerUpManager.getPlayerInventory(testPlayerId);
          expect(finalInventory.totalPowerUpsUsed).toBe(successfulUses);
          expect(finalInventory.totalPowerUpsUsed).toBeLessThanOrEqual(totalUses);
        }
      ), { numRuns: 100 });
    });

    it('should respect power-up limits and cooldowns', async () => {
      await fc.assert(fc.asyncProperty(
        fc.record({
          playerId: fc.string(),
          powerUpType: fc.constantFrom(...Object.values(PowerUpType)),
          maxUses: fc.integer({ min: 1, max: 5 }),
        }),
        async (config) => {
          // Create custom power-up manager with modified config
          const customManager = new PowerUpManager();
          customManager.resetPlayerInventory(config.playerId);
          
          // Use power-up up to max uses
          let useCount = 0;
          let lastResult = null;
          
          for (let i = 0; i < config.maxUses + 2; i++) {
            lastResult = customManager.usePowerUp(config.playerId, config.powerUpType, {
              question: createMockTriviaQuestion(),
            });
            
            if (lastResult.success) {
              useCount++;
            }
          }
          
          // Invariant: Should not exceed max uses
          expect(useCount).toBeLessThanOrEqual(config.maxUses);
          
          // Invariant: Last uses should fail
          expect(lastResult?.success).toBe(false);
          expect(lastResult?.message).toContain('No uses remaining');
        }
      ), { numRuns: 50 });
    });

    it('should maintain inventory consistency across operations', async () => {
      await fc.assert(fc.asyncProperty(
        fc.array(fc.record({
          operation: fc.constantFrom('use', 'add', 'unlock', 'reset'),
          powerUpType: fc.constantFrom(...Object.values(PowerUpType)),
          value: fc.integer({ min: 1, max: 3 }),
        })),
        async (operations) => {
          const testPlayerId = `test-player-${Math.random()}`;
          powerUpManager.resetPlayerInventory(testPlayerId);
          
          let totalUnlocked = 2; // Start with FIFTY_FIFTY and SKIP_PASS
          let totalAdded = 0;
          
          for (const op of operations) {
            const inventoryBefore = powerUpManager.getPlayerInventory(testPlayerId);
            
            switch (op.operation) {
              case 'use':
                powerUpManager.usePowerUp(testPlayerId, op.powerUpType, {
                  question: createMockTriviaQuestion(),
                });
                break;
                
              case 'add':
                const addSuccess = powerUpManager.addPowerUpUses(testPlayerId, op.powerUpType, op.value);
                if (addSuccess) totalAdded += op.value;
                break;
                
              case 'unlock':
                const unlockSuccess = powerUpManager.unlockPowerUp(testPlayerId, op.powerUpType);
                if (unlockSuccess) totalUnlocked++;
                break;
                
              case 'reset':
                powerUpManager.resetPlayerInventory(testPlayerId);
                totalUnlocked = 2; // Reset to default
                totalAdded = 0;
                break;
            }
            
            const inventoryAfter = powerUpManager.getPlayerInventory(testPlayerId);
            
            // Invariant: Total unlocked should never decrease (except on reset)
            if (op.operation !== 'reset') {
              expect(inventoryAfter.unlockedPowerUps.size).toBeGreaterThanOrEqual(totalUnlocked - 1);
            }
            
            // Invariant: Uses should never be negative
            inventoryAfter.powerUps.forEach((uses, type) => {
              expect(uses).toBeGreaterThanOrEqual(0);
            });
          }
        }
      ), { numRuns: 100 });
    });
  });

  describe('Power-Up Effect Properties', () => {
    it('should generate valid power-up effects', async () => {
      await fc.assert(fc.asyncProperty(
        fc.record({
          powerUpType: fc.constantFrom(...Object.values(PowerUpType)),
          hasQuestion: fc.boolean(),
          hasScore: fc.boolean(),
          hasTimeRemaining: fc.boolean(),
        }),
        async (config) => {
          const testPlayerId = `test-player-${Math.random()}`;
          powerUpManager.resetPlayerInventory(testPlayerId);
          
          const context = {
            question: config.hasQuestion ? TriviaQuestion.createMock() : undefined,
            currentScore: config.hasScore ? Math.floor(Math.random() * 1000) : undefined,
            timeRemaining: config.hasTimeRemaining ? Math.floor(Math.random() * 120) + 1 : undefined,
          };
          
          const result = powerUpManager.usePowerUp(testPlayerId, config.powerUpType, context);
          
          if (result.success && result.effect) {
            // Invariant: Effects should be valid for their type
            switch (config.powerUpType) {
              case PowerUpType.FIFTY_FIFTY:
                expect(result.effect.removedAnswers).toBeInstanceOf(Array);
                expect(result.effect.remainingAnswers).toBeInstanceOf(Array);
                expect(result.effect.correctAnswer).toBeTruthy();
                expect(result.effect.removedAnswers.length).toBe(2);
                expect(result.effect.remainingAnswers.length).toBe(2);
                break;
                
              case PowerUpType.TIME_FREEZE:
                expect(result.effect.frozenDuration).toBeGreaterThan(0);
                expect(result.effect.bonusTime).toBe(result.effect.frozenDuration);
                break;
                
              case PowerUpType.DOUBLE_POINTS:
                expect(result.effect.multiplier).toBe(2);
                expect(result.effect.basePoints).toBeGreaterThan(0);
                expect(result.effect.bonusPoints).toBe(result.effect.basePoints);
                break;
                
              case PowerUpType.SKIP_PASS:
                expect(result.effect.skipUsed).toBe(true);
                expect(result.effect.noPenalty).toBe(true);
                expect(result.effect.skipsRemaining).toBeGreaterThanOrEqual(0);
                break;
            }
          }
        }
      ), { numRuns: 100 });
    });

    it('should handle edge cases gracefully', async () => {
      await fc.assert(fc.asyncProperty(
        fc.record({
          playerId: fc.string().filter(s => s.length > 0),
          powerUpType: fc.constantFrom(...Object.values(PowerUpType)),
          questionId: fc.string(),
          score: fc.integer({ min: -1000, max: 1000 }),
          timeRemaining: fc.integer({ min: 0, max: 300 }),
        }),
        async (edgeCase) => {
          // Reset player
          powerUpManager.resetPlayerInventory(edgeCase.playerId);
          
          // Create edge case question
          const edgeQuestion: TriviaQuestion = {
            id: edgeCase.questionId,
            question: '',
            answer: '',
            category: '',
            difficulty: '',
          };
          
          const result = powerUpManager.usePowerUp(edgeCase.playerId, edgeCase.powerUpType, {
            question: edgeQuestion,
            currentScore: edgeCase.score,
            timeRemaining: edgeCase.timeRemaining,
          });
          
          // Should not crash and should return a valid result
          expect(result).toBeDefined();
          expect(typeof result.success).toBe('boolean');
          expect(result.type).toBe(edgeCase.powerUpType);
          expect(typeof result.message).toBe('string');
          
          if (result.success) {
            expect(result.effect).toBeDefined();
          }
        }
      ), { numRuns: 50 });
    });
  });

  describe('Active Power-Up Properties', () => {
    it('should maintain active power-up consistency', async () => {
      await fc.assert(fc.asyncProperty(
        fc.array(fc.constantFrom(...Object.values(PowerUpType))),
        async (powerUpSequence) => {
          const testPlayerId = `test-player-${Math.random()}`;
          powerUpManager.resetPlayerInventory(testPlayerId);
          
          // Unlock all power-ups for testing
          Object.values(PowerUpType).forEach(type => {
            powerUpManager.unlockPowerUp(testPlayerId, type);
          });
          
          const activePowerUps: PowerUpType[] = [];
          
          for (const powerUpType of powerUpSequence) {
            const result = powerUpManager.usePowerUp(testPlayerId, powerUpType, {
              question: TriviaQuestion.createMock(),
            });
            
            if (result.success) {
              activePowerUps.push(powerUpType);
            }
            
            // Check active power-ups
            const currentlyActive = powerUpManager.getActivePowerUps(testPlayerId);
            const activeTypes = currentlyActive.map(pu => pu.type);
            
            // Invariant: Active power-ups should be subset of successfully used ones
            activeTypes.forEach(type => {
              expect(activePowerUps).toContain(type);
            });
            
            // Invariant: No duplicates in active power-ups
            const uniqueActiveTypes = [...new Set(activeTypes)];
            expect(activeTypes).toHaveLength(uniqueActiveTypes.length);
          }
        }
      ), { numRuns: 100 });
    });

    it('should handle power-up deactivation correctly', async () => {
      await fc.assert(fc.asyncProperty(
        fc.array(fc.constantFrom(...Object.values(PowerUpType))),
        async (powerUpSequence) => {
          const testPlayerId = `test-player-${Math.random()}`;
          powerUpManager.resetPlayerInventory(testPlayerId);
          
          // Unlock all power-ups
          Object.values(PowerUpType).forEach(type => {
            powerUpManager.unlockPowerUp(testPlayerId, type);
          });
          
          // Use power-ups to activate them
          const activeIds: string[] = [];
          for (const powerUpType of powerUpSequence) {
            const result = powerUpManager.usePowerUp(testPlayerId, powerUpType, {
              question: TriviaQuestion.createMock(),
            });
            
            if (result.success) {
              const active = powerUpManager.getActivePowerUps(testPlayerId);
              const newActive = active.find(pu => pu.type === powerUpType);
              if (newActive) {
                activeIds.push(newActive.id);
              }
            }
          }
          
          // Deactivate random subset
          const toDeactivate = activeIds.slice(0, Math.floor(activeIds.length / 2));
          toDeactivate.forEach(id => {
            powerUpManager.deactivatePowerUp(id);
          });
          
          // Check remaining active power-ups
          const remainingActive = powerUpManager.getActivePowerUps(testPlayerId);
          const remainingIds = remainingActive.map(pu => pu.id);
          
          // Invariant: Deactivated power-ups should not be in active list
          toDeactivate.forEach(id => {
            expect(remainingIds).not.toContain(id);
          });
        }
      ), { numRuns: 50 });
    });
  });

  describe('Performance Properties', () => {
    it('should maintain reasonable performance for large numbers of operations', async () => {
      await fc.assert(fc.asyncProperty(
        fc.integer({ min: 10, max: 100 }),
        async (operationCount) => {
          const testPlayerId = `test-player-${Math.random()}`;
          powerUpManager.resetPlayerInventory(testPlayerId);
          
          // Unlock all power-ups
          Object.values(PowerUpType).forEach(type => {
            powerUpManager.unlockPowerUp(testPlayerId, type);
          });
          
          const startTime = performance.now();
          
          // Perform many operations
          for (let i = 0; i < operationCount; i++) {
            const powerUpType = Object.values(PowerUpType)[i % Object.values(PowerUpType).length];
            
            // Randomly choose operation
            const operation = Math.random();
            if (operation < 0.6) {
              // Use power-up
              powerUpManager.usePowerUp(testPlayerId, powerUpType, {
                question: TriviaQuestion.createMock(),
              });
            } else if (operation < 0.8) {
              // Check active power-ups
              powerUpManager.getActivePowerUps(testPlayerId);
            } else {
              // Get inventory
              powerUpManager.getPlayerInventory(testPlayerId);
            }
          }
          
          const endTime = performance.now();
          const duration = endTime - startTime;
          
          // Performance invariant: Should complete within reasonable time
          expect(duration).toBeLessThan(1000); // 1 second for 100 operations
        }
      ), { numRuns: 20 });
    });

    it('should handle concurrent operations safely', async () => {
      await fc.assert(fc.asyncProperty(
        fc.integer({ min: 2, max: 5 }),
        async (playerCount) => {
          const players = Array.from({ length: playerCount }, (_, i) => `player-${i}`);
          
          // Initialize all players
          players.forEach(playerId => {
            powerUpManager.resetPlayerInventory(playerId);
            Object.values(PowerUpType).forEach(type => {
              powerUpManager.unlockPowerUp(playerId, type);
            });
          });
          
          // Perform concurrent operations
          const promises = players.map(async (playerId) => {
            const results = [];
            for (let i = 0; i < 10; i++) {
              const powerUpType = Object.values(PowerUpType)[i % Object.values(PowerUpType).length];
              const result = powerUpManager.usePowerUp(playerId, powerUpType, {
                question: TriviaQuestion.createMock(),
              });
              results.push(result);
            }
            return results;
          });
          
          const allResults = await Promise.all(promises);
          
          // Invariant: Each player should have independent results
          expect(allResults).toHaveLength(playerCount);
          
          // Invariant: No cross-contamination between players
          const inventories = players.map(playerId => 
            powerUpManager.getPlayerInventory(playerId)
          );
          
          inventories.forEach(inventory => {
            expect(inventory.playerId).toBeTruthy();
            expect(inventory.totalPowerUpsUsed).toBeGreaterThanOrEqual(0);
          });
        }
      ), { numRuns: 20 });
    });
  });

  describe('Statistical Properties', () => {
    it('should maintain accurate statistics across operations', async () => {
      await fc.assert(fc.asyncProperty(
        fc.array(fc.record({
          powerUpType: fc.constantFrom(...Object.values(PowerUpType)),
          success: fc.boolean(),
        })),
        async (usagePattern) => {
          const testPlayerId = `test-player-${Math.random()}`;
          powerUpManager.resetPlayerInventory(testPlayerId);
          
          // Unlock all power-ups
          Object.values(PowerUpType).forEach(type => {
            powerUpManager.unlockPowerUp(testPlayerId, type);
          });
          
          let expectedSuccessfulUses = 0;
          
          for (const usage of usagePattern) {
            // Simulate success/failure by managing uses
            if (usage.success) {
              const result = powerUpManager.usePowerUp(testPlayerId, usage.powerUpType, {
                question: TriviaQuestion.createMock(),
              });
              
              if (result.success) {
                expectedSuccessfulUses++;
              }
            }
          }
          
          const stats = powerUpManager.getPlayerStats(testPlayerId);
          
          // Invariant: Statistics should match actual usage
          expect(stats.totalPowerUpsUsed).toBe(expectedSuccessfulUses);
          expect(stats.sessionDuration).toBeGreaterThan(0);
        }
      ), { numRuns: 100 });
    });
  });
});
