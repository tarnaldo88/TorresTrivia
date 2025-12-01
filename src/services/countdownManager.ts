import { Audio } from 'expo-av';

/**
 * Callback type for countdown events
 */
export type CountdownCallback = (count: number | 'GO') => void;

/**
 * Available countdown audio clips
 * These files should be placed in assets/audio/ directory
 * If files don't exist, audio will be skipped gracefully
 */
const COUNTDOWN_AUDIO_CLIPS: any[] = [];

// Try to load audio clips if they exist
try {
  COUNTDOWN_AUDIO_CLIPS.push(require('../assets/audio/countdown1.mp3'));
} catch (e) {
  console.warn('countdown1.mp3 not found');
}

try {
  COUNTDOWN_AUDIO_CLIPS.push(require('../assets/audio/countdown2.mp3'));
} catch (e) {
  console.warn('countdown2.mp3 not found');
}

try {
  COUNTDOWN_AUDIO_CLIPS.push(require('../assets/audio/countdown3.mp3'));
} catch (e) {
  console.warn('countdown3.mp3 not found');
}

/**
 * CountdownManager handles the 3-2-1-GO countdown with audio
 */
export class CountdownManager {
  private countdownInterval: ReturnType<typeof setInterval> | null = null;
  private currentCount: number = 3;
  private callbacks: CountdownCallback[] = [];
  private selectedAudioClip: any = null;
  private soundObject: Audio.Sound | null = null;
  private isPlaying: boolean = false;

  constructor() {
    this.selectRandomAudioClip();
  }

  /**
   * Select a random audio clip from available options
   */
  private selectRandomAudioClip(): void {
    const randomIndex = Math.floor(Math.random() * COUNTDOWN_AUDIO_CLIPS.length);
    this.selectedAudioClip = COUNTDOWN_AUDIO_CLIPS[randomIndex];
    console.log(`CountdownManager: Selected audio clip ${randomIndex + 1}`);
  }

  /**
   * Register a callback to be called on countdown events
   */
  onCountdown(callback: CountdownCallback): void {
    this.callbacks.push(callback);
  }

  /**
   * Remove a callback
   */
  removeCallback(callback: CountdownCallback): void {
    this.callbacks = this.callbacks.filter((cb) => cb !== callback);
  }

  /**
   * Start the countdown (3-2-1-GO)
   */
  async startCountdown(): Promise<void> {
    // Reset state
    this.currentCount = 3;
    
    // Only select and play audio if clips are available
    if (COUNTDOWN_AUDIO_CLIPS.length > 0) {
      this.selectRandomAudioClip();
      await this.playAudio();
    } else {
      console.warn('CountdownManager: No audio clips available. Countdown will proceed without audio.');
    }

    // Start countdown interval
    this.countdownInterval = setInterval(() => {
      this.triggerCallbacks(this.currentCount);

      if (this.currentCount === 0) {
        this.triggerCallbacks('GO');
        this.stopCountdown();
      } else {
        this.currentCount--;
      }
    }, 1000);
  }

  /**
   * Play the selected audio clip
   */
  private async playAudio(): Promise<void> {
    try {
      if (this.soundObject) {
        await this.soundObject.unloadAsync();
      }

      this.soundObject = new Audio.Sound();
      await this.soundObject.loadAsync(this.selectedAudioClip);
      await this.soundObject.playAsync();
      this.isPlaying = true;

      console.log('CountdownManager: Audio playing');
    } catch (error) {
      console.error('CountdownManager: Failed to play audio:', error);
    }
  }

  /**
   * Stop the countdown
   */
  stopCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  /**
   * Trigger all registered callbacks
   */
  private triggerCallbacks(count: number | 'GO'): void {
    this.callbacks.forEach((callback) => {
      callback(count);
    });
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    this.stopCountdown();
    if (this.soundObject) {
      try {
        await this.soundObject.unloadAsync();
      } catch (error) {
        console.error('CountdownManager: Failed to unload audio:', error);
      }
      this.soundObject = null;
    }
  }

  /**
   * Check if audio is currently playing
   */
  isAudioPlaying(): boolean {
    return this.isPlaying;
  }
}
