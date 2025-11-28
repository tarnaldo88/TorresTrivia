import SQLite from 'react-native-sqlite-storage';

// Enable debug mode for development
SQLite.DEBUG(true);

/**
 * Database initialization and management
 */
export class Database {
  private static instance: any = null;
  private static readonly DB_NAME = 'headsup.db';
  private static readonly DB_VERSION = '1.0';

  /**
   * Initialize the database and create schema
   */
  static async initialize(): Promise<any> {
    if (this.instance) {
      return this.instance;
    }

    try {
      this.instance = await SQLite.openDatabase({
        name: this.DB_NAME,
        location: 'default',
        createFromLocation: '~www/headsup.db', // Optional: pre-populated DB
      });

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
  private static async createSchema(): Promise<void> {
    if (!this.instance) {
      throw new Error('Database not initialized');
    }

    try {
      // Create items table
      await this.instance.executeSql(
        `CREATE TABLE IF NOT EXISTS items (
          id TEXT PRIMARY KEY,
          text TEXT NOT NULL,
          category TEXT
        );`
      );

      // Create index for faster queries
      await this.instance.executeSql(
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
  static getInstance(): any {
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
        await this.instance.close();
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
      const result = await db.executeSql(sql, params);
      return result[0];
    } catch (error) {
      console.error('SQL execution failed:', error, { sql, params });
      throw error;
    }
  }

  /**
   * Execute multiple SQL statements in a transaction
   */
  static async transaction(
    callback: (db: any) => Promise<void>
  ): Promise<void> {
    const db = this.getInstance();
    try {
      await db.transaction(async (tx: any) => {
        await callback(db);
      });
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  }
}
