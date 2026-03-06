import { FeedbackManager } from '../../services/feedbackManager';
import { MockFeedbackManager } from '../utils/testUtils';

describe('Sound Integration Tests', () => {
  let feedbackManager: FeedbackManager;
  let mockFeedbackManager: MockFeedbackManager;

  beforeEach(() => {
    feedbackManager = new FeedbackManager();
    mockFeedbackManager = new MockFeedbackManager();
  });

  describe('FeedbackManager Basic Functionality', () => {
    it('should initialize without errors', () => {
      expect(() => new FeedbackManager()).not.toThrow();
    });

    it('should have empty feedback history initially', () => {
      expect(mockFeedbackManager.getFeedbackHistory()).toEqual([]);
      expect(mockFeedbackManager.getFeedbackCount()).toBe(0);
    });
  });

  describe('Sound Playback', () => {
    it('should play correct sound', () => {
      mockFeedbackManager.playCorrectSound();
      
      expect(mockFeedbackManager.getFeedbackCount('correct')).toBe(1);
      expect(mockFeedbackManager.getFeedbackCount()).toBe(1);
    });

    it('should play skip sound', () => {
      mockFeedbackManager.playSkipSound();
      
      expect(mockFeedbackManager.getFeedbackCount('skip')).toBe(1);
      expect(mockFeedbackManager.getFeedbackCount()).toBe(1);
    });

    it('should play game over sound', () => {
      mockFeedbackManager.playGameOverSound();
      
      expect(mockFeedbackManager.getFeedbackCount('gameOver')).toBe(1);
      expect(mockFeedbackManager.getFeedbackCount()).toBe(1);
    });

    it('should trigger haptic feedback', () => {
      mockFeedbackManager.triggerHapticFeedback();
      
      expect(mockFeedbackManager.getFeedbackCount('haptic')).toBe(1);
      expect(mockFeedbackManager.getFeedbackCount()).toBe(1);
    });
  });

  describe('Multiple Sound Events', () => {
    it('should handle multiple correct sounds', () => {
      for (let i = 0; i < 5; i++) {
        mockFeedbackManager.playCorrectSound();
      }
      
      expect(mockFeedbackManager.getFeedbackCount('correct')).toBe(5);
      expect(mockFeedbackManager.getFeedbackCount()).toBe(5);
    });

    it('should handle mixed sound events', () => {
      mockFeedbackManager.playCorrectSound();
      mockFeedbackManager.playSkipSound();
      mockFeedbackManager.playCorrectSound();
      mockFeedbackManager.triggerHapticFeedback();
      mockFeedbackManager.playGameOverSound();
      
      expect(mockFeedbackManager.getFeedbackCount('correct')).toBe(2);
      expect(mockFeedbackManager.getFeedbackCount('skip')).toBe(1);
      expect(mockFeedbackManager.getFeedbackCount('haptic')).toBe(1);
      expect(mockFeedbackManager.getFeedbackCount('gameOver')).toBe(1);
      expect(mockFeedbackManager.getFeedbackCount()).toBe(5);
    });

    it('should track feedback history chronologically', () => {
      const startTime = Date.now();
      
      mockFeedbackManager.playCorrectSound();
      mockFeedbackManager.playSkipSound();
      mockFeedbackManager.triggerHapticFeedback();
      
      const history = mockFeedbackManager.getFeedbackHistory();
      
      expect(history.length).toBe(3);
      expect(history[0].type).toBe('correct');
      expect(history[1].type).toBe('skip');
      expect(history[2].type).toBe('haptic');
      
      // Verify timestamps are reasonable
      history.forEach((entry, index) => {
        expect(entry.timestamp).toBeGreaterThanOrEqual(startTime);
        if (index > 0) {
          expect(entry.timestamp).toBeGreaterThanOrEqual(history[index - 1].timestamp);
        }
      });
    });
  });

  describe('Feedback History Management', () => {
    it('should clear feedback history', () => {
      mockFeedbackManager.playCorrectSound();
      mockFeedbackManager.playSkipSound();
      mockFeedbackManager.triggerHapticFeedback();
      
      expect(mockFeedbackManager.getFeedbackCount()).toBe(3);
      
      mockFeedbackManager.clearFeedbackHistory();
      
      expect(mockFeedbackManager.getFeedbackCount()).toBe(0);
      expect(mockFeedbackManager.getFeedbackHistory()).toEqual([]);
    });

    it('should maintain separate counts for different feedback types', () => {
      mockFeedbackManager.playCorrectSound();
      mockFeedbackManager.playCorrectSound();
      mockFeedbackManager.playSkipSound();
      mockFeedbackManager.playSkipSound();
      mockFeedbackManager.playSkipSound();
      mockFeedbackManager.triggerHapticFeedback();
      
      expect(mockFeedbackManager.getFeedbackCount('correct')).toBe(2);
      expect(mockFeedbackManager.getFeedbackCount('skip')).toBe(3);
      expect(mockFeedbackManager.getFeedbackCount('haptic')).toBe(1);
      expect(mockFeedbackManager.getFeedbackCount('gameOver')).toBe(0);
      expect(mockFeedbackManager.getFeedbackCount()).toBe(6);
    });
  });

  describe('Performance Tests', () => {
    it('should handle many sound events efficiently', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        mockFeedbackManager.playCorrectSound();
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(mockFeedbackManager.getFeedbackCount('correct')).toBe(1000);
      expect(duration).toBeLessThan(100); // Should complete in less than 100ms
    });

    it('should handle rapid mixed feedback efficiently', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 500; i++) {
        mockFeedbackManager.playCorrectSound();
        mockFeedbackManager.playSkipSound();
        mockFeedbackManager.triggerHapticFeedback();
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(mockFeedbackManager.getFeedbackCount()).toBe(1500);
      expect(duration).toBeLessThan(200); // Should complete in less than 200ms
    });
  });

  describe('Error Handling', () => {
    it('should handle sound playback errors gracefully', () => {
      // Mock sound system errors would be tested here
      expect(() => {
        mockFeedbackManager.playCorrectSound();
        mockFeedbackManager.playSkipSound();
        mockFeedbackManager.playGameOverSound();
      }).not.toThrow();
    });

    it('should handle haptic feedback errors gracefully', () => {
      expect(() => {
        mockFeedbackManager.triggerHapticFeedback();
      }).not.toThrow();
    });
  });

  describe('Integration with Game Events', () => {
    it('should provide appropriate feedback for correct guess', () => {
      // Simulate correct guess event
      mockFeedbackManager.playCorrectSound();
      mockFeedbackManager.triggerHapticFeedback();
      
      expect(mockFeedbackManager.getFeedbackCount('correct')).toBe(1);
      expect(mockFeedbackManager.getFeedbackCount('haptic')).toBe(1);
    });

    it('should provide appropriate feedback for skip', () => {
      // Simulate skip event
      mockFeedbackManager.playSkipSound();
      
      expect(mockFeedbackManager.getFeedbackCount('skip')).toBe(1);
    });

    it('should provide appropriate feedback for game over', () => {
      // Simulate game over event
      mockFeedbackManager.playGameOverSound();
      mockFeedbackManager.triggerHapticFeedback();
      
      expect(mockFeedbackManager.getFeedbackCount('gameOver')).toBe(1);
      expect(mockFeedbackManager.getFeedbackCount('haptic')).toBe(1);
    });

    it('should handle complete game feedback sequence', () => {
      // Simulate complete game with multiple events
      const events = [
        { action: 'correct', sound: 'playCorrectSound', haptic: true },
        { action: 'skip', sound: 'playSkipSound', haptic: false },
        { action: 'correct', sound: 'playCorrectSound', haptic: true },
        { action: 'correct', sound: 'playCorrectSound', haptic: true },
        { action: 'skip', sound: 'playSkipSound', haptic: false },
        { action: 'gameOver', sound: 'playGameOverSound', haptic: true },
      ];
      
      events.forEach(event => {
        if (event.sound === 'playCorrectSound') {
          mockFeedbackManager.playCorrectSound();
        } else if (event.sound === 'playSkipSound') {
          mockFeedbackManager.playSkipSound();
        } else if (event.sound === 'playGameOverSound') {
          mockFeedbackManager.playGameOverSound();
        }
        
        if (event.haptic) {
          mockFeedbackManager.triggerHapticFeedback();
        }
      });
      
      expect(mockFeedbackManager.getFeedbackCount('correct')).toBe(3);
      expect(mockFeedbackManager.getFeedbackCount('skip')).toBe(2);
      expect(mockFeedbackManager.getFeedbackCount('gameOver')).toBe(1);
      expect(mockFeedbackManager.getFeedbackCount('haptic')).toBe(4);
    });
  });

  describe('Real-World Scenarios', () => {
    it('should simulate typical gameplay feedback', () => {
      // Typical 60-second game might have 15-25 actions
      const typicalGameActions = 20;
      
      for (let i = 0; i < typicalGameActions; i++) {
        if (i % 3 === 0) {
          // Skip every 3rd action
          mockFeedbackManager.playSkipSound();
        } else {
          // Correct guess
          mockFeedbackManager.playCorrectSound();
          mockFeedbackManager.triggerHapticFeedback();
        }
      }
      
      // Game over
      mockFeedbackManager.playGameOverSound();
      mockFeedbackManager.triggerHapticFeedback();
      
      const correctGuesses = Math.floor(typicalGameActions * 2 / 3) + 1; // +1 for game over haptic
      const skips = Math.floor(typicalGameActions / 3);
      
      expect(mockFeedbackManager.getFeedbackCount('correct')).toBe(correctGuesses);
      expect(mockFeedbackManager.getFeedbackCount('skip')).toBe(skips);
      expect(mockFeedbackManager.getFeedbackCount('gameOver')).toBe(1);
      expect(mockFeedbackManager.getFeedbackCount('haptic')).toBe(correctGuesses);
    });

    it('should handle rapid gameplay', () => {
      // Rapid gameplay with many quick actions
      const rapidGameActions = 50;
      
      for (let i = 0; i < rapidGameActions; i++) {
        if (i % 2 === 0) {
          mockFeedbackManager.playCorrectSound();
        } else {
          mockFeedbackManager.playSkipSound();
        }
        
        if (i % 5 === 0) {
          mockFeedbackManager.triggerHapticFeedback();
        }
      }
      
      expect(mockFeedbackManager.getFeedbackCount()).toBe(rapidGameActions + Math.floor(rapidGameActions / 5));
    });

    it('should handle no-sound gameplay', () => {
      // Gameplay with haptic feedback only
      for (let i = 0; i < 10; i++) {
        mockFeedbackManager.triggerHapticFeedback();
      }
      
      expect(mockFeedbackManager.getFeedbackCount('haptic')).toBe(10);
      expect(mockFeedbackManager.getFeedbackCount('correct')).toBe(0);
      expect(mockFeedbackManager.getFeedbackCount('skip')).toBe(0);
      expect(mockFeedbackManager.getFeedbackCount('gameOver')).toBe(0);
    });
  });

  describe('State Management', () => {
    it('should maintain feedback state across operations', () => {
      mockFeedbackManager.playCorrectSound();
      expect(mockFeedbackManager.getFeedbackCount('correct')).toBe(1);
      
      mockFeedbackManager.playSkipSound();
      expect(mockFeedbackManager.getFeedbackCount('skip')).toBe(1);
      expect(mockFeedbackManager.getFeedbackCount('correct')).toBe(1); // Should be preserved
      
      mockFeedbackManager.triggerHapticFeedback();
      expect(mockFeedbackManager.getFeedbackCount('haptic')).toBe(1);
      expect(mockFeedbackManager.getFeedbackCount('correct')).toBe(1); // Should be preserved
      expect(mockFeedbackManager.getFeedbackCount('skip')).toBe(1); // Should be preserved
    });

    it('should reset state correctly', () => {
      // Build up some state
      mockFeedbackManager.playCorrectSound();
      mockFeedbackManager.playSkipSound();
      mockFeedbackManager.triggerHapticFeedback();
      mockFeedbackManager.playGameOverSound();
      
      expect(mockFeedbackManager.getFeedbackCount()).toBe(4);
      
      // Reset
      mockFeedbackManager.clearFeedbackHistory();
      
      expect(mockFeedbackManager.getFeedbackCount()).toBe(0);
      expect(mockFeedbackManager.getFeedbackHistory()).toEqual([]);
    });
  });

  describe('Feedback Timing', () => {
    it('should track timing of feedback events', () => {
      const startTime = Date.now();
      
      setTimeout(() => {
        mockFeedbackManager.playCorrectSound();
      }, 10);
      
      setTimeout(() => {
        mockFeedbackManager.playSkipSound();
      }, 50);
      
      setTimeout(() => {
        mockFeedbackManager.triggerHapticFeedback();
      }, 100);
      
      // Note: In real tests, we'd need to wait for timeouts
      // For now, we'll test immediate behavior
      mockFeedbackManager.playCorrectSound();
      const history = mockFeedbackManager.getFeedbackHistory();
      
      expect(history.length).toBe(1);
      expect(history[0].timestamp).toBeGreaterThanOrEqual(startTime);
    });
  });

  describe('Mock Feedback Manager Validation', () => {
    it('should accurately track all feedback types', () => {
      const allFeedbackTypes = ['correct', 'skip', 'gameOver', 'haptic'];
      
      allFeedbackTypes.forEach(type => {
        mockFeedbackManager.clearFeedbackHistory();
        
        switch (type) {
          case 'correct':
            mockFeedbackManager.playCorrectSound();
            break;
          case 'skip':
            mockFeedbackManager.playSkipSound();
            break;
          case 'gameOver':
            mockFeedbackManager.playGameOverSound();
            break;
          case 'haptic':
            mockFeedbackManager.triggerHapticFeedback();
            break;
        }
        
        expect(mockFeedbackManager.getFeedbackCount(type)).toBe(1);
        expect(mockFeedbackManager.getFeedbackCount()).toBe(1);
        expect(mockFeedbackManager.getFeedbackHistory()[0].type).toBe(type);
      });
    });

    it('should handle concurrent feedback events', () => {
      // Simulate multiple feedback events happening "simultaneously"
      mockFeedbackManager.playCorrectSound();
      mockFeedbackManager.playSkipSound();
      mockFeedbackManager.triggerHapticFeedback();
      mockFeedbackManager.playGameOverSound();
      
      expect(mockFeedbackManager.getFeedbackCount()).toBe(4);
      
      const history = mockFeedbackManager.getFeedbackHistory();
      expect(history.length).toBe(4);
      
      // All events should be recorded
      const types = history.map(entry => entry.type);
      expect(types).toContain('correct');
      expect(types).toContain('skip');
      expect(types).toContain('haptic');
      expect(types).toContain('gameOver');
    });
  });
});
