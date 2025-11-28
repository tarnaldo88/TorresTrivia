import { Database } from './database';
import { seedDatabase, addItems, clearItems } from './databaseSeeder';

/**
 * Mock SQLite for testing
 */
jest.mock('react-native-sqlite-storage', () => {
  const mockResultSet = {
    rows: {
      length: 0,
      item: (index: number) => ({}),
    },
  };

  const mockDatabase = {
    executeSql: jest.fn().mockResolvedValue([mockResultSet]),
    close: jest.fn().mockResolvedValue(undefined),
    transaction: jest.fn().mockImplementation((callback) => callback(mockDatabase)),
  };

  return {
    openDatabase: jest.fn().mockResolvedValue(mockDatabase),
    DEBUG: jest.fn(),
  };
});

describe('Database Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the singleton instance
    (Database as any).instance = null;
  });

  describe('initialize', () => {
    it('should initialize database successfully', async () => {
      const db = await Database.initialize();
      expect(db).toBeDefined();
    });

    it('should create schema on initialization', async () => {
      await Database.initialize();
      const db = Database.getInstance();
      expect(db.executeSql).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS items')
      );
    });

    it('should return same instance on multiple calls', async () => {
      const db1 = await Database.initialize();
      const db2 = await Database.initialize();
      expect(db1).toBe(db2);
    });
  });

  describe('getInstance', () => {
    it('should throw error if database not initialized', () => {
      expect(() => Database.getInstance()).toThrow('Database not initialized');
    });

    it('should return instance after initialization', async () => {
      await Database.initialize();
      const db = Database.getInstance();
      expect(db).toBeDefined();
    });
  });

  describe('executeSql', () => {
    beforeEach(async () => {
      await Database.initialize();
    });

    it('should execute SQL query', async () => {
      const result = await Database.executeSql('SELECT * FROM items');
      expect(result).toBeDefined();
    });

    it('should pass parameters to SQL query', async () => {
      await Database.executeSql('SELECT * FROM items WHERE id = ?', ['test_id']);
      const db = Database.getInstance();
      expect(db.executeSql).toHaveBeenCalledWith(
        'SELECT * FROM items WHERE id = ?',
        ['test_id']
      );
    });
  });

  describe('close', () => {
    it('should close database connection', async () => {
      await Database.initialize();
      await Database.close();
      expect(() => Database.getInstance()).toThrow();
    });
  });
});

describe('Database Seeder', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    (Database as any).instance = null;
    await Database.initialize();
  });

  afterEach(async () => {
    await Database.close();
  });

  describe('seedDatabase', () => {
    it('should seed database with default items', async () => {
      const mockResultSet = {
        rows: {
          length: 1,
          item: () => ({ count: 0 }),
        },
      };

      const db = Database.getInstance();
      (db.executeSql as jest.Mock).mockClear();
      (db.executeSql as jest.Mock).mockResolvedValueOnce([mockResultSet]);

      await seedDatabase();

      // Should have called INSERT for each item
      expect(db.executeSql).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO items'),
        expect.any(Array)
      );
    });

    it('should not reseed if items already exist', async () => {
      const mockResultSet = {
        rows: {
          length: 1,
          item: () => ({ count: 10 }),
        },
      };

      const db = Database.getInstance();
      (db.executeSql as jest.Mock).mockClear();
      (db.executeSql as jest.Mock).mockResolvedValueOnce([mockResultSet]);

      await seedDatabase();

      // Should only call SELECT COUNT, not INSERT
      expect(db.executeSql).toHaveBeenCalledWith(
        expect.stringContaining('SELECT COUNT'),
        expect.any(Array)
      );
    });
  });

  describe('addItems', () => {
    it('should add custom items to database', async () => {
      const customItems = [
        { id: 'custom_1', text: 'Custom Item 1', category: 'Custom' },
        { id: 'custom_2', text: 'Custom Item 2', category: 'Custom' },
      ];

      await addItems(customItems);

      const db = Database.getInstance();
      expect(db.executeSql).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO items'),
        expect.any(Array)
      );
    });
  });

  describe('clearItems', () => {
    it('should clear all items from database', async () => {
      const db = Database.getInstance();
      (db.executeSql as jest.Mock).mockClear();

      await clearItems();

      expect(db.executeSql).toHaveBeenCalledWith('DELETE FROM items', []);
    });
  });
});
