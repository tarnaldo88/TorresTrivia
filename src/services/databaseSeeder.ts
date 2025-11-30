import { Database } from './database';

/**
 * Default trivia questions collection
 */
const DEFAULT_TRIVIA_QUESTIONS = [
  // Science
  { id: 'trivia_1', question: 'What is the chemical symbol for gold?', answer: 'Au', category: 'Science', difficulty: 'Easy' },
  { id: 'trivia_2', question: 'What is the largest planet in our solar system?', answer: 'Jupiter', category: 'Science', difficulty: 'Easy' },
  { id: 'trivia_3', question: 'What is the speed of light?', answer: '299,792,458 meters per second', category: 'Science', difficulty: 'Hard' },
  { id: 'trivia_4', question: 'What is the powerhouse of the cell?', answer: 'Mitochondria', category: 'Science', difficulty: 'Easy' },
  { id: 'trivia_5', question: 'How many bones are in the human body?', answer: '206', category: 'Science', difficulty: 'Medium' },

  // History
  { id: 'trivia_6', question: 'In what year did the Titanic sink?', answer: '1912', category: 'History', difficulty: 'Easy' },
  { id: 'trivia_7', question: 'Who was the first President of the United States?', answer: 'George Washington', category: 'History', difficulty: 'Easy' },
  { id: 'trivia_8', question: 'What year did World War II end?', answer: '1945', category: 'History', difficulty: 'Easy' },
  { id: 'trivia_9', question: 'Who wrote the Declaration of Independence?', answer: 'Thomas Jefferson', category: 'History', difficulty: 'Medium' },
  { id: 'trivia_10', question: 'In what year did the Berlin Wall fall?', answer: '1989', category: 'History', difficulty: 'Medium' },

  // Geography
  { id: 'trivia_11', question: 'What is the capital of France?', answer: 'Paris', category: 'Geography', difficulty: 'Easy' },
  { id: 'trivia_12', question: 'What is the largest country by area?', answer: 'Russia', category: 'Geography', difficulty: 'Easy' },
  { id: 'trivia_13', question: 'What is the capital of Japan?', answer: 'Tokyo', category: 'Geography', difficulty: 'Easy' },
  { id: 'trivia_14', question: 'How many continents are there?', answer: '7', category: 'Geography', difficulty: 'Easy' },
  { id: 'trivia_15', question: 'What is the longest river in the world?', answer: 'The Nile River', category: 'Geography', difficulty: 'Medium' },

  // Literature
  { id: 'trivia_16', question: 'Who wrote Romeo and Juliet?', answer: 'William Shakespeare', category: 'Literature', difficulty: 'Easy' },
  { id: 'trivia_17', question: 'Who wrote 1984?', answer: 'George Orwell', category: 'Literature', difficulty: 'Easy' },
  { id: 'trivia_18', question: 'Who wrote Pride and Prejudice?', answer: 'Jane Austen', category: 'Literature', difficulty: 'Easy' },
  { id: 'trivia_19', question: 'Who wrote The Great Gatsby?', answer: 'F. Scott Fitzgerald', category: 'Literature', difficulty: 'Medium' },
  { id: 'trivia_20', question: 'How many books are in the Harry Potter series?', answer: '7', category: 'Literature', difficulty: 'Easy' },

  // Sports
  { id: 'trivia_21', question: 'How many players are on a basketball team on the court?', answer: '5', category: 'Sports', difficulty: 'Easy' },
  { id: 'trivia_22', question: 'How many innings are in a baseball game?', answer: '9', category: 'Sports', difficulty: 'Easy' },
  { id: 'trivia_23', question: 'What is the maximum score in a single frame of bowling?', answer: '300', category: 'Sports', difficulty: 'Medium' },
  { id: 'trivia_24', question: 'How many holes are on a standard golf course?', answer: '18', category: 'Sports', difficulty: 'Easy' },
  { id: 'trivia_25', question: 'In tennis, what is a score of zero called?', answer: 'Love', category: 'Sports', difficulty: 'Medium' },
];

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
 * Seed the database with default items and trivia questions
 */
export async function seedDatabase(): Promise<void> {
  try {
    const db = Database.getInstance();
    
    // Check if items already exist
    const itemResult = await db.getFirstAsync('SELECT COUNT(*) as count FROM items');
    const itemCount = itemResult ? (itemResult as any).count : 0;

    // Check if trivia questions already exist
    const triviaResult = await db.getFirstAsync('SELECT COUNT(*) as count FROM trivia_questions');
    const triviaCount = triviaResult ? (triviaResult as any).count : 0;

    if (itemCount > 0 && triviaCount > 0) {
      console.log(`Database already seeded with ${itemCount} items and ${triviaCount} trivia questions`);
      return;
    }

    // Insert default items if not already present
    if (itemCount === 0) {
      for (const item of DEFAULT_ITEMS) {
        await db.runAsync(
          'INSERT INTO items (id, text, category) VALUES (?, ?, ?)',
          [item.id, item.text, item.category]
        );
      }
      console.log(`Successfully seeded database with ${DEFAULT_ITEMS.length} items`);
    }

    // Insert default trivia questions if not already present
    if (triviaCount === 0) {
      for (const question of DEFAULT_TRIVIA_QUESTIONS) {
        await db.runAsync(
          'INSERT INTO trivia_questions (id, question, answer, category, difficulty) VALUES (?, ?, ?, ?, ?)',
          [question.id, question.question, question.answer, question.category, question.difficulty]
        );
      }
      console.log(`Successfully seeded database with ${DEFAULT_TRIVIA_QUESTIONS.length} trivia questions`);
    }
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
    const db = Database.getInstance();
    
    for (const item of items) {
      await db.runAsync(
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
    const db = Database.getInstance();
    await db.runAsync('DELETE FROM items');
    console.log('All items cleared from database');
  } catch (error) {
    console.error('Failed to clear items:', error);
    throw error;
  }
}

/**
 * Add custom trivia questions to the database
 */
export async function addTriviaQuestions(
  questions: Array<{ id: string; question: string; answer: string; category?: string; difficulty?: string }>
): Promise<void> {
  try {
    const db = Database.getInstance();
    
    for (const question of questions) {
      await db.runAsync(
        'INSERT OR REPLACE INTO trivia_questions (id, question, answer, category, difficulty) VALUES (?, ?, ?, ?, ?)',
        [question.id, question.question, question.answer, question.category || '', question.difficulty || '']
      );
    }
    console.log(`Added ${questions.length} trivia questions to database`);
  } catch (error) {
    console.error('Failed to add trivia questions:', error);
    throw error;
  }
}

/**
 * Clear all trivia questions from the database
 */
export async function clearTriviaQuestions(): Promise<void> {
  try {
    const db = Database.getInstance();
    await db.runAsync('DELETE FROM trivia_questions');
    console.log('All trivia questions cleared from database');
  } catch (error) {
    console.error('Failed to clear trivia questions:', error);
    throw error;
  }
}
