import { Audio } from 'expo-av';

/**
 * Callback type for countdown events
 */
export type CountdownCallback = (count: number | 'GO') => void;

/**
 * Available countdown audio clips
 * Loads only audio files that actually exist in assets/audio/ directory
 */
let COUNTDOWN_AUDIO_CLIPS: any[] = [];
let audioClipsInitialized = false;

/**
 * Initialize audio clips by trying to load files that exist
 */
function initializeAudioClips(): void {
  if (audioClipsInitialized) {
    return;
  }

  COUNTDOWN_AUDIO_CLIPS = [];

  console.log('CountdownManager: Initializing audio clips...');

  // Load AmayaKai123.wav
  try {
    COUNTDOWN_AUDIO_CLIPS.push(require('../assets/audio/AmayaKai123.wav'));
    console.log(`CountdownManager: ✓ Loaded AmayaKai123.wav`);
  } catch (e) {
    console.log(`CountdownManager: ✗ AmayaKai123.wav not found`);
  }

  // Load Emilio123.wav
  try {
    COUNTDOWN_AUDIO_CLIPS.push(require('../assets/audio/Emilio123.wav'));
    console.log(`CountdownManager: ✓ Loaded Emilio123.wav`);
  } catch (e) {
    console.log(`CountdownManager: ✗ Emilio123.wav not found`);
  }

  audioClipsInitialized = true;

  if (COUNTDOWN_AUDIO_CLIPS.length > 0) {
    console.log(`CountdownManager: ✓ Successfully loaded ${COUNTDOWN_AUDIO_CLIPS.length} audio clip(s)`);
  } else {
    console.warn('CountdownManager: ✗ No audio clips found in assets/audio/');
    console.warn('CountdownManager: Please add audio files to assets/audio/ directory');
  }
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
    // Initialize audio clips on first use
    initializeAudioClips();
  }

  /**
   * Select a random audio clip from available options
   */
  private selectRandomAudioClip(): void {
    if (COUNTDOWN_AUDIO_CLIPS.length === 0) {
      console.warn('CountdownManager: No audio clips available');
      return;
    }

    const randomIndex = Math.floor(Math.random() * COUNTDOWN_AUDIO_CLIPS.length);
    this.selectedAudioClip = COUNTDOWN_AUDIO_CLIPS[randomIndex];
    console.log(`CountdownManager: Selected audio clip ${randomIndex + 1} of ${COUNTDOWN_AUDIO_CLIPS.length}`);
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
      // Clean up previous sound if exists
      if (this.soundObject) {
        try {
          await this.soundObject.unloadAsync();
        } catch (e) {
          console.warn('CountdownManager: Error unloading previous audio');
        }
      }

      // Create new sound object
      this.soundObject = new Audio.Sound();

      // Load the audio file
      console.log('CountdownManager: Loading audio...');
      await this.soundObject.loadAsync(this.selectedAudioClip);

      // Set volume to maximum
      await this.soundObject.setVolumeAsync(1.0);

      // Play the audio
      console.log('CountdownManager: Playing audio...');
      await this.soundObject.playAsync();
      this.isPlaying = true;

      console.log('CountdownManager: Audio started playing');
    } catch (error) {
      console.error('CountdownManager: Failed to play audio:', error);
      this.isPlaying = false;
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
