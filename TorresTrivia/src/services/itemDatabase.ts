import { Database } from './database';
import { GameItem } from '../types/index';

/**
 * ItemDatabase manages word/phrase selection and deduplication within rounds
 */
export class ItemDatabase {
  private usedItemIds: Set<string> = new Set();
  private allItemIds: string[] = [];

  /**
   * Initialize the ItemDatabase by loading all available items
   */
  async initialize(): Promise<void> {
    try {
      const db = Database.getInstance();
      const rows = await db.getAllAsync('SELECT id FROM items ORDER BY id');
      this.allItemIds = rows.map((row: any) => row.id);

      console.log(`ItemDatabase initialized with ${this.allItemIds.length} items`);
    } catch (error) {
      console.error('Failed to initialize ItemDatabase:', error);
      throw error;
    }
  }

  /**
   * Get a random item from the collection, avoiding duplicates within the round
   * If all items have been used, cycle back to the beginning
   */
  async getRandomItem(): Promise<GameItem> {
    if (this.allItemIds.length === 0) {
      throw new Error('No items available in database');
    }

    // If all items have been used, reset the used set to cycle back
    if (this.usedItemIds.size >= this.allItemIds.length) {
      this.usedItemIds.clear();
    }

    // Get list of unused items
    const unusedItems = this.allItemIds.filter((id) => !this.usedItemIds.has(id));

    // If no unused items remain, cycle back
    if (unusedItems.length === 0) {
      this.usedItemIds.clear();
      unusedItems.push(...this.allItemIds);
    }

    // Select a random unused item
    const randomIndex = Math.floor(Math.random() * unusedItems.length);
    const itemId = unusedItems[randomIndex];

    const randomItem = await this.getItemById(itemId);
    this.usedItemIds.add(itemId);

    return randomItem;
  }

  /**
   * Get a specific item by ID
   */
  async getItemById(id: string): Promise<GameItem> {
    try {
      const db = Database.getInstance();
      const row = await db.getFirstAsync(
        'SELECT id, text, category FROM items WHERE id = ?',
        [id]
      );

      if (!row) {
        throw new Error(`Item with id ${id} not found`);
      }

      return {
        id: (row as any).id,
        text: (row as any).text,
        category: (row as any).category,
      };
    } catch (error) {
      console.error(`Failed to get item by id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get all items from the collection
   */
  async getAllItems(): Promise<GameItem[]> {
    try {
      const db = Database.getInstance();
      const rows = await db.getAllAsync(
        'SELECT id, text, category FROM items ORDER BY id'
      );

      return rows.map((row: any) => ({
        id: row.id,
        text: row.text,
        category: row.category,
      }));
    } catch (error) {
      console.error('Failed to get all items:', error);
      throw error;
    }
  }

  /**
   * Get the count of items in the collection
   */
  async getItemCount(): Promise<number> {
    try {
      const db = Database.getInstance();
      const result = await db.getFirstAsync('SELECT COUNT(*) as count FROM items');
      return result ? (result as any).count : 0;
    } catch (error) {
      console.error('Failed to get item count:', error);
      throw error;
    }
  }

  /**
   * Reset the used items set for a new round
   */
  resetRound(): void {
    this.usedItemIds.clear();
  }

  /**
   * Get the set of used item IDs in the current round
   */
  getUsedItemIds(): Set<string> {
    return new Set(this.usedItemIds);
  }
}
