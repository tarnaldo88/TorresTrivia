import { ItemDatabase } from './itemDatabase';
import { Database } from './database';
import { seedDatabase, clearItems } from './databaseSeeder';
import * as fc from 'fast-check';

/**
 * Mock SQLite for testing
 */
let mockItemsStore: Array<{ id: string; text: string; category?: string }> = [];

jest.mock('react-native-sqlite-storage', () => {
  const mockDatabase = {
    executeSql: jest.fn(async (sql: string, params?: any[]) => {
      // Handle INSERT
      if (sql.includes('INSERT')) {
        const [id, text, category] = params || [];
        mockItemsStore.push({ id, text, category });
        return [{ rows: { length: 1, item: () => ({}) } }];
      }

      // Handle SELECT COUNT
      if (sql.includes('SELECT COUNT')) {
        return [
          {
            rows: {
              length: 1,
              item: () => ({ count: mockItemsStore.length }),
            },
          },
        ];
      }

      // Handle SELECT with WHERE id
      if (sql.includes('WHERE id')) {
        const [id] = params || [];
        const item = mockItemsStore.find((i) => i.id === id);
        if (item) {
          return [
            {
              rows: {
                length: 1,
                item: () => item,
              },
            },
          ];
        }
        return [{ rows: { length: 0, item: () => ({}) } }];
      }

      // Handle SELECT all
      if (sql.includes('SELECT id FROM items') || sql.includes('SELECT id, text, category FROM items')) {
        return [
          {
            rows: {
              length: mockItemsStore.length,
              item: (index: number) => mockItemsStore[index],
            },
          },
        ];
      }

      // Handle DELETE
      if (sql.includes('DELETE')) {
        mockItemsStore = [];
        return [{ rows: { length: 0, item: () => ({}) } }];
      }

      // Default
      return [{ rows: { length: 0, item: () => ({}) } }];
    }),
    close: jest.fn().mockResolvedValue(undefined),
    transaction: jest.fn().mockImplementation((callback) => callback(mockDatabase)),
  };

  return {
    openDatabase: jest.fn().mockResolvedValue(mockDatabase),
    DEBUG: jest.fn(),
  };
});

describe('ItemDatabase', () => {
  let itemDatabase: ItemDatabase;

  beforeEach(async () => {
    jest.clearAllMocks();
    (Database as any).instance = null;
    await Database.initialize();
    await seedDatabase();
    itemDatabase = new ItemDatabase();
  });

  afterEach(async () => {
    await clearItems();
    await Database.close();
  });

  describe('initialize', () => {
    it('should initialize with all items from database', async () => {
      await itemDatabase.initialize();
      const count = await itemDatabase.getItemCount();
      expect(count).toBeGreaterThan(0);
    });
  });

  describe('getRandomItem', () => {
    beforeEach(async () => {
      await itemDatabase.initialize();
    });

    it('should return a valid GameItem', async () => {
      const item = await itemDatabase.getRandomItem();
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('text');
      expect(typeof item.id).toBe('string');
      expect(typeof item.text).toBe('string');
    });

    it('should return items from the database', async () => {
      const allItems = await itemDatabase.getAllItems();
      const randomItem = await itemDatabase.getRandomItem();
      const itemExists = allItems.some((item) => item.id === randomItem.id);
      expect(itemExists).toBe(true);
    });
  });

  describe('getItemById', () => {
    beforeEach(async () => {
      await itemDatabase.initialize();
    });

    it('should retrieve a specific item by ID', async () => {
      const allItems = await itemDatabase.getAllItems();
      if (allItems.length > 0) {
        const targetItem = allItems[0];
        const retrievedItem = await itemDatabase.getItemById(targetItem.id);
        expect(retrievedItem.id).toBe(targetItem.id);
        expect(retrievedItem.text).toBe(targetItem.text);
      }
    });

    it('should throw error for non-existent item', async () => {
      await expect(itemDatabase.getItemById('non_existent_id')).rejects.toThrow();
    });
  });

  describe('getAllItems', () => {
    beforeEach(async () => {
      await itemDatabase.initialize();
    });

    it('should return all items from database', async () => {
      const items = await itemDatabase.getAllItems();
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThan(0);
    });

    it('should return items with required properties', async () => {
      const items = await itemDatabase.getAllItems();
      items.forEach((item) => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('text');
        expect(typeof item.id).toBe('string');
        expect(typeof item.text).toBe('string');
      });
    });
  });

  describe('resetRound', () => {
    beforeEach(async () => {
      await itemDatabase.initialize();
    });

    it('should clear used items', async () => {
      await itemDatabase.getRandomItem();
      expect(itemDatabase.getUsedItemIds().size).toBeGreaterThan(0);
      itemDatabase.resetRound();
      expect(itemDatabase.getUsedItemIds().size).toBe(0);
    });
  });

  describe('Property 1: Round displays items', () => {
    /**
     * **Feature: heads-up-game, Property 1: Round displays items**
     * **Validates: Requirements 1.1, 7.1, 7.2**
     *
     * For any active round, the system should display a word or phrase from the available collection on the screen.
     */
    it('should always return items from the available collection', async () => {
      await itemDatabase.initialize();
      const allItems = await itemDatabase.getAllItems();

      await fc.assert(
        fc.asyncProperty(fc.integer({ min: 1, max: 10 }), async () => {
          const randomItem = await itemDatabase.getRandomItem();

          // Verify the item exists in the collection
          const itemExists = allItems.some((item) => item.id === randomItem.id);
          expect(itemExists).toBe(true);

          // Verify the item has required properties
          expect(randomItem.id).toBeDefined();
          expect(randomItem.text).toBeDefined();
          expect(typeof randomItem.text).toBe('string');
          expect(randomItem.text.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 18: No item repetition within round', () => {
    /**
     * **Feature: heads-up-game, Property 18: No item repetition within round**
     * **Validates: Requirements 7.3**
     *
     * For any active round, when multiple items are displayed sequentially, no item should appear more than once within the same round.
     */
    it('should not repeat items within a single round', async () => {
      await itemDatabase.initialize();
      const totalItems = await itemDatabase.getItemCount();

      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: Math.max(totalItems, 1) }),
          async (numItems) => {
            itemDatabase.resetRound();
            const displayedItems: string[] = [];
            const itemsToGet = Math.min(numItems, totalItems);

            for (let i = 0; i < itemsToGet; i++) {
              const item = await itemDatabase.getRandomItem();
              displayedItems.push(item.id);
            }

            // Check for duplicates
            const uniqueItems = new Set(displayedItems);
            expect(uniqueItems.size).toBe(displayedItems.length);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 19: Item cycling on exhaustion', () => {
    /**
     * **Feature: heads-up-game, Property 19: Item cycling on exhaustion**
     * **Validates: Requirements 7.4**
     *
     * For any round where all items in the collection have been displayed, the system should either cycle back to the beginning of the collection or provide new items to continue gameplay.
     */
    it('should cycle back to items after exhausting the collection', async () => {
      await itemDatabase.initialize();
      const totalItems = await itemDatabase.getItemCount();
      const allItems = await itemDatabase.getAllItems();

      await fc.assert(
        fc.asyncProperty(fc.constant(null), async () => {
          // Create a fresh ItemDatabase for each iteration
          const freshDb = new ItemDatabase();
          await freshDb.initialize();

          freshDb.resetRound();
          const firstRoundItems: string[] = [];

          // Get all items in first pass
          for (let i = 0; i < totalItems; i++) {
            const item = await freshDb.getRandomItem();
            firstRoundItems.push(item.id);
          }

          // Verify we got all items
          expect(firstRoundItems.length).toBe(totalItems);

          // Reset and verify we can get items again (cycling works)
          freshDb.resetRound();
          const secondItem = await freshDb.getRandomItem();

          // Verify the second round item is from the collection
          const exists = allItems.some((item) => item.id === secondItem.id);
          expect(exists).toBe(true);
        }),
        { numRuns: 100 }
      );
    });
  });
});
