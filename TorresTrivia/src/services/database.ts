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
      const result = await db.getAsync(sql, params);
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
