import * as SQLite from 'expo-sqlite';

/**
 * Database initialization and management
 */
export class Database {
  private static instance: SQLite.SQLiteDatabase | null = null;
  private static readonly DB_NAME = 'headsup.db';

  /**
   * Initialize the database and create schema
   */
  static async initialize(): Promise<SQLite.SQLiteDatabase> {
    if (this.instance) {
      return this.instance;
    }

    try {
      this.instance = await SQLite.openDatabaseAsync(this.DB_NAME);
      await this.createSchema();
      return this.instance;
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  /**
   * Create database schema
   */
  static async createSchema(): Promise<void> {
    if (!this.instance) {
      throw new Error('Database not initialized');
    }

    try {
      // Create items table
      await this.instance.execAsync(
        `CREATE TABLE IF NOT EXISTS items (
          id TEXT PRIMARY KEY,
          text TEXT NOT NULL,
          category TEXT
        );`
      );

      // Create index for faster queries
      await this.instance.execAsync(
        `CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);`
      );

      // Create trivia questions table
      await this.instance.execAsync(
        `CREATE TABLE IF NOT EXISTS trivia_questions (
          id TEXT PRIMARY KEY,
          question TEXT NOT NULL,
          answer TEXT NOT NULL,
          category TEXT,
          difficulty TEXT
        );`
      );

      // Create index for trivia questions
      await this.instance.execAsync(
        `CREATE INDEX IF NOT EXISTS idx_trivia_category ON trivia_questions(category);`
      );

      // Create question packs table
      await this.instance.execAsync(
        `CREATE TABLE IF NOT EXISTS question_packs (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          author TEXT,
          category TEXT,
          difficulty TEXT,
          question_count INTEGER DEFAULT 0,
          is_public INTEGER DEFAULT 0,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL,
          tags TEXT
        );`
      );

      // Create pack questions table
      await this.instance.execAsync(
        `CREATE TABLE IF NOT EXISTS pack_questions (
          id TEXT PRIMARY KEY,
          pack_id TEXT NOT NULL,
          question TEXT NOT NULL,
          answer TEXT NOT NULL,
          category TEXT,
          difficulty TEXT,
          order_index INTEGER NOT NULL,
          FOREIGN KEY (pack_id) REFERENCES question_packs(id) ON DELETE CASCADE
        );`
      );

      // Create indexes for question packs
      await this.instance.execAsync(
        `CREATE INDEX IF NOT EXISTS idx_question_packs_category ON question_packs(category);`
      );
      await this.instance.execAsync(
        `CREATE INDEX IF NOT EXISTS idx_question_packs_author ON question_packs(author);`
      );
      await this.instance.execAsync(
        `CREATE INDEX IF NOT EXISTS idx_pack_questions_pack_id ON pack_questions(pack_id);`
      );

      console.log('Database schema created successfully');
    } catch (error) {
      console.error('Schema creation failed:', error);
      throw error;
    }
  }

  /**
   * Get database instance
   */
  static getInstance(): SQLite.SQLiteDatabase {
    if (!this.instance) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.instance;
  }

  /**
   * Close database connection
   */
  static async close(): Promise<void> {
    if (this.instance) {
      try {
        await this.instance.closeAsync();
        this.instance = null;
        console.log('Database closed successfully');
      } catch (error) {
        console.error('Error closing database:', error);
        throw error;
      }
    }
  }

  /**
   * Execute a SQL query
   */
  static async executeSql(
    sql: string,
    params: (string | number)[] = []
  ): Promise<any> {
    const db = this.getInstance();
    try {
      const result = await db.getFirstAsync(sql, params);
      return result;
    } catch (error) {
      console.error('SQL execution failed:', error, { sql, params });
      throw error;
    }
  }

  /**
   * Execute multiple SQL statements in a transaction
   */
  static async transaction(
    callback: (db: SQLite.SQLiteDatabase) => Promise<void>
  ): Promise<void> {
    const db = this.getInstance();
    try {
      await db.withTransactionAsync(async () => {
        await callback(db);
      });
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  }
}
