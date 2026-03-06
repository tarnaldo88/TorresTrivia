import { TimerManager } from '../../services/timerManager';
import { MockTimerManager } from '../utils/testUtils';
import * as fc from 'fast-check';

describe('TimerManager Tests', () => {
  let timerManager: TimerManager;

  beforeEach(() => {
    timerManager = new TimerManager();
  });

  afterEach(() => {
    timerManager.stop();
  });

  describe('Basic Timer Functionality', () => {
    it('should initialize with default duration', () => {
      timerManager.initialize(60);
      expect(timerManager.getRemainingTime()).toBe(60000); // 60 seconds in ms
    });

    it('should initialize with custom duration', () => {
      timerManager.initialize(30);
      expect(timerManager.getRemainingTime()).toBe(30000); // 30 seconds in ms
    });

    it('should handle invalid duration gracefully', () => {
      timerManager.initialize(-10);
      expect(timerManager.getRemainingTime()).toBe(60000); // Should default to 60 seconds
    });

    it('should start timer in correct state', () => {
      timerManager.initialize(60);
      timerManager.start();
      expect(timerManager.isActive()).toBe(true);
    });

    it('should stop timer correctly', () => {
      timerManager.initialize(60);
      timerManager.start();
      timerManager.stop();
      expect(timerManager.isActive()).toBe(false);
    });

    it('should pause timer correctly', () => {
      timerManager.initialize(60);
      timerManager.start();
      timerManager.pause();
      expect(timerManager.isActive()).toBe(false);
    });

    it('should resume timer correctly', () => {
      timerManager.initialize(60);
      timerManager.start();
      timerManager.pause();
      timerManager.resume();
      expect(timerManager.isActive()).toBe(true);
    });
  });

  describe('Timer Callbacks', () => {
    it('should call timer update callback during countdown', (done) => {
      timerManager.initialize(1); // 1 second for fast test
      timerManager.setOnTimerUpdate((remainingMs) => {
        expect(remainingMs).toBeGreaterThanOrEqual(0);
        expect(remainingMs).toBeLessThanOrEqual(1000);
        if (remainingMs <= 0) {
          timerManager.stop();
          done();
        }
      });
      
      timerManager.start();
    });

    it('should call round end callback when timer expires', (done) => {
      timerManager.initialize(1); // 1 second for fast test
      timerManager.setOnRoundEnd(() => {
        expect(timerManager.isActive()).toBe(false);
        done();
      });
      
      timerManager.start();
    });

    it('should handle multiple timer updates', () => {
      const updateCallback = jest.fn();
      timerManager.initialize(2);
      timerManager.setOnTimerUpdate(updateCallback);
      timerManager.start();
      
      // Wait for at least one update
      setTimeout(() => {
        expect(updateCallback).toHaveBeenCalled();
        timerManager.stop();
      }, 100);
    });
  });

  describe('Timer State Management', () => {
    it('should prevent multiple timer instances', () => {
      timerManager.initialize(60);
      timerManager.start();
      timerManager.start(); // Try to start again
      
      expect(timerManager.isActive()).toBe(true);
    });

    it('should handle stop when not running', () => {
      timerManager.initialize(60);
      timerManager.stop(); // Stop without starting
      
      expect(timerManager.isActive()).toBe(false);
    });

    it('should handle pause when not running', () => {
      timerManager.initialize(60);
      timerManager.pause(); // Pause without starting
      
      expect(timerManager.isActive()).toBe(false);
    });

    it('should handle resume when not running', () => {
      timerManager.initialize(60);
      timerManager.resume(); // Resume without starting
      
      expect(timerManager.isActive()).toBe(false);
    });

    it('should reset timer state on reinitialize', () => {
      timerManager.initialize(60);
      timerManager.start();
      timerManager.initialize(30); // Reinitialize
      
      expect(timerManager.isActive()).toBe(false);
      expect(timerManager.getRemainingTime()).toBe(30000);
    });
  });

  describe('Timer Accuracy', () => {
    it('should count down approximately correctly', (done) => {
      timerManager.initialize(2); // 2 seconds
      const startTime = Date.now();
      let endTime: number;
      
      timerManager.setOnTimerUpdate((remainingMs) => {
        if (remainingMs <= 0) {
          endTime = Date.now();
          const elapsed = endTime - startTime;
          
          // Should be approximately 2 seconds (allowing for some tolerance)
          expect(elapsed).toBeGreaterThanOrEqual(1900);
          expect(elapsed).toBeLessThanOrEqual(2100);
          
          done();
        }
      });
      
      timerManager.start();
    });

    it('should handle very short durations', (done) => {
      timerManager.initialize(0.1); // 100ms
      const startTime = Date.now();
      
      timerManager.setOnTimerUpdate((remainingMs) => {
        if (remainingMs <= 0) {
          const elapsed = Date.now() - startTime;
          expect(elapsed).toBeGreaterThanOrEqual(50);
          expect(elapsed).toBeLessThanOrEqual(200);
          
          done();
        }
      });
      
      timerManager.start();
    });
  });

  describe('Property-Based Tests', () => {
    it('should handle various durations correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 300 }), // 1 second to 5 minutes
          async (duration) => {
            const freshTimer = new TimerManager();
            freshTimer.initialize(duration);
            
            expect(freshTimer.getRemainingTime()).toBe(duration * 1000);
            
            freshTimer.stop();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should maintain timer state consistency', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.constantFrom('START', 'STOP', 'PAUSE', 'RESUME'), { minLength: 1, maxLength: 10 }),
          async (actions) => {
            const freshTimer = new TimerManager();
            freshTimer.initialize(60);
            
            let isRunning = false;
            
            for (const action of actions) {
              switch (action) {
                case 'START':
                  if (!isRunning) {
                    freshTimer.start();
                    isRunning = true;
                  }
                  break;
                case 'STOP':
                  freshTimer.stop();
                  isRunning = false;
                  break;
                case 'PAUSE':
                  if (isRunning) {
                    freshTimer.pause();
                    isRunning = false;
                  }
                  break;
                case 'RESUME':
                  if (!isRunning) {
                    freshTimer.resume();
                    isRunning = true;
                  }
                  break;
              }
              
              expect(freshTimer.isTimerRunning()).toBe(isRunning);
            }
            
            freshTimer.stop();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero duration', () => {
      timerManager.initialize(0);
      expect(timerManager.getRemainingTime()).toBe(60000); // Should default to 60 seconds
    });

    it('should handle negative duration', () => {
      timerManager.initialize(-100);
      expect(timerManager.getRemainingTime()).toBe(60000); // Should default to 60 seconds
    });

    it('should handle very large duration', () => {
      timerManager.initialize(3600); // 1 hour
      expect(timerManager.getRemainingTime()).toBe(3600000);
    });

    it('should handle rapid start/stop cycles', () => {
      timerManager.initialize(60);
      
      for (let i = 0; i < 10; i++) {
        timerManager.start();
        timerManager.stop();
      }
      
      expect(timerManager.isActive()).toBe(false);
    });

    it('should handle callback errors gracefully', () => {
      const errorCallback = jest.fn(() => {
        throw new Error('Callback error');
      });
      
      timerManager.initialize(60);
      timerManager.setOnTimerUpdate(errorCallback);
      timerManager.setOnRoundEnd(errorCallback);
      
      // Should not throw even if callbacks error
      expect(() => {
        timerManager.start();
        timerManager.stop();
      }).not.toThrow();
    });
  });

  describe('Performance Tests', () => {
    it('should handle many timer instances efficiently', () => {
      const timers: TimerManager[] = [];
      const startTime = performance.now();
      
      // Create 100 timer instances
      for (let i = 0; i < 100; i++) {
        const timer = new TimerManager();
        timer.initialize(60);
        timers.push(timer);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100); // Should complete in less than 100ms
      
      // Clean up
      timers.forEach(timer => timer.stop());
    });

    it('should handle rapid callback updates efficiently', (done) => {
      let callbackCount = 0;
      const maxCallbacks = 100;
      
      timerManager.initialize(1); // 1 second
      timerManager.setOnTimerUpdate(() => {
        callbackCount++;
        if (callbackCount >= maxCallbacks) {
          timerManager.stop();
          done();
        }
      });
      
      const startTime = performance.now();
      timerManager.start();
    });
  });

  describe('MockTimerManager Tests', () => {
    let mockTimer: MockTimerManager;

    beforeEach(() => {
      mockTimer = new MockTimerManager();
    });

    it('should initialize correctly', () => {
      mockTimer.initialize(60);
      expect(mockTimer.getRemainingTime()).toBe(60000);
      expect(mockTimer.isTimerRunning()).toBe(false);
    });

    it('should start correctly', () => {
      mockTimer.initialize(60);
      mockTimer.start();
      expect(mockTimer.isTimerRunning()).toBe(true);
    });

    it('should simulate time elapsed', () => {
      mockTimer.initialize(60);
      mockTimer.start();
      
      mockTimer.simulateTimeElapsed(10000); // 10 seconds
      
      expect(mockTimer.getRemainingTime()).toBe(50000);
    });

    it('should simulate timer completion', () => {
      mockTimer.initialize(60);
      mockTimer.start();
      
      mockTimer.simulateTimerComplete();
      
      expect(mockTimer.getRemainingTime()).toBe(0);
      expect(mockTimer.isTimerRunning()).toBe(false);
    });

    it('should call callbacks on time updates', () => {
      const callback = jest.fn();
      mockTimer.initialize(60);
      mockTimer.setOnTimerUpdate(callback);
      mockTimer.start();
      
      mockTimer.simulateTimeElapsed(5000);
      
      expect(callback).toHaveBeenCalledWith(55000);
    });

    it('should handle multiple time simulations', () => {
      mockTimer.initialize(60);
      mockTimer.start();
      
      mockTimer.simulateTimeElapsed(10000); // 50s remaining
      expect(mockTimer.getRemainingTime()).toBe(50000);
      
      mockTimer.simulateTimeElapsed(20000); // 30s remaining
      expect(mockTimer.getRemainingTime()).toBe(30000);
      
      mockTimer.simulateTimeElapsed(30000); // 0s remaining
      expect(mockTimer.getRemainingTime()).toBe(0);
      expect(mockTimer.isTimerRunning()).toBe(false);
    });
  });

  describe('Integration with Game State', () => {
    it('should work with GameState timer integration', async () => {
      const { GameState } = await import('../../services/gameState');
      const gameState = new GameState();
      
      const mockTimer = new MockTimerManager();
      mockTimer.initialize(60);
      mockTimer.start();
      
      // Simulate game progression
      const round = gameState.startRound(60);
      expect(round.isActive).toBe(true);
      
      // Simulate time passing
      mockTimer.simulateTimeElapsed(30000);
      expect(mockTimer.getRemainingTime()).toBe(30000);
      
      // Simulate timer ending
      mockTimer.simulateTimerComplete();
      gameState.endRound();
      
      expect(gameState.isRoundActive()).toBe(false);
    });

    it('should maintain synchronization with game events', async () => {
      const { GameState } = await import('../../services/gameState');
      const gameState = new GameState();
      
      const mockTimer = new MockTimerManager();
      mockTimer.initialize(60);
      mockTimer.start();
      
      gameState.startRound(60);
      
      // Simulate game actions while timer runs
      gameState.registerCorrectGuess('item1');
      mockTimer.simulateTimeElapsed(10000);
      
      gameState.registerSkip('item2');
      mockTimer.simulateTimeElapsed(10000);
      
      gameState.registerCorrectGuess('item3');
      mockTimer.simulateTimeElapsed(40000); // Timer ends
      
      expect(mockTimer.getRemainingTime()).toBe(0);
      expect(gameState.getCurrentScore()).toBe(2);
    });
  });
});
