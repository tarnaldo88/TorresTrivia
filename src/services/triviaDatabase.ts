import { Database } from './database';
import { TriviaQuestion } from '../types/index';

/**
 * TriviaDatabase manages trivia question selection and deduplication within rounds
 */
export class TriviaDatabase {
  private usedQuestionIds: Set<string> = new Set();
  private allQuestionIds: string[] = [];

  /**
   * Initialize the TriviaDatabase by loading all available questions
   */
  async initialize(): Promise<void> {
    try {
      const db = Database.getInstance();
      const rows = await db.getAllAsync('SELECT id FROM trivia_questions ORDER BY id');
      this.allQuestionIds = rows.map((row: any) => row.id);

      console.log(`TriviaDatabase initialized with ${this.allQuestionIds.length} questions`);
    } catch (error) {
      console.error('Failed to initialize TriviaDatabase:', error);
      throw error;
    }
  }

  /**
   * Get a random trivia question from the collection, avoiding duplicates within the round
   * If all questions have been used, cycle back to the beginning
   */
  async getRandomQuestion(): Promise<TriviaQuestion> {
    if (this.allQuestionIds.length === 0) {
      throw new Error('No trivia questions available in database');
    }

    // If all questions have been used, reset the used set to cycle back
    if (this.usedQuestionIds.size >= this.allQuestionIds.length) {
      this.usedQuestionIds.clear();
    }

    // Get list of unused questions
    const unusedQuestions = this.allQuestionIds.filter((id) => !this.usedQuestionIds.has(id));

    // If no unused questions remain, cycle back
    if (unusedQuestions.length === 0) {
      this.usedQuestionIds.clear();
      unusedQuestions.push(...this.allQuestionIds);
    }

    // Select a random unused question
    const randomIndex = Math.floor(Math.random() * unusedQuestions.length);
    const questionId = unusedQuestions[randomIndex];

    const randomQuestion = await this.getQuestionById(questionId);
    this.usedQuestionIds.add(questionId);

    return randomQuestion;
  }

  /**
   * Get a specific question by ID.
   */
  async getQuestionById(id: string): Promise<TriviaQuestion> {
    try {
      const db = Database.getInstance();
      const row = await db.getFirstAsync(
        'SELECT id, question, answer, category, difficulty FROM trivia_questions WHERE id = ?',
        [id]
      );

      if (!row) {
        throw new Error(`Trivia question with id ${id} not found`);
      }

      return {
        id: (row as any).id,
        question: (row as any).question,
        answer: (row as any).answer,
        category: (row as any).category,
        difficulty: (row as any).difficulty,
      };
    } catch (error) {
      console.error(`Failed to get question by id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get all trivia questions from the collection
   */
  async getAllQuestions(): Promise<TriviaQuestion[]> {
    try {
      const db = Database.getInstance();
      const rows = await db.getAllAsync(
        'SELECT id, question, answer, category, difficulty FROM trivia_questions ORDER BY id'
      );

      return rows.map((row: any) => ({
        id: row.id,
        question: row.question,
        answer: row.answer,
        category: row.category,
        difficulty: row.difficulty,
      }));
    } catch (error) {
      console.error('Failed to get all trivia questions:', error);
      throw error;
    }
  }

  /**
   * Get trivia questions by category
   */
  async getQuestionsByCategory(category: string): Promise<TriviaQuestion[]> {
    try {
      const db = Database.getInstance();
      const rows = await db.getAllAsync(
        'SELECT id, question, answer, category, difficulty FROM trivia_questions WHERE category = ? ORDER BY id',
        [category]
      );

      return rows.map((row: any) => ({
        id: row.id,
        question: row.question,
        answer: row.answer,
        category: row.category,
        difficulty: row.difficulty,
      }));
    } catch (error) {
      console.error(`Failed to get questions by category ${category}:`, error);
      throw error;
    }
  }

  /**
   * Get the count of trivia questions in the collection
   */
  async getQuestionCount(): Promise<number> {
    try {
      const db = Database.getInstance();
      const result = await db.getFirstAsync('SELECT COUNT(*) as count FROM trivia_questions');
      return result ? (result as any).count : 0;
    } catch (error) {
      console.error('Failed to get question count:', error);
      throw error;
    }
  }

  /**
   * Reset the used questions set for a new round
   */
  resetRound(): void {
    this.usedQuestionIds.clear();
  }

  /**
   * Get the set of used question IDs in the current round
   */
  getUsedQuestionIds(): Set<string> {
    return new Set(this.usedQuestionIds);
  }

  /**
   * Add a new trivia question to the database
   */
  async addQuestion(
    difficulty: string,
    question: string,
    answer: string,
    category: string
  ): Promise<void> {
    try {
      // Validate inputs
      if (!difficulty || !question || !answer || !category) {
        throw new Error('All fields (difficulty, question, answer, category) are required');
      }

      const db = Database.getInstance();
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      await db.runAsync(
        'INSERT INTO trivia_questions (id, question, answer, category, difficulty) VALUES (?, ?, ?, ?, ?)',
        [id, question, answer, category, difficulty]
      );

      // Add the new question ID to the list
      this.allQuestionIds.push(id);

      console.log(`Question added successfully with id: ${id}`);
    } catch (error) {
      console.error('Failed to add trivia question:', error);
      throw error;
    }
  }
}
