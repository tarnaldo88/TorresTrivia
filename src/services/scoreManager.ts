import { Database } from './database';

/**
 * ScoreManager handles score persistence and retrieval
 */
export class ScoreManager {
  private static readonly TABLE_NAME = 'scores';

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
          jeopScore INTEGER DEFAULT 0
        );`
      );

      // Initialize with default values if not exists
      const result = await db.getFirstAsync(
        `SELECT COUNT(*) as count FROM ${this.TABLE_NAME}`
      );
      
      if ((result as any).count === 0) {
        await db.runAsync(
          `INSERT INTO ${this.TABLE_NAME} (id, lastScore, highScore, jeopScore) VALUES (?, ?, ?, ?)`,
          ['scores', 0, 0, 0]
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
      const result = await.db.getFirstAsync(
        `SELECT jeopScore FROM ${this.TABLE_NAME} WHERE id = 'scores'`
      );
      return result ? (result as any).jeopScore : 0;
    } catch (error) {
      console.error('Failed to get jeopardy high score:', error);
      return 0;
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
