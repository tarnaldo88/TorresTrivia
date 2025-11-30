import { Accelerometer } from 'expo-sensors';
import { DeviceOrientation } from '../types/index';

/**
 * Callback type for orientation change events
 */
export type OrientationCallback = (action: 'CORRECT' | 'SKIP') => void;

/**
 * OrientationDetector monitors device accelerometer data
 * and detects downward/upward rotations to register game actions
 */
export class OrientationDetector {
  private isListening: boolean = false;
  private callbacks: OrientationCallback[] = [];
  private lastActionTime: number = 0;
  private debounceMs: number = 800; // debounce window in milliseconds
  private downwardThreshold: number = 5; // acceleration threshold for downward rotation
  private upwardThreshold: number = -5; // acceleration threshold for upward rotation
  private detectionLatencyMs: number = 100; // max latency for detection
  private lastDetectionTime: number = 0;
  private subscription: any = null;
  private lastZ: number = 0;

  /**
   * Start listening to device orientation changes using accelerometer
   */
  startListening(): void {
    if (this.isListening) {
      return;
    }
    this.isListening = true;
    this.lastActionTime = 0;
    this.lastDetectionTime = 0;

    try {
      // Set update interval to 100ms for responsive detection
      Accelerometer.setUpdateInterval(100);

      // Subscribe to accelerometer updates
      this.subscription = Accelerometer.addListener((data) => {
        this.processOrientation({
          x: data.x,
          y: data.y,
          z: data.z,
          timestamp: Date.now(),
        });
      });

      console.log('OrientationDetector: Accelerometer listener started');
    } catch (error) {
      console.error('OrientationDetector: Failed to start accelerometer:', error);
      this.isListening = false;
    }
  }

  /**
   * Stop listening to device orientation changes
   */
  stopListening(): void {
    this.isListening = false;
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
  }

  /**
   * Register a callback to be called when an orientation action is detected
   * @param callback - Function to call with 'CORRECT' or 'SKIP' action
   */
  onOrientationChange(callback: OrientationCallback): void {
    // Clear old callbacks to prevent duplicates
    this.callbacks = [];
    this.callbacks.push(callback);
  }

  /**
   * Remove a callback
   * @param callback - The callback to remove
   */
  removeCallback(callback: OrientationCallback): void {
    this.callbacks = this.callbacks.filter((cb) => cb !== callback);
  }

  /**
   * Clear all callbacks
   */
  clearCallbacks(): void {
    this.callbacks = [];
  }

  /**
   * Process device orientation data and detect actions
   * @param orientation - Current device orientation data
   */
  processOrientation(orientation: DeviceOrientation): void {
    if (!this.isListening) {
      return;
    }

    const currentTime = Date.now();
    this.lastDetectionTime = currentTime;

    // Check if we're still in debounce window
    if (currentTime - this.lastActionTime < this.debounceMs) {
      return;
    }

    // Calculate change in z-axis (acceleration)
    const zChange = orientation.z - this.lastZ;
    this.lastZ = orientation.z;

    console.log('OrientationDetector: z =', orientation.z.toFixed(2), 'zChange =', zChange.toFixed(2), 'lastActionTime ago =', currentTime - this.lastActionTime);

    // Detect upward tilt (negative z acceleration) = CORRECT guess
    if (zChange < -1.5) {
      console.log('OrientationDetector: CORRECT detected (upward tilt), zChange =', zChange.toFixed(2));
      this.lastActionTime = currentTime;
      this.triggerCallbacks('CORRECT');
      return;
    }

    // Detect downward tilt (positive z acceleration) = SKIP
    if (zChange > 1.5) {
      console.log('OrientationDetector: SKIP detected (downward tilt), zChange =', zChange.toFixed(2));
      this.lastActionTime = currentTime;
      this.triggerCallbacks('SKIP');
      return;
    }
  }

  /**
   * Trigger all registered callbacks with the given action
   * @param action - The action to trigger ('CORRECT' or 'SKIP')
   */
  private triggerCallbacks(action: 'CORRECT' | 'SKIP'): void {
    this.callbacks.forEach((callback) => {
      callback(action);
    });
  }

  /**
   * Check if the detector is currently listening
   */
  isActive(): boolean {
    return this.isListening;
  }

  /**
   * Get the time of the last detection
   */
  getLastDetectionTime(): number {
    return this.lastDetectionTime;
  }

  /**
   * Get the time of the last action
   */
  getLastActionTime(): number {
    return this.lastActionTime;
  }

  /**
   * Set the debounce window (in milliseconds)
   * @param ms - Debounce duration
   */
  setDebounceMs(ms: number): void {
    this.debounceMs = ms;
  }

  /**
   * Get the current debounce window
   */
  getDebounceMs(): number {
    return this.debounceMs;
  }

  /**
   * Set the downward rotation threshold (pitch value)
   * @param threshold - Pitch threshold for downward detection
   */
  setDownwardThreshold(threshold: number): void {
    this.downwardThreshold = threshold;
  }

  /**
   * Set the upward rotation threshold (pitch value)
   * @param threshold - Pitch threshold for upward detection
   */
  setUpwardThreshold(threshold: number): void {
    this.upwardThreshold = threshold;
  }

  /**
   * Get the downward rotation threshold
   */
  getDownwardThreshold(): number {
    return this.downwardThreshold;
  }

  /**
   * Get the upward rotation threshold
   */
  getUpwardThreshold(): number {
    return this.upwardThreshold;
  }

  /**
   * Reset the detector state
   */
  reset(): void {
    this.lastActionTime = 0;
    this.lastDetectionTime = 0;
  }
}
