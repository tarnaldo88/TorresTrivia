import { TimerManager } from './timerManager';
import * as fc from 'fast-check';

describe('TimerManager', () => {
  let timerManager: TimerManager;

  beforeEach(() => {
    timerManager = new TimerManager();
  });

  afterEach(() => {
    timerManager.reset();
  });

  describe('initialize', () => {
    it('should set duration to provided value', () => {
      timerManager.initialize(90);
      expect(timerManager.getRemainingTime()).toBe(90000);
    });

    it('should default to 60 seconds if duration is invalid', () => {
      timerManager.initialize(0);
      expect(timerManager.getRemainingTime()).toBe(60000);
    });

    it('should reset timer state', () => {
      timerManager.initialize(30);
      timerManager.start();
      timerManager.initialize(60);
      expect(timerManager.isActive()).toBe(false);
    });
  });

  describe('start', () => {
    it('should start the timer', () => {
      timerManager.initialize(60);
      timerManager.start();
      expect(timerManager.isActive()).toBe(true);
    });

    it('should not start if already running', () => {
      timerManager.initialize(60);
      timerManager.start();
      const elapsed1 = timerManager.getElapsedTime();
      timerManager.start();
      const elapsed2 = timerManager.getElapsedTime();
      expect(elapsed2).toBeCloseTo(elapsed1, 0);
    });
  });

  describe('stop', () => {
    it('should stop the timer', () => {
      timerManager.initialize(60);
      timerManager.start();
      timerManager.stop();
      expect(timerManager.isActive()).toBe(false);
    });
  });

  describe('pause and resume', () => {
    it('should pause the timer', () => {
      timerManager.initialize(60);
      timerManager.start();
      expect(timerManager.isActive()).toBe(true);
      timerManager.pause();
      expect(timerManager.isActive()).toBe(false);
    });

    it('should resume the timer', () => {
      timerManager.initialize(60);
      timerManager.start();
      timerManager.pause();
      expect(timerManager.isActive()).toBe(false);
      timerManager.resume();
      expect(timerManager.isActive()).toBe(true);
    });
  });

  describe('getRemainingTime', () => {
    it('should return remaining time in milliseconds', () => {
      timerManager.initialize(10);
      timerManager.start();
      const remaining = timerManager.getRemainingTime();
      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(10000);
    });

    it('should return 0 when time expires', (done) => {
      timerManager.initialize(1);
      timerManager.start();
      setTimeout(() => {
        const remaining = timerManager.getRemainingTime();
        expect(remaining).toBe(0);
        done();
      }, 1100);
    });
  });

  describe('hasExpired', () => {
    it('should return false for active timer', () => {
      timerManager.initialize(10);
      timerManager.start();
      expect(timerManager.hasExpired()).toBe(false);
    });

    it('should return true when time expires', (done) => {
      timerManager.initialize(1);
      timerManager.start();
      setTimeout(() => {
        expect(timerManager.hasExpired()).toBe(true);
        done();
      }, 1100);
    });
  });

  describe('callbacks', () => {
    it('should call onTimerUpdate callback', (done) => {
      let callbackCalled = false;
      timerManager.initialize(60);
      timerManager.setOnTimerUpdate(() => {
        callbackCalled = true;
      });
      timerManager.start();

      setTimeout(() => {
        expect(callbackCalled).toBe(true);
        timerManager.stop();
        done();
      }, 150);
    });

    it('should call onRoundEnd callback when timer expires', (done) => {
      let endCallbackCalled = false;
      timerManager.initialize(1);
      timerManager.setOnRoundEnd(() => {
        endCallbackCalled = true;
      });
      timerManager.start();

      setTimeout(() => {
        expect(endCallbackCalled).toBe(true);
        done();
      }, 1200);
    });
  });

  describe('reset', () => {
    it('should reset timer to initial state', () => {
      timerManager.initialize(30);
      timerManager.start();
      timerManager.reset();
      expect(timerManager.isActive()).toBe(false);
      expect(timerManager.getRemainingTime()).toBe(60000);
    });
  });

  describe('Property 10: Timer displays during active round', () => {
    /**
     * **Feature: heads-up-game, Property 10: Timer displays during active round**
     * **Validates: Requirements 4.4**
     *
     * For any active round, the system should display a countdown timer showing
     * the remaining time.
     */
    it('should display remaining time during active round', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 300 }),
          async (duration) => {
            const freshTimer = new TimerManager();
            freshTimer.initialize(duration);
            freshTimer.start();

            // Timer should be active
            expect(freshTimer.isActive()).toBe(true);

            // Remaining time should be available and within bounds
            const remaining = freshTimer.getRemainingTime();
            expect(remaining).toBeGreaterThan(0);
            expect(remaining).toBeLessThanOrEqual(duration * 1000);

            // Timer should not have expired yet
            expect(freshTimer.hasExpired()).toBe(false);

            freshTimer.stop();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should update remaining time as time progresses', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 5, max: 60 }),
          async (duration) => {
            const freshTimer = new TimerManager();
            freshTimer.initialize(duration);
            freshTimer.start();

            const initialRemaining = freshTimer.getRemainingTime();

            // Wait a bit and check that remaining time decreased
            await new Promise((resolve) => setTimeout(resolve, 50));

            const laterRemaining = freshTimer.getRemainingTime();

            // Remaining time should have decreased
            expect(laterRemaining).toBeLessThan(initialRemaining);

            freshTimer.stop();
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
