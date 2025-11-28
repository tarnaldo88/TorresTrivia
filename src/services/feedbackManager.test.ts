import { FeedbackManager, Feedback } from './feedbackManager';
import { GameAction } from '../types/index';
import * as fc from 'fast-check';

describe('FeedbackManager', () => {
  let feedbackManager: FeedbackManager;

  beforeEach(() => {
    feedbackManager = new FeedbackManager();
  });

  describe('generateCorrectGuessFeedback', () => {
    it('should trigger callback with correct guess feedback', () => {
      const mockCallback = jest.fn();
      feedbackManager.onFeedback(mockCallback);

      const action: GameAction = {
        type: 'CORRECT',
        timestamp: Date.now(),
        itemId: 'item1',
      };

      feedbackManager.generateCorrectGuessFeedback(action);

      expect(mockCallback).toHaveBeenCalledTimes(1);
      const feedback = mockCallback.mock.calls[0][0];
      expect(feedback.type).toBe('CORRECT');
      expect(feedback.visualFeedback.color).toBe('#4CAF50');
      expect(feedback.audioFeedback.soundType).toBe('success');
    });

    it('should not trigger callback if feedback is disabled', () => {
      const mockCallback = jest.fn();
      feedbackManager.onFeedback(mockCallback);
      feedbackManager.disable();

      const action: GameAction = {
        type: 'CORRECT',
        timestamp: Date.now(),
        itemId: 'item1',
      };

      feedbackManager.generateCorrectGuessFeedback(action);

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should not trigger callback for non-CORRECT action type', () => {
      const mockCallback = jest.fn();
      feedbackManager.onFeedback(mockCallback);

      const action: GameAction = {
        type: 'SKIP',
        timestamp: Date.now(),
        itemId: 'item1',
      };

      feedbackManager.generateCorrectGuessFeedback(action);

      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('generateSkipFeedback', () => {
    it('should trigger callback with skip feedback', () => {
      const mockCallback = jest.fn();
      feedbackManager.onFeedback(mockCallback);

      const action: GameAction = {
        type: 'SKIP',
        timestamp: Date.now(),
        itemId: 'item1',
      };

      feedbackManager.generateSkipFeedback(action);

      expect(mockCallback).toHaveBeenCalledTimes(1);
      const feedback = mockCallback.mock.calls[0][0];
      expect(feedback.type).toBe('SKIP');
      expect(feedback.visualFeedback.color).toBe('#FF9800');
      expect(feedback.audioFeedback.soundType).toBe('skip');
    });

    it('should not trigger callback if feedback is disabled', () => {
      const mockCallback = jest.fn();
      feedbackManager.onFeedback(mockCallback);
      feedbackManager.disable();

      const action: GameAction = {
        type: 'SKIP',
        timestamp: Date.now(),
        itemId: 'item1',
      };

      feedbackManager.generateSkipFeedback(action);

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should not trigger callback for non-SKIP action type', () => {
      const mockCallback = jest.fn();
      feedbackManager.onFeedback(mockCallback);

      const action: GameAction = {
        type: 'CORRECT',
        timestamp: Date.now(),
        itemId: 'item1',
      };

      feedbackManager.generateSkipFeedback(action);

      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('generateFeedback', () => {
    it('should generate correct guess feedback for CORRECT action', () => {
      const mockCallback = jest.fn();
      feedbackManager.onFeedback(mockCallback);

      const action: GameAction = {
        type: 'CORRECT',
        timestamp: Date.now(),
        itemId: 'item1',
      };

      feedbackManager.generateFeedback(action);

      expect(mockCallback).toHaveBeenCalledTimes(1);
      const feedback = mockCallback.mock.calls[0][0];
      expect(feedback.type).toBe('CORRECT');
    });

    it('should generate skip feedback for SKIP action', () => {
      const mockCallback = jest.fn();
      feedbackManager.onFeedback(mockCallback);

      const action: GameAction = {
        type: 'SKIP',
        timestamp: Date.now(),
        itemId: 'item1',
      };

      feedbackManager.generateFeedback(action);

      expect(mockCallback).toHaveBeenCalledTimes(1);
      const feedback = mockCallback.mock.calls[0][0];
      expect(feedback.type).toBe('SKIP');
    });

    it('should not generate feedback if disabled', () => {
      const mockCallback = jest.fn();
      feedbackManager.onFeedback(mockCallback);
      feedbackManager.disable();

      const action: GameAction = {
        type: 'CORRECT',
        timestamp: Date.now(),
        itemId: 'item1',
      };

      feedbackManager.generateFeedback(action);

      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('enable and disable', () => {
    it('should enable feedback generation', () => {
      feedbackManager.disable();
      expect(feedbackManager.isEnabledFeedback()).toBe(false);
      feedbackManager.enable();
      expect(feedbackManager.isEnabledFeedback()).toBe(true);
    });

    it('should disable feedback generation', () => {
      expect(feedbackManager.isEnabledFeedback()).toBe(true);
      feedbackManager.disable();
      expect(feedbackManager.isEnabledFeedback()).toBe(false);
    });
  });

  describe('setFeedbackDuration and getFeedbackDuration', () => {
    it('should set and get feedback duration', () => {
      feedbackManager.setFeedbackDuration(1000);
      expect(feedbackManager.getFeedbackDuration()).toBe(1000);
    });

    it('should not set negative duration', () => {
      feedbackManager.setFeedbackDuration(500);
      feedbackManager.setFeedbackDuration(-100);
      expect(feedbackManager.getFeedbackDuration()).toBe(500);
    });

    it('should not set zero duration', () => {
      feedbackManager.setFeedbackDuration(500);
      feedbackManager.setFeedbackDuration(0);
      expect(feedbackManager.getFeedbackDuration()).toBe(500);
    });
  });

  describe('getCorrectGuessFeedback and getSkipFeedback', () => {
    it('should return correct guess feedback configuration', () => {
      const feedback = feedbackManager.getCorrectGuessFeedback();
      expect(feedback.type).toBe('CORRECT');
      expect(feedback.visualFeedback.color).toBe('#4CAF50');
      expect(feedback.audioFeedback.soundType).toBe('success');
    });

    it('should return skip feedback configuration', () => {
      const feedback = feedbackManager.getSkipFeedback();
      expect(feedback.type).toBe('SKIP');
      expect(feedback.visualFeedback.color).toBe('#FF9800');
      expect(feedback.audioFeedback.soundType).toBe('skip');
    });

    it('should return copies of feedback configurations', () => {
      const feedback1 = feedbackManager.getCorrectGuessFeedback();
      const feedback2 = feedbackManager.getCorrectGuessFeedback();
      expect(feedback1).toEqual(feedback2);
      expect(feedback1).not.toBe(feedback2);
    });
  });

  describe('setCorrectGuessFeedback and setSkipFeedback', () => {
    it('should customize correct guess feedback', () => {
      feedbackManager.setCorrectGuessFeedback({
        visualFeedback: {
          color: '#FF0000',
          animation: 'bounce',
          intensity: 0.5,
        },
      });

      const feedback = feedbackManager.getCorrectGuessFeedback();
      expect(feedback.visualFeedback.color).toBe('#FF0000');
      expect(feedback.visualFeedback.animation).toBe('bounce');
      expect(feedback.type).toBe('CORRECT');
    });

    it('should customize skip feedback', () => {
      feedbackManager.setSkipFeedback({
        audioFeedback: {
          soundType: 'beep',
          volume: 0.3,
          duration: 150,
        },
      });

      const feedback = feedbackManager.getSkipFeedback();
      expect(feedback.audioFeedback.soundType).toBe('beep');
      expect(feedback.audioFeedback.volume).toBe(0.3);
      expect(feedback.type).toBe('SKIP');
    });
  });

  describe('removeCallback', () => {
    it('should remove a registered callback', () => {
      const mockCallback = jest.fn();
      feedbackManager.onFeedback(mockCallback);
      feedbackManager.removeCallback(mockCallback);

      const action: GameAction = {
        type: 'CORRECT',
        timestamp: Date.now(),
        itemId: 'item1',
      };

      feedbackManager.generateFeedback(action);

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should not affect other callbacks', () => {
      const mockCallback1 = jest.fn();
      const mockCallback2 = jest.fn();
      feedbackManager.onFeedback(mockCallback1);
      feedbackManager.onFeedback(mockCallback2);
      feedbackManager.removeCallback(mockCallback1);

      const action: GameAction = {
        type: 'CORRECT',
        timestamp: Date.now(),
        itemId: 'item1',
      };

      feedbackManager.generateFeedback(action);

      expect(mockCallback1).not.toHaveBeenCalled();
      expect(mockCallback2).toHaveBeenCalledTimes(1);
    });
  });

  describe('reset', () => {
    it('should reset to default state', () => {
      feedbackManager.disable();
      feedbackManager.setFeedbackDuration(1000);
      feedbackManager.setCorrectGuessFeedback({
        visualFeedback: {
          color: '#FF0000',
          animation: 'bounce',
          intensity: 0.5,
        },
      });

      feedbackManager.reset();

      expect(feedbackManager.isEnabledFeedback()).toBe(true);
      expect(feedbackManager.getFeedbackDuration()).toBe(500);
      const feedback = feedbackManager.getCorrectGuessFeedback();
      expect(feedback.visualFeedback.color).toBe('#4CAF50');
    });
  });

  describe('Property 2.4: Correct guess feedback generation', () => {
    /**
     * **Feature: heads-up-game, Property 2.4: Correct guess feedback**
     * **Validates: Requirements 2.4**
     *
     * For any correct guess action, the system should generate visual and audio feedback
     * with appropriate timing coordination.
     */
    it('should generate feedback for all correct guess actions', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.uuid(), { minLength: 1, maxLength: 50 }),
          async (itemIds) => {
            const freshFeedbackManager = new FeedbackManager();
            const feedbackCalls: Feedback[] = [];

            freshFeedbackManager.onFeedback((feedback) => {
              feedbackCalls.push(feedback);
            });

            for (const itemId of itemIds) {
              const action: GameAction = {
                type: 'CORRECT',
                timestamp: Date.now(),
                itemId,
              };
              freshFeedbackManager.generateFeedback(action);
            }

            expect(feedbackCalls.length).toBe(itemIds.length);
            feedbackCalls.forEach((feedback) => {
              expect(feedback.type).toBe('CORRECT');
              expect(feedback.visualFeedback).toBeDefined();
              expect(feedback.audioFeedback).toBeDefined();
              expect(feedback.duration).toBeGreaterThan(0);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 3.4: Skip feedback generation', () => {
    /**
     * **Feature: heads-up-game, Property 3.4: Skip feedback**
     * **Validates: Requirements 3.4**
     *
     * For any skip action, the system should generate visual and audio feedback
     * with appropriate timing coordination.
     */
    it('should generate feedback for all skip actions', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.uuid(), { minLength: 1, maxLength: 50 }),
          async (itemIds) => {
            const freshFeedbackManager = new FeedbackManager();
            const feedbackCalls: Feedback[] = [];

            freshFeedbackManager.onFeedback((feedback) => {
              feedbackCalls.push(feedback);
            });

            for (const itemId of itemIds) {
              const action: GameAction = {
                type: 'SKIP',
                timestamp: Date.now(),
                itemId,
              };
              freshFeedbackManager.generateFeedback(action);
            }

            expect(feedbackCalls.length).toBe(itemIds.length);
            feedbackCalls.forEach((feedback) => {
              expect(feedback.type).toBe('SKIP');
              expect(feedback.visualFeedback).toBeDefined();
              expect(feedback.audioFeedback).toBeDefined();
              expect(feedback.duration).toBeGreaterThan(0);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Feedback timing coordination', () => {
    it('should coordinate visual and audio feedback timing', () => {
      const mockCallback = jest.fn();
      feedbackManager.onFeedback(mockCallback);

      const action: GameAction = {
        type: 'CORRECT',
        timestamp: Date.now(),
        itemId: 'item1',
      };

      feedbackManager.generateFeedback(action);

      const feedback = mockCallback.mock.calls[0][0];
      expect(feedback.audioFeedback.duration).toBeDefined();
      expect(feedback.duration).toBeDefined();
      expect(feedback.duration).toBeGreaterThanOrEqual(
        feedback.audioFeedback.duration
      );
    });

    it('should have different feedback for different action types', () => {
      const correctFeedback = feedbackManager.getCorrectGuessFeedback();
      const skipFeedback = feedbackManager.getSkipFeedback();

      expect(correctFeedback.visualFeedback.color).not.toBe(
        skipFeedback.visualFeedback.color
      );
      expect(correctFeedback.audioFeedback.soundType).not.toBe(
        skipFeedback.audioFeedback.soundType
      );
    });
  });
});
