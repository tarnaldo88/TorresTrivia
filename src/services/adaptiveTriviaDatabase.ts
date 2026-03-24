import { Database } from './database';
import { TriviaQuestion } from '../types/index';
import { AdaptiveDifficulty } from './adaptiveDifficulty';

/**
 * AdaptiveTriviaDatabase extends TriviaDatabase with adaptive difficulty features
 */
export class AdaptiveTriviaDatabase {
  private adaptiveDifficulty: AdaptiveDifficulty;
  private usedQuestionIds: Set<string> = new Set();
  private allQuestionIds: string[] = [];
  private currentSessionQuestions: TriviaQuestion[] = [];
  private currentQuestionIndex: number = 0;
  private sessionStartTime: number = 0;

  constructor(adaptiveDifficulty?: AdaptiveDifficulty) {
    this.adaptiveDifficulty = adaptiveDifficulty || new AdaptiveDifficulty();
  }

  /**
   * Initialize the Adaptive Trivia Database
   */
  async initialize(): Promise<void> {
    try {
      const db = Database.getInstance();
      const rows = await db.getAllAsync('SELECT id FROM trivia_questions ORDER BY id');
      this.allQuestionIds = rows.map((row: any) => row.id);

      console.log(`AdaptiveTriviaDatabase initialized with ${this.allQuestionIds.length} questions`);
    } catch (error) {
      console.error('Failed to initialize AdaptiveTriviaDatabase:', error);
      throw error;
    }
  }

  /**
   * Start a new adaptive session for a player
   */
  async startAdaptiveSession(
    playerId: string,
    category?: string,
    questionCount: number = 20
  ): Promise<void> {
    this.sessionStartTime = Date.now();
    this.currentQuestionIndex = 0;
    this.usedQuestionIds.clear();

    // Get all questions for the session
    const allQuestions = await this.getAllQuestions();
    
    // Use adaptive difficulty to select appropriate questions
    this.currentSessionQuestions = await this.adaptiveDifficulty.getAdaptiveQuestions(
      playerId,
      allQuestions,
      category,
      questionCount
    );

    console.log(`Started adaptive session for player ${playerId} with ${this.currentSessionQuestions.length} questions`);
  }

  /**
   * Get the next question in the adaptive session
   */
  async getNextAdaptiveQuestion(): Promise<TriviaQuestion | null> {
    if (this.currentQuestionIndex >= this.currentSessionQuestions.length) {
      return null; // Session completed
    }

    const question = this.currentSessionQuestions[this.currentQuestionIndex];
    this.currentQuestionIndex++;
    
    // Mark as used
    this.usedQuestionIds.add(question.id);
    
    return question;
  }

  /**
   * Record player answer and update adaptive difficulty
   */
  recordPlayerAnswer(
    playerId: string,
    questionId: string,
    isCorrect: boolean,
    responseTime: number
  ): void {
    // Find the question details
    const question = this.currentSessionQuestions.find(q => q.id === questionId);
    if (!question) {
      console.warn(`Question ${questionId} not found in current session`);
      return;
    }

    // Record in adaptive difficulty system
    this.adaptiveDifficulty.recordAnswer(playerId, question, isCorrect, responseTime);

    console.log(`Recorded answer for player ${playerId}: ${isCorrect ? 'Correct' : 'Incorrect'} (${responseTime}s)`);
  }

  /**
   * Get adaptive question recommendation for next question
   */
  getNextQuestionRecommendation(playerId: string, category?: string): {
    recommendedDifficulty: string;
    confidence: number;
    reason: string;
  } {
    const adjustment = this.adaptiveDifficulty.getRecommendedDifficulty(playerId, category);
    
    return {
      recommendedDifficulty: adjustment.recommendedDifficulty,
      confidence: adjustment.confidence,
      reason: adjustment.reason,
    };
  }

  /**
   * Get a random trivia question with adaptive difficulty consideration
   */
  async getAdaptiveRandomQuestion(playerId: string, category?: string): Promise<TriviaQuestion> {
    if (this.allQuestionIds.length === 0) {
      throw new Error('No trivia questions available in database');
    }

    // Get recommendation for difficulty
    const recommendation = this.getNextQuestionRecommendation(playerId, category);
    
    // Filter questions by category if specified
    let availableQuestions = this.allQuestionIds;
    if (category) {
      const db = Database.getInstance();
      const categoryRows = await db.getAllAsync(
        'SELECT id FROM trivia_questions WHERE category = ?',
        [category]
      );
      availableQuestions = categoryRows.map((row: any) => row.id);
    }

    // Filter out used questions
    const unusedQuestions = availableQuestions.filter(id => !this.usedQuestionIds.has(id));

    // If all questions have been used, reset the used set
    if (unusedQuestions.length === 0) {
      this.usedQuestionIds.clear();
      unusedQuestions.push(...availableQuestions);
    }

    // Get questions with their difficulties
    const db = Database.getInstance();
    const questionDetails = await db.getAllAsync(
      `SELECT id, question, answer, category, difficulty 
       FROM trivia_questions 
       WHERE id IN (${unusedQuestions.map(() => '?').join(',')})`,
      unusedQuestions
    );

    // Score questions based on difficulty recommendation
    const scoredQuestions = questionDetails.map((q: any) => {
      const difficultyMatch = this.calculateDifficultyMatch(q.difficulty, recommendation.recommendedDifficulty);
      const score = difficultyMatch * recommendation.confidence;
      return { question: q, score };
    });

    // Sort by score and select from top questions
    scoredQuestions.sort((a, b) => b.score - a.score);
    
    // Select from top 5 questions randomly to add variety
    const topQuestions = scoredQuestions.slice(0, Math.min(5, scoredQuestions.length));
    const selectedQuestion = topQuestions[Math.floor(Math.random() * topQuestions.length)];

    this.usedQuestionIds.add(selectedQuestion.question.id);
    
    return {
      id: selectedQuestion.question.id,
      question: selectedQuestion.question.question,
      answer: selectedQuestion.question.answer,
      category: selectedQuestion.question.category,
      difficulty: selectedQuestion.question.difficulty,
    };
  }

  /**
   * Get player performance statistics
   */
  getPlayerPerformanceStats(playerId: string) {
    return this.adaptiveDifficulty.getPlayerStats(playerId);
  }

  /**
   * Get current session progress
   */
  getSessionProgress(): {
    totalQuestions: number;
    completedQuestions: number;
    currentQuestionIndex: number;
    sessionDuration: number; // in seconds
    progressPercentage: number;
  } {
    const totalQuestions = this.currentSessionQuestions.length;
    const completedQuestions = this.currentQuestionIndex;
    const sessionDuration = (Date.now() - this.sessionStartTime) / 1000;
    const progressPercentage = totalQuestions > 0 ? (completedQuestions / totalQuestions) * 100 : 0;

    return {
      totalQuestions,
      completedQuestions,
      currentQuestionIndex: this.currentQuestionIndex,
      sessionDuration,
      progressPercentage,
    };
  }

  /**
   * Check if session is complete
   */
  isSessionComplete(): boolean {
    return this.currentQuestionIndex >= this.currentSessionQuestions.length;
  }

  /**
   * End current session and return summary
   */
  endSession(playerId: string): {
    totalQuestions: number;
    sessionDuration: number;
    averageResponseTime: number;
    successRate: number;
    difficultyProgression: string[];
  } {
    const stats = this.getPlayerPerformanceStats(playerId);
    const sessionProgress = this.getSessionProgress();
    
    const difficultyProgression = this.currentSessionQuestions
      .slice(0, this.currentQuestionIndex)
      .map(q => q.difficulty || 'Medium');

    return {
      totalQuestions: sessionProgress.totalQuestions,
      sessionDuration: sessionProgress.sessionDuration,
      averageResponseTime: stats.overall.averageResponseTime,
      successRate: stats.overall.successRate,
      difficultyProgression,
    };
  }

  /**
   * Reset the used questions set for a new round
   */
  resetRound(): void {
    this.usedQuestionIds.clear();
    this.currentQuestionIndex = 0;
    this.currentSessionQuestions = [];
  }

  /**
   * Get adaptive difficulty settings
   */
  getAdaptiveSettings() {
    return this.adaptiveDifficulty.getSettings();
  }

  /**
   * Update adaptive difficulty settings
   */
  updateAdaptiveSettings(settings: any): void {
    this.adaptiveDifficulty.updateSettings(settings);
  }

  /**
   * Get all trivia questions (from original database)
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
   * Get questions by category
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
   * Get a specific question by ID
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
   * Get the count of trivia questions
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
   * Calculate how well a question difficulty matches the recommendation
   */
  private calculateDifficultyMatch(questionDifficulty: string, recommendedDifficulty: string): number {
    const difficultyLevels = ['Easy', 'Medium', 'Hard', 'Expert'];
    const questionIndex = difficultyLevels.indexOf(questionDifficulty);
    const recommendedIndex = difficultyLevels.indexOf(recommendedDifficulty);
    
    if (questionIndex === -1 || recommendedIndex === -1) return 0.5; // Default score for unknown difficulties
    
    const distance = Math.abs(questionIndex - recommendedIndex);
    const maxDistance = difficultyLevels.length - 1;
    
    // Perfect match = 1.0, furthest match = 0.0
    return Math.max(0, 1 - (distance / maxDistance));
  }
}
