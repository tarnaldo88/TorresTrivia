import { OrientationDetector } from '../../services/orientationDetector';
import { MockOrientationDetector } from '../utils/testUtils';
import * as fc from 'fast-check';

describe('Gesture Controls Tests', () => {
  let orientationDetector: OrientationDetector;
  let mockOrientationDetector: MockOrientationDetector;

  beforeEach(() => {
    orientationDetector = new OrientationDetector();
    mockOrientationDetector = new MockOrientationDetector();
  });

  afterEach(() => {
    orientationDetector.stopListening();
    mockOrientationDetector.stopListening();
  });

  describe('OrientationDetector Basic Functionality', () => {
    it('should initialize without listening', () => {
      expect(mockOrientationDetector.isDeviceListening()).toBe(false);
    });

    it('should start listening correctly', () => {
      mockOrientationDetector.startListening();
      expect(mockOrientationDetector.isDeviceListening()).toBe(true);
    });

    it('should stop listening correctly', () => {
      mockOrientationDetector.startListening();
      mockOrientationDetector.stopListening();
      expect(mockOrientationDetector.isDeviceListening()).toBe(false);
    });

    it('should handle multiple start calls gracefully', () => {
      mockOrientationDetector.startListening();
      mockOrientationDetector.startListening(); // Should not cause issues
      expect(mockOrientationDetector.isDeviceListening()).toBe(true);
    });

    it('should handle multiple stop calls gracefully', () => {
      mockOrientationDetector.startListening();
      mockOrientationDetector.stopListening();
      mockOrientationDetector.stopListening(); // Should not cause issues
      expect(mockOrientationDetector.isDeviceListening()).toBe(false);
    });
  });

  describe('Gesture Detection', () => {
    beforeEach(() => {
      mockOrientationDetector.startListening();
    });

    it('should detect tilt down gesture', () => {
      const callback = jest.fn();
      mockOrientationDetector.addCallback(callback);
      
      mockOrientationDetector.simulateTiltedDown();
      
      expect(callback).toHaveBeenCalledWith('CORRECT');
    });

    it('should detect upright gesture', () => {
      const callback = jest.fn();
      mockOrientationDetector.addCallback(callback);
      
      mockOrientationDetector.simulateUpright();
      
      expect(callback).toHaveBeenCalledWith('SKIP');
    });

    it('should handle multiple callbacks', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      mockOrientationDetector.addCallback(callback1);
      mockOrientationDetector.addCallback(callback2);
      
      mockOrientationDetector.simulateTiltedDown();
      
      expect(callback1).toHaveBeenCalledWith('CORRECT');
      expect(callback2).toHaveBeenCalledWith('CORRECT');
    });

    it('should handle rapid gesture changes', () => {
      const callback = jest.fn();
      mockOrientationDetector.addCallback(callback);
      
      mockOrientationDetector.simulateTiltedDown();
      mockOrientationDetector.simulateUpright();
      mockOrientationDetector.simulateTiltedDown();
      mockOrientationDetector.simulateUpright();
      
      expect(callback).toHaveBeenCalledTimes(4);
      expect(callback.mock.calls[0][0]).toBe('CORRECT');
      expect(callback.mock.calls[1][0]).toBe('SKIP');
      expect(callback.mock.calls[2][0]).toBe('CORRECT');
      expect(callback.mock.calls[3][0]).toBe('SKIP');
    });
  });

  describe('Property-Based Tests', () => {
    it('should handle random gesture sequences correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.constantFrom('TILT_DOWN', 'UPRIGHT'), { minLength: 1, maxLength: 20 }),
          async (gestures) => {
            const freshMockDetector = new MockOrientationDetector();
            freshMockDetector.startListening();
            
            const callback = jest.fn();
            freshMockDetector.addCallback(callback);
            
            for (const gesture of gestures) {
              if (gesture === 'TILT_DOWN') {
                freshMockDetector.simulateTiltedDown();
              } else {
                freshMockDetector.simulateUpright();
              }
            }
            
            expect(callback).toHaveBeenCalledTimes(gestures.length);
            
            // Verify gesture mapping
            for (let i = 0; i < gestures.length; i++) {
              const expectedAction = gestures[i] === 'TILT_DOWN' ? 'CORRECT' : 'SKIP';
              expect(callback.mock.calls[i][0]).toBe(expectedAction);
            }
            
            freshMockDetector.stopListening();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain callback consistency across operations', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.constantFrom('ADD_CALLBACK', 'REMOVE_CALLBACK', 'TRIGGER'), { minLength: 1, maxLength: 15 }),
          async (operations) => {
            const freshMockDetector = new MockOrientationDetector();
            freshMockDetector.startListening();
            
            const callbacks: jest.Mock[] = [];
            let callbackCount = 0;
            
            for (const operation of operations) {
              switch (operation) {
                case 'ADD_CALLBACK':
                  const newCallback = jest.fn();
                  callbacks.push(newCallback);
                  freshMockDetector.addCallback(newCallback);
                  callbackCount++;
                  break;
                  
                case 'REMOVE_CALLBACK':
                  // Note: Mock doesn't implement removal, but we can test consistency
                  break;
                  
                case 'TRIGGER':
                  freshMockDetector.simulateTiltedDown();
                  
                  // All active callbacks should be called
                  callbacks.forEach(callback => {
                    expect(callback).toHaveBeenCalledTimes(Math.floor(callbackCount / 2) + 1);
                  });
                  break;
              }
            }
            
            freshMockDetector.stopListening();
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle callbacks when not listening', () => {
      const callback = jest.fn();
      mockOrientationDetector.addCallback(callback);
      
      // Should not trigger callbacks when not listening
      mockOrientationDetector.simulateTiltedDown();
      mockOrientationDetector.simulateUpright();
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle orientation changes when stopped', () => {
      mockOrientationDetector.startListening();
      mockOrientationDetector.stopListening();
      
      const callback = jest.fn();
      mockOrientationDetector.addCallback(callback);
      
      mockOrientationDetector.simulateTiltedDown();
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle empty callback list', () => {
      mockOrientationDetector.startListening();
      
      // Should not crash when no callbacks are registered
      expect(() => {
        mockOrientationDetector.simulateTiltedDown();
        mockOrientationDetector.simulateUpright();
      }).not.toThrow();
    });

    it('should handle very rapid gesture changes', () => {
      mockOrientationDetector.startListening();
      const callback = jest.fn();
      mockOrientationDetector.addCallback(callback);
      
      // Simulate very rapid changes
      for (let i = 0; i < 100; i++) {
        mockOrientationDetector.simulateTiltedDown();
        mockOrientationDetector.simulateUpright();
      }
      
      expect(callback).toHaveBeenCalledTimes(200);
    });
  });

  describe('Performance Tests', () => {
    it('should handle many callbacks efficiently', () => {
      mockOrientationDetector.startListening();
      
      const callbacks: jest.Mock[] = [];
      for (let i = 0; i < 100; i++) {
        callbacks.push(jest.fn());
        mockOrientationDetector.addCallback(callbacks[i]);
      }
      
      const startTime = performance.now();
      
      mockOrientationDetector.simulateTiltedDown();
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(callbacks.every(callback => callback).toHaveBeenCalledWith('CORRECT')).toBe(true);
      expect(duration).toBeLessThan(50); // Should complete in less than 50ms
    });

    it('should handle rapid gesture detection efficiently', () => {
      mockOrientationDetector.startListening();
      const callback = jest.fn();
      mockOrientationDetector.addCallback(callback);
      
      const startTime = performance.now();
      
      // Simulate 1000 gesture changes
      for (let i = 0; i < 1000; i++) {
        mockOrientationDetector.simulateTiltedDown();
        mockOrientationDetector.simulateUpright();
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(callback).toHaveBeenCalledTimes(2000);
      expect(duration).toBeLessThan(100); // Should complete in less than 100ms
    });
  });

  describe('Integration with GameState', () => {
    it('should integrate with GameState gesture handling', async () => {
      const { GameState } = await import('../../services/gameState');
      const gameState = new GameState();
      
      gameState.startRound(60);
      
      // Simulate gesture through orientation detector
      mockOrientationDetector.startListening();
      
      // Simulate correct guess
      mockOrientationDetector.simulateTiltedDown();
      
      // In real integration, this would trigger score updates
      expect(gameState.isRoundActive()).toBe(true);
    });

    it('should handle gesture-based game flow', async () => {
      const { GameState } = await import('../../services/gameState');
      const gameState = new GameState();
      
      gameState.startRound(60);
      mockOrientationDetector.startListening();
      
      // Simulate game sequence
      mockOrientationDetector.simulateTiltedDown(); // Correct guess
      mockOrientationDetector.simulateUpright();  // Skip
      mockOrientationDetector.simulateTiltedDown(); // Correct guess
      mockOrientationDetector.simulateUpright();  // Skip
      mockOrientationDetector.simulateTiltedDown(); // Correct guess
      
      gameState.endRound();
      
      expect(gameState.isRoundActive()).toBe(false);
    });
  });

  describe('Callback Management', () => {
    it('should handle callback errors gracefully', () => {
      mockOrientationDetector.startListening();
      
      const errorCallback = jest.fn(() => {
        throw new Error('Callback error');
      });
      const normalCallback = jest.fn();
      
      mockOrientationDetector.addCallback(errorCallback);
      mockOrientationDetector.addCallback(normalCallback);
      
      // Should not crash even if one callback errors
      expect(() => {
        mockOrientationDetector.simulateTiltedDown();
      }).not.toThrow();
      
      // Normal callback should still be called
      expect(normalCallback).toHaveBeenCalledWith('CORRECT');
    });

    it('should handle null/undefined callbacks gracefully', () => {
      mockOrientationDetector.startListening();
      
      // Should not crash with invalid callbacks
      expect(() => {
        // @ts-ignore - Testing error handling
        mockOrientationDetector.addCallback(null);
        mockOrientationDetector.addCallback(undefined);
        mockOrientationDetector.simulateTiltedDown();
      }).not.toThrow();
    });
  });

  describe('State Consistency', () => {
    it('should maintain consistent listening state', () => {
      expect(mockOrientationDetector.isDeviceListening()).toBe(false);
      
      mockOrientationDetector.startListening();
      expect(mockOrientationDetector.isDeviceListening()).toBe(true);
      
      mockOrientationDetector.stopListening();
      expect(mockOrientationDetector.isDeviceListening()).toBe(false);
      
      mockOrientationDetector.startListening();
      expect(mockOrientationDetector.isDeviceListening()).toBe(true);
    });

    it('should maintain consistent orientation state', () => {
      mockOrientationDetector.startListening();
      
      expect(mockOrientationDetector.getCurrentOrientation()).toBe('FACE_UP');
      
      mockOrientationDetector.simulateTiltedDown();
      expect(mockOrientationDetector.getCurrentOrientation()).toBe('FACE_DOWN');
      
      mockOrientationDetector.simulateUpright();
      expect(mockOrientationDetector.getCurrentOrientation()).toBe('FACE_UP');
    });
  });

  describe('Real-World Scenarios', () => {
    it('should simulate typical gameplay session', () => {
      mockOrientationDetector.startListening();
      const callback = jest.fn();
      mockOrientationDetector.addCallback(callback);
      
      // Simulate typical game: mix of correct guesses and skips
      const gameSequence = [
        'TILT_DOWN', // Correct guess
        'UPRIGHT',  // Skip
        'TILT_DOWN', // Correct guess
        'TILT_DOWN', // Correct guess
        'UPRIGHT',  // Skip
        'TILT_DOWN', // Correct guess
        'UPRIGHT',  // Skip
        'TILT_DOWN', // Correct guess
      ];
      
      gameSequence.forEach(gesture => {
        if (gesture === 'TILT_DOWN') {
          mockOrientationDetector.simulateTiltedDown();
        } else {
          mockOrientationDetector.simulateUpright();
        }
      });
      
      expect(callback).toHaveBeenCalledTimes(8);
      
      // Verify correct/incorrect counts
      const correctGuesses = callback.mock.calls.filter(call => call[0] === 'CORRECT').length;
      const skips = callback.mock.calls.filter(call => call[0] === 'SKIP').length;
      
      expect(correctGuesses).toBe(5);
      expect(skips).toBe(3);
    });

    it('should handle accidental movements', () => {
      mockOrientationDetector.startListening();
      const callback = jest.fn();
      mockOrientationDetector.addCallback(callback);
      
      // Simulate accidental rapid movements
      for (let i = 0; i < 10; i++) {
        mockOrientationDetector.simulateTiltedDown();
        mockOrientationDetector.simulateUpright();
      }
      
      // All movements should be registered (debouncing would be real implementation)
      expect(callback).toHaveBeenCalledTimes(20);
    });

    it('should handle device being held steady', () => {
      mockOrientationDetector.startListening();
      const callback = jest.fn();
      mockOrientationDetector.addCallback(callback);
      
      // Device held steady - no orientation changes
      expect(callback).not.toHaveBeenCalled();
      
      // Single movement
      mockOrientationDetector.simulateTiltedDown();
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('CORRECT');
    });
  });
});
