/**
 * TimerManager tracks elapsed time in a round and manages countdown logic
 */
export class TimerManager {
  private startTime: number | null = null;
  private duration: number = 60; // in seconds
  private isRunning: boolean = false;
  private onTimerUpdate: ((remainingMs: number) => void) | null = null;
  private onRoundEnd: (() => void) | null = null;
  private intervalId: NodeJS.Timeout | null = null;

  /**
   * Initialize the timer with a duration
   * @param duration - Round duration in seconds
   */
  initialize(duration: number): void {
    this.duration = duration > 0 ? duration : 60;
    this.startTime = null;
    this.isRunning = false;
    this.clearInterval();
  }

  /**
   * Start the timer
   */
  start(): void {
    if (this.isRunning) {
      return;
    }

    this.startTime = Date.now();
    this.isRunning = true;

    // Update timer every 100ms for smooth countdown display
    this.intervalId = setInterval(() => {
      this.updateTimer();
    }, 100);
  }

  /**
   * Stop the timer
   */
  stop(): void {
    this.isRunning = false;
    this.clearInterval();
  }

  /**
   * Pause the timer
   */
  pause(): void {
    this.isRunning = false;
    this.clearInterval();
  }

  /**
   * Resume the timer
   */
  resume(): void {
    if (this.isRunning || !this.startTime) {
      return;
    }

    // Adjust start time to account for paused duration
    const elapsedBeforePause = Date.now() - this.startTime;
    this.startTime = Date.now() - elapsedBeforePause;

    this.isRunning = true;

    this.intervalId = setInterval(() => {
      this.updateTimer();
    }, 100);
  }

  /**
   * Get the elapsed time in milliseconds
   */
  getElapsedTime(): number {
    if (!this.startTime) {
      return 0;
    }
    return Date.now() - this.startTime;
  }

  /**
   * Get the remaining time in milliseconds
   */
  getRemainingTime(): number {
    const elapsedMs = this.getElapsedTime();
    const totalMs = this.duration * 1000;
    const remaining = totalMs - elapsedMs;
    return remaining > 0 ? remaining : 0;
  }

  /**
   * Check if the timer has expired
   */
  hasExpired(): boolean {
    return this.getRemainingTime() <= 0;
  }

  /**
   * Set callback for timer updates
   * @param callback - Function called with remaining time in milliseconds
   */
  setOnTimerUpdate(callback: (remainingMs: number) => void): void {
    this.onTimerUpdate = callback;
  }

  /**
   * Set callback for round end
   * @param callback - Function called when timer expires
   */
  setOnRoundEnd(callback: () => void): void {
    this.onRoundEnd = callback;
  }

  /**
   * Check if timer is currently running
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Reset the timer
   */
  reset(): void {
    this.stop();
    this.startTime = null;
    this.duration = 60;
    this.onTimerUpdate = null;
    this.onRoundEnd = null;
  }

  /**
   * Internal method to update timer and trigger callbacks
   */
  private updateTimer(): void {
    const remainingMs = this.getRemainingTime();

    // Call update callback
    if (this.onTimerUpdate) {
      this.onTimerUpdate(remainingMs);
    }

    // Check if time has expired
    if (remainingMs <= 0) {
      this.stop();
      if (this.onRoundEnd) {
        this.onRoundEnd();
      }
    }
  }

  /**
   * Clear the interval
   */
  private clearInterval(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
