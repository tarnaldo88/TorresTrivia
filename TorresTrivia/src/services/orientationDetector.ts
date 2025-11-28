import { DeviceOrientation } from '../types/index';

/**
 * Callback type for orientation change events
 */
export type OrientationCallback = (action: 'CORRECT' | 'SKIP') => void;

/**
 * OrientationDetector monitors device accelerometer/gyroscope data
 * and detects downward/upward rotations to register game actions
 */
export class OrientationDetector {
  private isListening: boolean = false;
  private callbacks: OrientationCallback[] = [];
  private lastActionTime: number = 0;
  private debounceMs: number = 300; // debounce window in milliseconds
  private downwardThreshold: number = -0.5; // pitch threshold for downward rotation
  private upwardThreshold: number = 0.5; // pitch threshold for upward rotation
  private detectionLatencyMs: number = 100; // max latency for detection
  private lastDetectionTime: number = 0;

  /**
   * Start listening to device orientation changes
   * In a real React Native app, this would use react-native-sensors or similar
   */
  startListening(): void {
    if (this.isListening) {
      return;
    }
    this.isListening = true;
    this.lastActionTime = 0;
    this.lastDetectionTime = 0;
  }

  /**
   * Stop listening to device orientation changes
   */
  stopListening(): void {
    this.isListening = false;
  }

  /**
   * Register a callback to be called when an orientation action is detected
   * @param callback - Function to call with 'CORRECT' or 'SKIP' action
   */
  onOrientationChange(callback: OrientationCallback): void {
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
   * Process device orientation data and detect actions
   * This method would be called by the sensor listener in a real app
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

    // Detect downward rotation (pitch <= threshold) = CORRECT guess
    if (orientation.x <= this.downwardThreshold) {
      this.lastActionTime = currentTime;
      this.triggerCallbacks('CORRECT');
      return;
    }

    // Detect upward rotation (pitch >= threshold) = SKIP
    if (orientation.x >= this.upwardThreshold) {
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
