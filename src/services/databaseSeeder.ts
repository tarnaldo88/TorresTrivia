import { Database } from './database';

/**
 * Default word and phrase collection for the game
 */
const DEFAULT_ITEMS = [
  // Movies
  { id: 'movie_1', text: 'The Shawshank Redemption', category: 'Movies' },
  { id: 'movie_2', text: 'Inception', category: 'Movies' },
  { id: 'movie_3', text: 'The Dark Knight', category: 'Movies' },
  { id: 'movie_4', text: 'Pulp Fiction', category: 'Movies' },
  { id: 'movie_5', text: 'Forrest Gump', category: 'Movies' },
  { id: 'movie_6', text: 'The Matrix', category: 'Movies' },
  { id: 'movie_7', text: 'Titanic', category: 'Movies' },
  { id: 'movie_8', text: 'Avatar', category: 'Movies' },

  // TV Shows
  { id: 'tv_1', text: 'Breaking Bad', category: 'TV Shows' },
  { id: 'tv_2', text: 'Game of Thrones', category: 'TV Shows' },
  { id: 'tv_3', text: 'The Office', category: 'TV Shows' },
  { id: 'tv_4', text: 'Friends', category: 'TV Shows' },
  { id: 'tv_5', text: 'Stranger Things', category: 'TV Shows' },
  { id: 'tv_6', text: 'The Crown', category: 'TV Shows' },

  // Animals
  { id: 'animal_1', text: 'Lion', category: 'Animals' },
  { id: 'animal_2', text: 'Elephant', category: 'Animals' },
  { id: 'animal_3', text: 'Penguin', category: 'Animals' },
  { id: 'animal_4', text: 'Dolphin', category: 'Animals' },
  { id: 'animal_5', text: 'Giraffe', category: 'Animals' },
  { id: 'animal_6', text: 'Octopus', category: 'Animals' },

  // Sports
  { id: 'sport_1', text: 'Basketball', category: 'Sports' },
  { id: 'sport_2', text: 'Soccer', category: 'Sports' },
  { id: 'sport_3', text: 'Tennis', category: 'Sports' },
  { id: 'sport_4', text: 'Swimming', category: 'Sports' },
  { id: 'sport_5', text: 'Golf', category: 'Sports' },
  { id: 'sport_6', text: 'Volleyball', category: 'Sports' },

  // Professions
  { id: 'prof_1', text: 'Doctor', category: 'Professions' },
  { id: 'prof_2', text: 'Teacher', category: 'Professions' },
  { id: 'prof_3', text: 'Engineer', category: 'Professions' },
  { id: 'prof_4', text: 'Chef', category: 'Professions' },
  { id: 'prof_5', text: 'Pilot', category: 'Professions' },
  { id: 'prof_6', text: 'Astronaut', category: 'Professions' },

  // Common Phrases
  { id: 'phrase_1', text: 'Break a leg', category: 'Phrases' },
  { id: 'phrase_2', text: 'Piece of cake', category: 'Phrases' },
  { id: 'phrase_3', text: 'Raining cats and dogs', category: 'Phrases' },
  { id: 'phrase_4', text: 'Hit the hay', category: 'Phrases' },
  { id: 'phrase_5', text: 'Spill the beans', category: 'Phrases' },
  { id: 'phrase_6', text: 'Under the weather', category: 'Phrases' },
];

/**
 * Seed the database with default items
 */
export async function seedDatabase(): Promise<void> {
  try {
    // Check if items already exist
    const result = await Database.executeSql('SELECT COUNT(*) as count FROM items');
    const itemCount = result.rows.length > 0 ? result.rows.item(0).count : 0;

    if (itemCount > 0) {
      console.log(`Database already seeded with ${itemCount} items`);
      return;
    }

    // Insert default items
    for (const item of DEFAULT_ITEMS) {
      await Database.executeSql(
        'INSERT INTO items (id, text, category) VALUES (?, ?, ?)',
        [item.id, item.text, item.category]
      );
    }

    console.log(`Successfully seeded database with ${DEFAULT_ITEMS.length} items`);
  } catch (error) {
    console.error('Database seeding failed:', error);
    throw error;
  }
}

/**
 * Add custom items to the database
 */
export async function addItems(
  items: Array<{ id: string; text: string; category?: string }>
): Promise<void> {
  try {
    for (const item of items) {
      await Database.executeSql(
        'INSERT OR REPLACE INTO items (id, text, category) VALUES (?, ?, ?)',
        [item.id, item.text, item.category || '']
      );
    }
    console.log(`Added ${items.length} items to database`);
  } catch (error) {
    console.error('Failed to add items:', error);
    throw error;
  }
}

/**
 * Clear all items from the database
 */
export async function clearItems(): Promise<void> {
  try {
    await Database.executeSql('DELETE FROM items');
    console.log('All items cleared from database');
  } catch (error) {
    console.error('Failed to clear items:', error);
    throw error;
  }
}
