import { Database } from './database';

/**
 * ScoreManager handles score persistence and retrieval
 */
export class ScoreManager {
  private currentScore: number = 0;
  private static readonly TABLE_NAME = 'scores';

  constructor() {
    this.currentScore = 0;
  }

  /**
   * Add points to the current score
   */
  addPoints(points: number): void {
    if (isNaN(points) || !isFinite(points)) {
      return;
    }
    this.currentScore += Math.floor(points);
  }

  /**
   * Subtract points from the current score
   */
  subtractPoints(points: number): void {
    if (isNaN(points) || !isFinite(points)) {
      return;
    }
    this.currentScore = Math.max(0, this.currentScore - Math.floor(points));
  }

  /**
   * Get the current score
   */
  getCurrentScore(): number {
    return this.currentScore;
  }

  /**
   * Reset the current score to zero
   */
  resetScore(): void {
    this.currentScore = 0;
  }

  /**
   * Initialize the scores table
   */
  static async initialize(): Promise<void> {
    try {
      const db = Database.getInstance();
      await db.execAsync(
        `CREATE TABLE IF NOT EXISTS ${this.TABLE_NAME} (
          id TEXT PRIMARY KEY,
          lastScore INTEGER DEFAULT 0,
          highScore INTEGER DEFAULT 0,
          jeopScore INTEGER DEFAULT 0,
          triviaScore INTEGER DEFAULT 0,
          jeopardyTrivScore INTEGER DEFAULT 0
        );`
      );

      // Initialize with default values if not exists
      const result = await db.getFirstAsync(
        `SELECT COUNT(*) as count FROM ${this.TABLE_NAME}`
      );
      
      if ((result as any).count === 0) {
        await db.runAsync(
          `INSERT INTO ${this.TABLE_NAME} (id, lastScore, highScore, jeopScore, triviaScore, jeopardyTrivScore) VALUES (?, ?, ?, ?)`,
          ['scores', 0, 0, 0, 0, 0]
        );
      }
    } catch (error) {
      console.error('Failed to initialize scores table:', error);
      throw error;
    }
  }

  /**
   * Get the last game score
   */
  static async getLastScore(): Promise<number> {
    try {
      const db = Database.getInstance();
      const result = await db.getFirstAsync(
        `SELECT lastScore FROM ${this.TABLE_NAME} WHERE id = 'scores'`
      );
      return result ? (result as any).lastScore : 0;
    } catch (error) {
      console.error('Failed to get last score:', error);
      return 0;
    }
  }

  /**
   * Get the all-time high score
   */
  static async getHighScore(): Promise<number> {
    try {
      const db = Database.getInstance();
      const result = await db.getFirstAsync(
        `SELECT highScore FROM ${this.TABLE_NAME} WHERE id = 'scores'`
      );
      return result ? (result as any).highScore : 0;
    } catch (error) {
      console.error('Failed to get high score:', error);
      return 0;
    }
  }

  static async getJeopScore(): Promise<number> {
    try {
      const db = Database.getInstance();
      const result = await db.getFirstAsync(
        `SELECT jeopScore FROM ${this.TABLE_NAME} WHERE id = 'scores'`
      );
      return result ? (result as any).jeopScore : 0;
    } catch (error) {
      console.error('Failed to get jeopardy high score:', error);
      return 0;
    }
  }

  static async saveJeopScore(score: number): Promise<void> {
    try {
      const db = Database.getInstance();
      await db.runAsync(
        `UPDATE ${this.TABLE_NAME} SET jeopScore = ? WHERE id = 'scores'`,
        [score]
      );
    } catch(error) {
      console.error('Failed to save jeopardy score:', error);
      throw error;
    }
  }

  static async resetJeopScore(): Promise<void> {
    try{
      const db = Database.getInstance();
      const zero: number = 0;
      await db.runAsync(
        `UPDATE ${this.TABLE_NAME} SET jeopScore = ? WHERE id = 'scores'`, [zero]
      );
    } catch(error) {
      console.error('Failed to reset jeopardy score:', error);
    }
  }

  static async getTriviaScore(): Promise<number> {
    try {
      const db = Database.getInstance();
      const result = await db.getFirstAsync(
        `SELECT triviaScore FROM ${this.TABLE_NAME} WHERE id = 'scores'`
      );
      return result ? (result as any).triviaScore : 0;
    } catch (error) {
      console.error('Failed to get trivia score:', error);
      return 0;
    }
  }

  static async saveTriviaScore(score: number): Promise<void> {
    try {
      const db = Database.getInstance();
      await db.runAsync(
        `UPDATE ${this.TABLE_NAME} SET triviaScore = ? WHERE id = 'scores'`,
        [score]
      );
    } catch (error) {
      console.error('Failed to save trivia score:', error);
      throw error;
    }
  }

  static async resetTriviaScore(): Promise<void> {
    try {
      const db = Database.getInstance();
      const zero: number = 0;
      await db.runAsync(
        `UPDATE ${this.TABLE_NAME} SET triviaScore = ? WHERE id = 'scores'`,
        [zero]
      );
    } catch (error) {
      console.error('Failed to reset trivia score:', error);
      throw error;
    }
  }

  static async getJeopardyTriviaScore(): Promise<number> {
    try {
      const db = Database.getInstance();
      const result = await db.getFirstAsync(
        `SELECT jeopardyTrivScore FROM ${this.TABLE_NAME} WHERE id = 'scores'`
      );
      return result ? (result as any).jeopardyTrivScore : 0;
    } catch (error) {
      console.error('Failed to get jeopardy trivia score:', error);
      return 0;
    }
  }

  static async saveJeopardyTriviaScore(score: number): Promise<void> {
    try {
      const db = Database.getInstance();
      await db.runAsync(
        `UPDATE ${this.TABLE_NAME} SET jeopardyTrivScore = ? WHERE id = 'scores'`,
        [score]
      );
    } catch (error) {
      console.error('Failed to save jeopardy trivia score:', error);
      throw error;
    }
  }

  static async resetJeopardyTriviaScore(): Promise<void> {
    try {
      const db = Database.getInstance();
      const zero: number = 0;
      await db.runAsync(
        `UPDATE ${this.TABLE_NAME} SET jeopardyTrivScore = ? WHERE id = 'scores'`,
        [zero]
      );
    } catch (error) {
      console.error('Failed to reset jeopardy trivia score:', error);
      throw error;
    }
  }

  /**
   * Set the last game score
   */
  static async setLastScore(score: number): Promise<void> {
    try {
      const db = Database.getInstance();
      await db.runAsync(
        `UPDATE ${this.TABLE_NAME} SET lastScore = ? WHERE id = 'scores'`,
        [score]
      );
    } catch (error) {
      console.error('Failed to set last score:', error);
      throw error;
    }
  }

  /**
   * Set the high score (only if higher than current)
   */
  static async setHighScore(score: number): Promise<void> {
    try {
      const db = Database.getInstance();
      const currentHighScore = await this.getHighScore();
      const newHighScore = Math.max(score, currentHighScore);

      await db.runAsync(
        `UPDATE ${this.TABLE_NAME} SET highScore = ? WHERE id = 'scores'`,
        [newHighScore]
      );
    } catch (error) {
      console.error('Failed to set high score:', error);
      throw error;
    }
  }

  /**
   * Save a game score and update high score if needed
   */
  static async saveScore(score: number): Promise<void> {
    try {
      const db = Database.getInstance();
      const currentHighScore = await this.getHighScore();
      const newHighScore = Math.max(score, currentHighScore);

      await db.runAsync(
        `UPDATE ${this.TABLE_NAME} SET lastScore = ?, highScore = ? WHERE id = 'scores'`,
        [score, newHighScore]
      );
    } catch (error) {
      console.error('Failed to save score:', error);
      throw error;
    }
  }

  static async resetHighScore(): Promise<void> {
    try {
      const db = Database.getInstance();
      const zero: number = 0;
      await db.runAsync(
        `UPDATE ${this.TABLE_NAME} SET highScore = ? WHERE id = 'scores'`, [zero]
      );
    } catch (error){
      console.error('Failed to reset the score', error);
      throw error;
    }
  }
}
