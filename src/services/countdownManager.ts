import { Audio } from 'expo-av';

// Import audio files - 123 countdown clips
import amayaKai123 from '../assets/audio/123/AmayaKai123.wav';
import emilio123 from '../assets/audio/123/Emilio123.wav';
import megan123 from '../assets/audio/123/megan123.mp3';

// Import "Let's Play" clips
import galanFamiliaLetsPlay from '../assets/audio/letsplay/GalanFamiliaLetsPlay.mp3';

/**
 * Callback type for countdown events
 */
export type CountdownCallback = (message: string) => void;

/**
 * Available countdown audio clips (1-2-3)
 */
const COUNTDOWN_AUDIO_CLIPS = [amayaKai123, emilio123, megan123];

/**
 * Available "Let's Play" audio clips
 */
const LETSPLAY_AUDIO_CLIPS = [galanFamiliaLetsPlay];

/**
 * CountdownManager handles the Get Ready... -> 123 audio -> Go! -> Let's Play audio flow
 */
export class CountdownManager {
  private countdownInterval: ReturnType<typeof setInterval> | null = null;
  private callbacks: CountdownCallback[] = [];
  private selectedCountdownClip: any = null;
  private selectedLetsplayClip: any = null;
  private soundObject: Audio.Sound | null = null;
  private isPlaying: boolean = false;

  constructor() {
    console.log(`CountdownManager: Initialized with ${COUNTDOWN_AUDIO_CLIPS.length} countdown clips and ${LETSPLAY_AUDIO_CLIPS.length} let's play clips`);
  }

  /**
   * Select a random audio clip from available options
   */
  private selectRandomCountdownClip(): void {
    if (COUNTDOWN_AUDIO_CLIPS.length === 0) {
      console.warn('CountdownManager: No countdown clips available');
      return;
    }

    const randomIndex = Math.floor(Math.random() * COUNTDOWN_AUDIO_CLIPS.length);
    this.selectedCountdownClip = COUNTDOWN_AUDIO_CLIPS[randomIndex];
    console.log(`CountdownManager: Selected countdown clip ${randomIndex + 1} of ${COUNTDOWN_AUDIO_CLIPS.length}`);
  }

  /**
   * Select a random "Let's Play" audio clip
   */
  private selectRandomLetsplayClip(): void {
    if (LETSPLAY_AUDIO_CLIPS.length === 0) {
      console.warn('CountdownManager: No let\'s play clips available');
      return;
    }

    const randomIndex = Math.floor(Math.random() * LETSPLAY_AUDIO_CLIPS.length);
    this.selectedLetsplayClip = LETSPLAY_AUDIO_CLIPS[randomIndex];
    console.log(`CountdownManager: Selected let's play clip ${randomIndex + 1} of ${LETSPLAY_AUDIO_CLIPS.length}`);
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
   * Start the countdown sequence:
   * 1. Show "Get Ready..." and play countdown audio
   * 2. Show "Go!" and play let's play audio
   * 3. Start game after let's play audio finishes
   */
  async startCountdown(): Promise<void> {
    try {
      // Step 1: Show "Get Ready..." and play countdown audio
      console.log('CountdownManager: Starting countdown sequence');
      this.triggerCallbacks('Get Ready...');

      this.selectRandomCountdownClip();
      await this.playAudio(this.selectedCountdownClip);

      // Wait a bit after countdown finishes
      await this.delay(500);

      // Step 2: Show "Go!" and play let's play audio
      this.triggerCallbacks('Go!');

      this.selectRandomLetsplayClip();
      await this.playAudio(this.selectedLetsplayClip);

      // Wait for let's play audio to finish
      await this.delay(500);

      // Step 3: Start the game
      this.triggerCallbacks('START_GAME');
      console.log('CountdownManager: Countdown sequence complete, game starting');
    } catch (error) {
      console.error('CountdownManager: Error during countdown sequence:', error);
      this.triggerCallbacks('START_GAME'); // Start game anyway
    }
  }

  /**
   * Play an audio clip and wait for it to finish
   */
  private async playAudio(audioClip: any): Promise<void> {
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
      await this.soundObject.loadAsync(audioClip);

      // Set volume to maximum
      await this.soundObject.setVolumeAsync(1.0);

      // Play the audio
      console.log('CountdownManager: Playing audio...');
      await this.soundObject.playAsync();
      this.isPlaying = true;

      // Wait for audio to finish playing
      await this.waitForAudioToFinish();

      console.log('CountdownManager: Audio finished playing');
    } catch (error) {
      console.error('CountdownManager: Failed to play audio:', error);
      this.isPlaying = false;
    }
  }

  /**
   * Wait for the current audio to finish playing
   */
  private async waitForAudioToFinish(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.soundObject) {
        resolve();
        return;
      }

      const checkInterval = setInterval(async () => {
        try {
          const status = await this.soundObject?.getStatusAsync();
          if (status && 'isPlaying' in status && !status.isPlaying) {
            clearInterval(checkInterval);
            resolve();
          }
        } catch (error) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 10000);
    });
  }

  /**
   * Simple delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Trigger all registered callbacks
   */
  private triggerCallbacks(message: string): void {
    this.callbacks.forEach((callback) => {
      callback(message);
    });
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
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
