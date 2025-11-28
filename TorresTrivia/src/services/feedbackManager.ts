import { GameAction } from '../types/index';

/**
 * Feedback type for different action types
 */
export interface Feedback {
  type: 'CORRECT' | 'SKIP';
  visualFeedback: VisualFeedback;
  audioFeedback: AudioFeedback;
  duration: number; // in milliseconds
}

/**
 * Visual feedback configuration
 */
export interface VisualFeedback {
  color: string;
  animation: string;
  intensity: number; // 0-1
}

/**
 * Audio feedback configuration
 */
export interface AudioFeedback {
  soundType: string;
  volume: number; // 0-1
  duration: number; // in milliseconds
}

/**
 * Callback type for feedback events
 */
export type FeedbackCallback = (feedback: Feedback) => void;

/**
 * FeedbackManager generates and coordinates visual and audio feedback
 * for game actions (correct guess and skip)
 */
export class FeedbackManager {
  private callbacks: FeedbackCallback[] = [];
  private isEnabled: boolean = true;
  private feedbackDuration: number = 500; // default feedback duration in ms

  /**
   * Correct guess feedback configuration
   */
  private correctGuessFeedback: Feedback = {
    type: 'CORRECT',
    visualFeedback: {
      color: '#4CAF50', // green
      animation: 'pulse',
      intensity: 1.0,
    },
    audioFeedback: {
      soundType: 'success',
      volume: 0.8,
      duration: 300,
    },
    duration: 500,
  };

  /**
   * Skip feedback configuration
   */
  private skipFeedback: Feedback = {
    type: 'SKIP',
    visualFeedback: {
      color: '#FF9800', // orange
      animation: 'fade',
      intensity: 0.7,
    },
    audioFeedback: {
      soundType: 'skip',
      volume: 0.6,
      duration: 200,
    },
    duration: 400,
  };

  /**
   * Register a callback to be called when feedback is triggered
   * @param callback - Function to call with feedback data
   */
  onFeedback(callback: FeedbackCallback): void {
    this.callbacks.push(callback);
  }

  /**
   * Remove a callback
   * @param callback - The callback to remove
   */
  removeCallback(callback: FeedbackCallback): void {
    this.callbacks = this.callbacks.filter((cb) => cb !== callback);
  }

  /**
   * Generate feedback for a correct guess action
   * @param action - The game action that triggered the feedback
   */
  generateCorrectGuessFeedback(action: GameAction): void {
    if (!this.isEnabled || action.type !== 'CORRECT') {
      return;
    }

    this.triggerFeedback(this.correctGuessFeedback);
  }

  /**
   * Generate feedback for a skip action
   * @param action - The game action that triggered the feedback
   */
  generateSkipFeedback(action: GameAction): void {
    if (!this.isEnabled || action.type !== 'SKIP') {
      return;
    }

    this.triggerFeedback(this.skipFeedback);
  }

  /**
   * Generate feedback based on action type
   * @param action - The game action
   */
  generateFeedback(action: GameAction): void {
    if (!this.isEnabled) {
      return;
    }

    if (action.type === 'CORRECT') {
      this.generateCorrectGuessFeedback(action);
    } else if (action.type === 'SKIP') {
      this.generateSkipFeedback(action);
    }
  }

  /**
   * Trigger all registered callbacks with the feedback
   * @param feedback - The feedback to trigger
   */
  private triggerFeedback(feedback: Feedback): void {
    this.callbacks.forEach((callback) => {
      callback(feedback);
    });
  }

  /**
   * Enable feedback generation
   */
  enable(): void {
    this.isEnabled = true;
  }

  /**
   * Disable feedback generation
   */
  disable(): void {
    this.isEnabled = false;
  }

  /**
   * Check if feedback is enabled
   */
  isEnabledFeedback(): boolean {
    return this.isEnabled;
  }

  /**
   * Set the feedback duration
   * @param duration - Duration in milliseconds
   */
  setFeedbackDuration(duration: number): void {
    if (duration > 0) {
      this.feedbackDuration = duration;
      this.correctGuessFeedback.duration = duration;
      this.skipFeedback.duration = duration;
    }
  }

  /**
   * Get the feedback duration
   */
  getFeedbackDuration(): number {
    return this.feedbackDuration;
  }

  /**
   * Get the correct guess feedback configuration
   */
  getCorrectGuessFeedback(): Feedback {
    return { ...this.correctGuessFeedback };
  }

  /**
   * Get the skip feedback configuration
   */
  getSkipFeedback(): Feedback {
    return { ...this.skipFeedback };
  }

  /**
   * Customize correct guess feedback
   * @param feedback - Partial feedback configuration to merge
   */
  setCorrectGuessFeedback(feedback: Partial<Feedback>): void {
    this.correctGuessFeedback = {
      ...this.correctGuessFeedback,
      ...feedback,
    };
  }

  /**
   * Customize skip feedback
   * @param feedback - Partial feedback configuration to merge
   */
  setSkipFeedback(feedback: Partial<Feedback>): void {
    this.skipFeedback = {
      ...this.skipFeedback,
      ...feedback,
    };
  }

  /**
   * Reset the feedback manager to default state
   */
  reset(): void {
    this.isEnabled = true;
    this.feedbackDuration = 500;
    this.correctGuessFeedback = {
      type: 'CORRECT',
      visualFeedback: {
        color: '#4CAF50',
        animation: 'pulse',
        intensity: 1.0,
      },
      audioFeedback: {
        soundType: 'success',
        volume: 0.8,
        duration: 300,
      },
      duration: 500,
    };
    this.skipFeedback = {
      type: 'SKIP',
      visualFeedback: {
        color: '#FF9800',
        animation: 'fade',
        intensity: 0.7,
      },
      audioFeedback: {
        soundType: 'skip',
        volume: 0.6,
        duration: 200,
      },
      duration: 400,
    };
  }
}
