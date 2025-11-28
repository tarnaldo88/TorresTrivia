import { OrientationDetector } from './orientationDetector';
import { DeviceOrientation } from '../types/index';
import fc from 'fast-check';

describe('OrientationDetector', () => {
  let detector: OrientationDetector;

  beforeEach(() => {
    detector = new OrientationDetector();
  });

  afterEach(() => {
    if (detector) {
      detector.stopListening();
    }
  });

  describe('Basic functionality', () => {
    it('should trigger callback when downward rotation is detected', () => {
      detector.startListening();
      let actionDetected: string | null = null;

      detector.onOrientationChange((action) => {
        actionDetected = action;
      });

      const orientation: DeviceOrientation = {
        x: -0.7,
        y: 0,
        z: 0,
        timestamp: Date.now(),
      };

      detector.processOrientation(orientation);

      expect(actionDetected).toBe('CORRECT');
    });

    it('should trigger callback when upward rotation is detected', () => {
      detector.startListening();
      let actionDetected: string | null = null;

      detector.onOrientationChange((action) => {
        actionDetected = action;
      });

      const orientation: DeviceOrientation = {
        x: 0.7,
        y: 0,
        z: 0,
        timestamp: Date.now(),
      };

      detector.processOrientation(orientation);

      expect(actionDetected).toBe('SKIP');
    });
  });

  describe('Property 4: Downward rotation registers correct guess', () => {
    it('should register CORRECT action when device is rotated downward', () => {
      /**
       * **Feature: heads-up-game, Property 4: Downward rotation registers correct guess**
       * **Validates: Requirements 2.1**
       *
       * For any active round, when the device is rotated downward,
       * the system should register a correct guess action.
       */
      fc.assert(
        fc.property(
          fc.oneof(
            fc.float({ min: -1, max: Math.fround(-0.5001) }), // values clearly below threshold
            fc.constant(-0.5) // exact boundary value
          ),
          (pitch: number) => {
            detector.startListening();
            let actionDetected: string | null = null;

            detector.onOrientationChange((action) => {
              actionDetected = action;
            });

            const orientation: DeviceOrientation = {
              x: pitch,
              y: 0,
              z: 0,
              timestamp: Date.now(),
            };

            detector.processOrientation(orientation);

            expect(actionDetected).toBe('CORRECT');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 6: Upward rotation registers skip', () => {
    it('should register SKIP action when device is rotated upward', () => {
      /**
       * **Feature: heads-up-game, Property 6: Upward rotation registers skip**
       * **Validates: Requirements 3.1**
       *
       * For any active round, when the device is rotated upward,
       * the system should register a skip action.
       */
      fc.assert(
        fc.property(
          fc.oneof(
            fc.float({ min: Math.fround(0.5001), max: 1 }), // values clearly above threshold
            fc.constant(0.5) // exact boundary value
          ),
          (pitch: number) => {
            detector.startListening();
            let actionDetected: string | null = null;

            detector.onOrientationChange((action) => {
              actionDetected = action;
            });

            const orientation: DeviceOrientation = {
              x: pitch,
              y: 0,
              z: 0,
              timestamp: Date.now(),
            };

            detector.processOrientation(orientation);

            expect(actionDetected).toBe('SKIP');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 15: Orientation detection latency', () => {
    it('should detect orientation changes within 100 milliseconds', () => {
      /**
       * **Feature: heads-up-game, Property 15: Orientation detection latency**
       * **Validates: Requirements 6.1**
       *
       * For any device orientation change, the system should detect
       * and register the change within 100 milliseconds.
       */
      fc.assert(
        fc.property(
          fc.tuple(
            fc.float({ min: -1, max: 1 }),
            fc.integer({ min: 0, max: 100 })
          ),
          ([pitch, delayMs]: [number, number]) => {
            detector.startListening();
            const beforeTime = Date.now();

            const orientation: DeviceOrientation = {
              x: pitch,
              y: 0,
              z: 0,
              timestamp: beforeTime + delayMs,
            };

            detector.processOrientation(orientation);
            const afterTime = Date.now();

            const detectionTime = detector.getLastDetectionTime();
            const latency = detectionTime - beforeTime;

            // Detection should occur within 100ms of processing
            expect(latency).toBeLessThanOrEqual(100);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 17: Ready for next action after completion', () => {
    it('should be ready to detect next action after returning to upright position', () => {
      /**
       * **Feature: heads-up-game, Property 17: Ready for next action after completion**
       * **Validates: Requirements 6.4**
       *
       * For any completed action (correct guess or skip) followed by device
       * return to upright position, the system should be ready to detect
       * and register the next orientation change.
       */
      fc.assert(
        fc.property(
          fc.tuple(
            fc.oneof(
              fc.float({ min: -1, max: Math.fround(-0.5001) }),
              fc.constant(-0.5)
            ), // first action (downward)
            fc.oneof(
              fc.float({ min: Math.fround(0.5001), max: 1 }),
              fc.constant(0.5)
            ) // second action (upward)
          ),
          ([firstPitch, secondPitch]: [number, number]) => {
            detector.startListening();
            const actions: string[] = [];

            detector.onOrientationChange((action) => {
              actions.push(action);
            });

            // First action
            const firstOrientation: DeviceOrientation = {
              x: firstPitch,
              y: 0,
              z: 0,
              timestamp: Date.now(),
            };
            detector.processOrientation(firstOrientation);

            // Return to upright (neutral position)
            const uprightOrientation: DeviceOrientation = {
              x: 0,
              y: 0,
              z: 0,
              timestamp: Date.now() + 200, // Wait past debounce
            };
            detector.processOrientation(uprightOrientation);

            // Second action after debounce period
            const secondOrientation: DeviceOrientation = {
              x: secondPitch,
              y: 0,
              z: 0,
              timestamp: Date.now() + 400,
            };
            detector.processOrientation(secondOrientation);

            // Should have detected both actions
            expect(actions.length).toBe(2);
            expect(actions[0]).toBe('CORRECT');
            expect(actions[1]).toBe('SKIP');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Debouncing behavior', () => {
    it('should not trigger multiple actions within debounce window', () => {
      detector.startListening();
      const actions: string[] = [];

      detector.onOrientationChange((action) => {
        actions.push(action);
      });

      const downwardOrientation: DeviceOrientation = {
        x: -0.7,
        y: 0,
        z: 0,
        timestamp: Date.now(),
      };

      // Trigger multiple times within debounce window
      detector.processOrientation(downwardOrientation);
      detector.processOrientation(downwardOrientation);
      detector.processOrientation(downwardOrientation);

      // Should only register one action
      expect(actions.length).toBe(1);
    });
  });

  describe('Neutral position handling', () => {
    it('should not trigger action for neutral pitch values', () => {
      /**
       * Test that neutral pitch values (between thresholds) do not trigger actions
       */
      fc.assert(
        fc.property(
          fc.float({ min: -0.5, max: 0.5, noDefaultInfinity: true }).filter(
            (x) => x > -0.5 && x < 0.5
          ), // neutral pitch values (strictly between thresholds)
          (pitch: number) => {
            detector.startListening();
            let actionDetected: string | null = null;

            detector.onOrientationChange((action) => {
              actionDetected = action;
            });

            const orientation: DeviceOrientation = {
              x: pitch,
              y: 0,
              z: 0,
              timestamp: Date.now(),
            };

            detector.processOrientation(orientation);

            expect(actionDetected).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Listener state management', () => {
    it('should not process orientation when not listening', () => {
      let actionDetected: string | null = null;

      detector.onOrientationChange((action) => {
        actionDetected = action;
      });

      // Don't start listening
      const orientation: DeviceOrientation = {
        x: -0.7,
        y: 0,
        z: 0,
        timestamp: Date.now(),
      };

      detector.processOrientation(orientation);

      expect(actionDetected).toBeNull();
    });

    it('should process orientation after starting to listen', () => {
      let actionDetected: string | null = null;

      detector.onOrientationChange((action) => {
        actionDetected = action;
      });

      detector.startListening();

      const orientation: DeviceOrientation = {
        x: -0.7,
        y: 0,
        z: 0,
        timestamp: Date.now(),
      };

      detector.processOrientation(orientation);

      expect(actionDetected).toBe('CORRECT');
    });
  });

  describe('Callback management', () => {
    it('should support multiple callbacks', () => {
      detector.startListening();
      const actions1: string[] = [];
      const actions2: string[] = [];

      detector.onOrientationChange((action) => {
        actions1.push(action);
      });

      detector.onOrientationChange((action) => {
        actions2.push(action);
      });

      const orientation: DeviceOrientation = {
        x: -0.7,
        y: 0,
        z: 0,
        timestamp: Date.now(),
      };

      detector.processOrientation(orientation);

      expect(actions1.length).toBe(1);
      expect(actions2.length).toBe(1);
      expect(actions1[0]).toBe('CORRECT');
      expect(actions2[0]).toBe('CORRECT');
    });

    it('should remove callbacks when requested', () => {
      detector.startListening();
      const actions: string[] = [];

      const callback = (action: string) => {
        actions.push(action);
      };

      detector.onOrientationChange(callback);
      detector.removeCallback(callback);

      const orientation: DeviceOrientation = {
        x: -0.7,
        y: 0,
        z: 0,
        timestamp: Date.now(),
      };

      detector.processOrientation(orientation);

      expect(actions.length).toBe(0);
    });
  });

  describe('Configuration methods', () => {
    it('should allow setting custom debounce window', () => {
      detector.setDebounceMs(500);
      expect(detector.getDebounceMs()).toBe(500);
    });

    it('should allow setting custom thresholds', () => {
      detector.setDownwardThreshold(-0.3);
      detector.setUpwardThreshold(0.3);

      expect(detector.getDownwardThreshold()).toBe(-0.3);
      expect(detector.getUpwardThreshold()).toBe(0.3);
    });
  });

  describe('State tracking', () => {
    it('should track last detection time', () => {
      detector.startListening();
      const beforeTime = Date.now();

      const orientation: DeviceOrientation = {
        x: -0.7,
        y: 0,
        z: 0,
        timestamp: Date.now(),
      };

      detector.processOrientation(orientation);
      const detectionTime = detector.getLastDetectionTime();

      expect(detectionTime).toBeGreaterThanOrEqual(beforeTime);
    });

    it('should track last action time', () => {
      detector.startListening();
      const beforeTime = Date.now();

      const orientation: DeviceOrientation = {
        x: -0.7,
        y: 0,
        z: 0,
        timestamp: Date.now(),
      };

      detector.processOrientation(orientation);
      const actionTime = detector.getLastActionTime();

      expect(actionTime).toBeGreaterThanOrEqual(beforeTime);
    });
  });
});
