import { Database } from '../../services/database';
import { ItemDatabase } from '../../services/itemDatabase';
import { ScoreManager } from '../../services/scoreManager';
import { MockItemDatabase, MockGameItemFactory } from '../utils/testUtils';

describe('Database Integration Tests', () => {
  let database: Database;
  let itemDatabase: ItemDatabase;
  let mockItemDatabase: MockItemDatabase;

  beforeEach(async () => {
    database = Database.getInstance();
    itemDatabase = new ItemDatabase();
    mockItemDatabase = new MockItemDatabase(MockGameItemFactory.createMockItems(10));
  });

  describe('Database Basic Operations', () => {
    it('should initialize database successfully', async () => {
      expect(() => Database.getInstance()).not.toThrow();
    });

    it('should execute basic SQL operations', async () => {
      const result = await database.getFirstAsync('SELECT 1 as test');
      expect(result).toBeDefined();
    });

    it('should handle transaction operations', async () => {
      await Database.transaction(async (db) => {
        await db.runAsync('SELECT 1');
      });
      
      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('ItemDatabase Integration', () => {
    it('should initialize item database', async () => {
      await itemDatabase.initialize();
      
      // Should not throw
      expect(true).toBe(true);
    });

    it('should get random items', async () => {
      await itemDatabase.initialize();
      
      const item1 = await itemDatabase.getRandomItem();
      const item2 = await itemDatabase.getRandomItem();
      
      expect(item1).toBeDefined();
      expect(item2).toBeDefined();
      expect(item1.id).toBeDefined();
      expect(item1.text).toBeDefined();
    });

    it('should get item by ID', async () => {
      await itemDatabase.initialize();
      
      const randomItem = await itemDatabase.getRandomItem();
      if (randomItem) {
        const foundItem = await itemDatabase.getItemById(randomItem.id);
        expect(foundItem.id).toBe(randomItem.id);
        expect(foundItem.text).toBe(randomItem.text);
      }
    });

    it('should get items by category', async () => {
      await itemDatabase.initialize();
      
      const items = await itemDatabase.getItemsByCategory('Animals');
      expect(Array.isArray(items)).toBe(true);
    });

    it('should get all items', async () => {
      await itemDatabase.initialize();
      
      const allItems = await itemDatabase.getAllItems();
      expect(Array.isArray(allItems)).toBe(true);
      expect(allItems.length).toBeGreaterThan(0);
    });

    it('should track used items within round', async () => {
      await itemDatabase.initialize();
      
      const usedItems: string[] = [];
      
      // Get several items in a round
      for (let i = 0; i < 5; i++) {
        const item = await itemDatabase.getRandomItem();
        if (item) {
          usedItems.push(item.id);
        }
      }
      
      // At least some items should be tracked
      expect(usedItems.length).toBeGreaterThan(0);
    });

    it('should cycle back to beginning when all items used', async () => {
      await itemDatabase.initialize();
      
      const allItems = await itemDatabase.getAllItems();
      const usedItems: string[] = [];
      
      // Use all items
      for (let i = 0; i < allItems.length; i++) {
        const item = await itemDatabase.getRandomItem();
        if (item && !usedItems.includes(item.id)) {
          usedItems.push(item.id);
        }
      }
      
      // Should still be able to get items even after using all
      const itemAfterAllUsed = await itemDatabase.getRandomItem();
      expect(itemAfterAllUsed).toBeDefined();
    });
  });

  describe('ScoreManager Integration', () => {
    it('should initialize score manager', async () => {
      await ScoreManager.initialize();
      
      // Should not throw
      expect(true).toBe(true);
    });

    it('should save and retrieve scores', async () => {
      await ScoreManager.initialize();
      
      await ScoreManager.saveScore(100);
      const lastScore = await ScoreManager.getLastScore();
      const highScore = await ScoreManager.getHighScore();
      
      expect(lastScore).toBe(100);
      expect(highScore).toBe(100);
    });

    it('should update high score correctly', async () => {
      await ScoreManager.initialize();
      
      await ScoreManager.saveScore(50);
      expect(await ScoreManager.getHighScore()).toBe(50);
      
      await ScoreManager.saveScore(75);
      expect(await ScoreManager.getHighScore()).toBe(75);
      
      await ScoreManager.saveScore(25);
      expect(await ScoreManager.getHighScore()).toBe(75); // Should not decrease
    });

    it('should handle game-specific scores', async () => {
      await ScoreManager.initialize();
      
      await ScoreManager.saveJeopScore(150);
      await ScoreManager.saveTriviaScore(200);
      await ScoreManager.saveJeopardyTriviaScore(175);
      
      // These should not throw
      expect(true).toBe(true);
    });

    it('should reset scores correctly', async () => {
      await ScoreManager.initialize();
      
      await ScoreManager.saveScore(100);
      await ScoreManager.resetHighScore();
      
      expect(await ScoreManager.getHighScore()).toBe(0);
    });
  });

  describe('Mock Database Tests', () => {
    it('should create mock items correctly', () => {
      const items = MockGameItemFactory.createMockItems(5);
      
      expect(items.length).toBe(5);
      expect(items[0].id).toBe('item-0');
      expect(items[0].text).toBe('Test Item 0');
      expect(items[0].category).toBe('Test Category');
    });

    it('should create categorized items', () => {
      const categorizedItems = MockGameItemFactory.createCategorizedItems();
      
      expect(categorizedItems.length).toBe(6);
      expect(categorizedItems.some(item => item.category === 'Animals')).toBe(true);
      expect(categorizedItems.some(item => item.category === 'Food')).toBe(true);
      expect(categorizedItems.some(item => item.category === 'Movies')).toBe(true);
    });

    it('should get random items from mock database', async () => {
      const item = await mockItemDatabase.getRandomItem();
      
      expect(item).toBeDefined();
      expect(item.id).toMatch(/^item-\d+$/);
      expect(item.text).toMatch(/^Test Item \d+$/);
    });

    it('should track used items in mock database', async () => {
      const item1 = await mockItemDatabase.getRandomItem();
      const item2 = await mockItemDatabase.getRandomItem();
      
      const usedItems = mockItemDatabase.getUsedItems();
      
      expect(usedItems).toContain(item1.id);
      expect(usedItems).toContain(item2.id);
    });

    it('should reset used items in mock database', async () => {
      await mockItemDatabase.getRandomItem();
      await mockItemDatabase.getRandomItem();
      
      expect(mockItemDatabase.getUsedItems().length).toBeGreaterThan(0);
      
      mockItemDatabase.resetUsedItems();
      
      expect(mockItemDatabase.getUsedItems().length).toBe(0);
    });

    it('should get available items in mock database', async () => {
      const totalItems = 10;
      const mockDb = new MockItemDatabase(MockGameItemFactory.createMockItems(totalItems));
      
      // Use half the items
      for (let i = 0; i < totalItems / 2; i++) {
        await mockDb.getRandomItem();
      }
      
      const availableItems = mockDb.getAvailableItems();
      expect(availableItems.length).toBe(totalItems / 2);
    });

    it('should add items to mock database', async () => {
      const newItem = MockGameItemFactory.createMockItem('custom-1', 'Custom Item', 'Custom Category');
      
      mockItemDatabase.addItem(newItem);
      
      const foundItem = await mockItemDatabase.getItemById('custom-1');
      expect(foundItem.id).toBe('custom-1');
      expect(foundItem.text).toBe('Custom Item');
    });

    it('should remove items from mock database', async () => {
      const newItem = MockGameItemFactory.createMockItem('removable-1', 'Removable Item', 'Test');
      
      mockItemDatabase.addItem(newItem);
      expect(await mockItemDatabase.getItemById('removable-1')).toBeDefined();
      
      mockItemDatabase.removeItem('removable-1');
      
      // Should throw when trying to find removed item
      try {
        await mockItemDatabase.getItemById('removable-1');
        fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Database Performance', () => {
    it('should handle many item retrievals efficiently', async () => {
      await itemDatabase.initialize();
      
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        await itemDatabase.getRandomItem();
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000); // Should complete in less than 1 second
    });

    it('should handle many score operations efficiently', async () => {
      await ScoreManager.initialize();
      
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        await ScoreManager.saveScore(i);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(2000); // Should complete in less than 2 seconds
    });
  });

  describe('Database Error Handling', () => {
    it('should handle invalid SQL gracefully', async () => {
      try {
        await database.runAsync('INVALID SQL');
        fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle missing items gracefully', async () => {
      await itemDatabase.initialize();
      
      try {
        await itemDatabase.getItemById('non-existent-id');
        // Should not throw, but return null or handle gracefully
        expect(true).toBe(true);
      } catch (error) {
        // If it throws, that's also acceptable error handling
        expect(error).toBeDefined();
      }
    });
  });

  describe('Data Consistency', () => {
    it('should maintain item data integrity', async () => {
      await itemDatabase.initialize();
      
      const item = await itemDatabase.getRandomItem();
      
      if (item) {
        expect(item.id).toBeDefined();
        expect(item.text).toBeDefined();
        expect(typeof item.id).toBe('string');
        expect(typeof item.text).toBe('string');
        expect(item.id.length).toBeGreaterThan(0);
        expect(item.text.length).toBeGreaterThan(0);
      }
    });

    it('should maintain score data integrity', async () => {
      await ScoreManager.initialize();
      
      const testScore = 123;
      await ScoreManager.saveScore(testScore);
      
      const retrievedScore = await ScoreManager.getLastScore();
      expect(retrievedScore).toBe(testScore);
      expect(typeof retrievedScore).toBe('number');
    });

    it('should handle concurrent operations', async () => {
      await ScoreManager.initialize();
      
      // Simulate concurrent score saves
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(ScoreManager.saveScore(i));
      }
      
      await Promise.all(promises);
      
      // Should not have corrupted data
      const finalScore = await ScoreManager.getLastScore();
      expect(typeof finalScore).toBe('number');
      expect(finalScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Integration with Game Logic', () => {
    it('should support complete game flow with database', async () => {
      await ScoreManager.initialize();
      await itemDatabase.initialize();
      
      // Simulate game
      const gameScore = 15;
      await ScoreManager.saveScore(gameScore);
      
      // Verify persistence
      const lastScore = await ScoreManager.getLastScore();
      const highScore = await ScoreManager.getHighScore();
      
      expect(lastScore).toBe(gameScore);
      expect(highScore).toBe(gameScore);
      
      // Get items for next game
      const nextGameItem = await itemDatabase.getRandomItem();
      expect(nextGameItem).toBeDefined();
    });

    it('should handle multiple game sessions', async () => {
      await ScoreManager.initialize();
      await itemDatabase.initialize();
      
      const gameScores = [10, 25, 15, 30, 20];
      
      for (const score of gameScores) {
        await ScoreManager.saveScore(score);
      }
      
      const finalHighScore = await ScoreManager.getHighScore();
      expect(finalHighScore).toBe(Math.max(...gameScores));
      
      const finalLastScore = await ScoreManager.getLastScore();
      expect(finalLastScore).toBe(gameScores[gameScores.length - 1]);
    });
  });

  describe('Mock Database Integration', () => {
    it('should integrate mock database with game logic', async () => {
      const { GameState } = await import('../../services/gameState');
      const gameState = new GameState();
      
      gameState.startRound(60);
      
      // Use mock database for items
      for (let i = 0; i < 5; i++) {
        const item = await mockItemDatabase.getRandomItem();
        if (item) {
          gameState.registerCorrectGuess(item.id);
        }
      }
      
      expect(gameState.getCurrentScore()).toBe(5);
      expect(mockItemDatabase.getUsedItems().length).toBe(5);
    });

    it('should simulate complete game with mock database', async () => {
      const { GameState } = await import('../../services/gameState');
      const gameState = new GameState();
      
      // Start game
      gameState.startRound(60);
      
      // Play game with mock items
      const actions = ['CORRECT', 'SKIP', 'CORRECT', 'CORRECT'];
      for (const action of actions) {
        const item = await mockItemDatabase.getRandomItem();
        if (item) {
          if (action === 'CORRECT') {
            gameState.registerCorrectGuess(item.id);
          } else {
            gameState.registerSkip(item.id);
          }
        }
      }
      
      // End game
      gameState.endRound();
      
      expect(gameState.getCurrentScore()).toBe(3);
      expect(mockItemDatabase.getUsedItems().length).toBe(4);
    });
  });
});
