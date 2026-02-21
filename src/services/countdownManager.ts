import { Audio } from 'expo-av';

// Import audio files - 123 countdown clips
import amayaKai123 from '../assets/audio/123/AmayaKai123.wav';
import emilio123 from '../assets/audio/123/Emilio123.wav';
import megan123 from '../assets/audio/123/megan123.mp3';

// Import "Let's Play" clips
import galanFamiliaLetsPlay from '../assets/audio/letsplay/GalanFamiliaLetsPlay.mp3';
import playScream from '../assets/audio/letsplay/playScream.mp3';

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
const LETSPLAY_AUDIO_CLIPS = [galanFamiliaLetsPlay, playScream];

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
  private isSequenceRunning: boolean = false;

  constructor() {
    // Initialized with audio clips
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
    if (this.isSequenceRunning) {
      return;
    }

    this.isSequenceRunning = true;

    try {
      // Step 1: Show "Get Ready..." and play countdown audio
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
    } catch (error) {
      console.error('CountdownManager: Error during countdown sequence:', error);
      this.triggerCallbacks('START_GAME'); // Start game anyway
    } finally {
      this.isSequenceRunning = false;
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
          await this.soundObject.stopAsync();
          await this.soundObject.unloadAsync();
        } catch (e) {
          console.warn('CountdownManager: Error unloading previous audio');
        }
        this.soundObject = null;
      }

      // Create new sound object
      this.soundObject = new Audio.Sound();

      try {
        // Load the audio file
        await this.soundObject.loadAsync(audioClip);
      } catch (loadError) {
        console.warn('CountdownManager: Failed to load audio file, continuing without audio:', loadError);
        this.soundObject = null;
        return; // Continue without audio
      }

      // Set volume to maximum
      await this.soundObject.setVolumeAsync(1.0);

      // Play the audio and resolve only when playback actually finishes.
      this.isPlaying = true;
      const loadedStatus = await this.soundObject.getStatusAsync();
      const fallbackTimeoutMs =
        loadedStatus && loadedStatus.isLoaded && loadedStatus.durationMillis
          ? loadedStatus.durationMillis + 400
          : 10000;

      await new Promise<void>(async (resolve) => {
        if (!this.soundObject) {
          resolve();
          return;
        }

        let resolved = false;
        const finish = () => {
          if (resolved) return;
          resolved = true;
          this.isPlaying = false;
          this.soundObject?.setOnPlaybackStatusUpdate(null);
          resolve();
        };

        this.soundObject.setOnPlaybackStatusUpdate((status) => {
          if (!status.isLoaded) {
            finish();
            return;
          }
          if (status.didJustFinish) {
            finish();
          }
        });

        try {
          await this.soundObject.playAsync();
        } catch (playError) {
          finish();
          return;
        }

        setTimeout(finish, fallbackTimeoutMs);
      });
    } catch (error) {
      console.error('CountdownManager: Failed to play audio:', error);
      this.isPlaying = false;
      this.soundObject = null;
    }
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
        await this.soundObject.stopAsync();
        this.soundObject.setOnPlaybackStatusUpdate(null);
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
