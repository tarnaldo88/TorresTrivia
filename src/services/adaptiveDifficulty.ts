import { TriviaQuestion } from '../types/index';

/**
 * Player performance metrics for adaptive difficulty
 */
export interface PlayerPerformance {
  playerId: string;
  totalQuestions: number;
  correctAnswers: number;
  averageResponseTime: number; // in seconds
  currentStreak: number;
  bestStreak: number;
  categoryPerformance: Map<string, CategoryPerformance>;
  difficultyPerformance: Map<string, DifficultyPerformance>;
  recentPerformance: PerformanceEntry[]; // Last 20 answers
  sessionStartTime: number;
}

/**
 * Performance tracking for a specific category
 */
export interface CategoryPerformance {
  categoryId: string;
  totalQuestions: number;
  correctAnswers: number;
  averageResponseTime: number;
  lastUpdated: number;
}

/**
 * Performance tracking for difficulty levels
 */
export interface DifficultyPerformance {
  difficulty: string;
  totalQuestions: number;
  correctAnswers: number;
  averageResponseTime: number;
  lastUpdated: number;
}

/**
 * Individual performance entry
 */
export interface PerformanceEntry {
  questionId: string;
  category: string;
  difficulty: string;
  isCorrect: boolean;
  responseTime: number;
  timestamp: number;
}

/**
 * Adaptive difficulty settings
 */
export interface AdaptiveDifficultySettings {
  enabled: boolean;
  difficultySensitivity: number; // 0.1 - 1.0, how quickly difficulty changes
  minimumQuestionsBeforeAdjustment: number;
  targetSuccessRate: number; // 0.0 - 1.0, target success rate
  enableProgressiveDifficulty: boolean;
  progressiveRate: number; // How much difficulty increases per round
  categoryAdaptation: boolean; // Adapt difficulty per category
  timeBasedAdaptation: boolean; // Consider response time in difficulty
}

/**
 * Difficulty adjustment recommendation
 */
export interface DifficultyAdjustment {
  recommendedDifficulty: string;
  confidence: number; // 0.0 - 1.0
  reason: string;
  suggestedChanges: {
    increaseDifficulty: boolean;
    adjustmentMagnitude: number; // 0.0 - 1.0
  };
}

/**
 * AdaptiveDifficulty manages dynamic difficulty adjustment based on player performance
 */
export class AdaptiveDifficulty {
  private performance: Map<string, PlayerPerformance> = new Map();
  private settings: AdaptiveDifficultySettings;
  private difficultyLevels = ['Easy', 'Medium', 'Hard', 'Expert'];
  private categoryWeights: Map<string, number> = new Map();

  constructor(settings?: Partial<AdaptiveDifficultySettings>) {
    this.settings = {
      enabled: true,
      difficultySensitivity: 0.5,
      minimumQuestionsBeforeAdjustment: 5,
      targetSuccessRate: 0.7,
      enableProgressiveDifficulty: true,
      progressiveRate: 0.1,
      categoryAdaptation: true,
      timeBasedAdaptation: true,
      ...settings,
    };

    // Initialize category weights (can be customized)
    this.initializeCategoryWeights();
  }

  /**
   * Initialize or get player performance tracking
   */
  getPlayerPerformance(playerId: string): PlayerPerformance {
    if (!this.performance.has(playerId)) {
      this.performance.set(playerId, {
        playerId,
        totalQuestions: 0,
        correctAnswers: 0,
        averageResponseTime: 0,
        currentStreak: 0,
        bestStreak: 0,
        categoryPerformance: new Map(),
        difficultyPerformance: new Map(),
        recentPerformance: [],
        sessionStartTime: Date.now(),
      });
    }
    return this.performance.get(playerId)!;
  }

  /**
   * Record player answer and update performance metrics
   */
  recordAnswer(
    playerId: string,
    question: TriviaQuestion,
    isCorrect: boolean,
    responseTime: number
  ): void {
    const performance = this.getPlayerPerformance(playerId);
    
    // Update overall metrics
    performance.totalQuestions++;
    if (isCorrect) {
      performance.correctAnswers++;
      performance.currentStreak++;
      performance.bestStreak = Math.max(performance.bestStreak, performance.currentStreak);
    } else {
      performance.currentStreak = 0;
    }

    // Update average response time
    const totalResponseTime = performance.averageResponseTime * (performance.totalQuestions - 1) + responseTime;
    performance.averageResponseTime = totalResponseTime / performance.totalQuestions;

    // Update category performance
    this.updateCategoryPerformance(performance, question.category || 'General', isCorrect, responseTime);

    // Update difficulty performance
    this.updateDifficultyPerformance(performance, question.difficulty || 'Medium', isCorrect, responseTime);

    // Add to recent performance
    const entry: PerformanceEntry = {
      questionId: question.id,
      category: question.category || 'General',
      difficulty: question.difficulty || 'Medium',
      isCorrect,
      responseTime,
      timestamp: Date.now(),
    };

    performance.recentPerformance.push(entry);
    
    // Keep only last 20 entries
    if (performance.recentPerformance.length > 20) {
      performance.recentPerformance.shift();
    }
  }

  /**
   * Get recommended difficulty for next question
   */
  getRecommendedDifficulty(playerId: string, category?: string): DifficultyAdjustment {
    const performance = this.getPlayerPerformance(playerId);
    
    if (!this.settings.enabled || performance.totalQuestions < this.settings.minimumQuestionsBeforeAdjustment) {
      return {
        recommendedDifficulty: 'Medium',
        confidence: 0.5,
        reason: 'Insufficient data for adaptive difficulty',
        suggestedChanges: {
          increaseDifficulty: false,
          adjustmentMagnitude: 0,
        },
      };
    }

    const currentSuccessRate = performance.correctAnswers / performance.totalQuestions;
    const recentSuccessRate = this.calculateRecentSuccessRate(performance);
    const targetRate = this.settings.targetSuccessRate;

    // Weight recent performance more heavily
    const weightedSuccessRate = (currentSuccessRate * 0.3) + (recentSuccessRate * 0.7);

    // Get category-specific performance if category adaptation is enabled
    let categoryMultiplier = 1.0;
    if (this.settings.categoryAdaptation && category) {
      const categoryPerf = performance.categoryPerformance.get(category);
      if (categoryPerf && categoryPerf.totalQuestions >= 3) {
        const categorySuccessRate = categoryPerf.correctAnswers / categoryPerf.totalQuestions;
        categoryMultiplier = categorySuccessRate / targetRate;
      }
    }

    // Calculate difficulty adjustment
    const deviation = weightedSuccessRate - targetRate;
    const adjustment = deviation * this.settings.difficultySensitivity * categoryMultiplier;
    
    // Apply progressive difficulty if enabled
    let progressiveBonus = 0;
    if (this.settings.enableProgressiveDifficulty) {
      const sessionDuration = (Date.now() - performance.sessionStartTime) / 60000; // minutes
      progressiveBonus = sessionDuration * this.settings.progressiveRate;
    }

    // Determine recommended difficulty
    const currentDifficultyIndex = this.getCurrentDifficultyIndex(performance);
    let recommendedIndex = Math.round(currentDifficultyIndex + adjustment + progressiveBonus);
    recommendedIndex = Math.max(0, Math.min(this.difficultyLevels.length - 1, recommendedIndex));

    const recommendedDifficulty = this.difficultyLevels[recommendedIndex];
    const confidence = Math.min(1.0, performance.totalQuestions / 20); // Increase confidence with more data

    return {
      recommendedDifficulty,
      confidence,
      reason: this.generateAdjustmentReason(deviation, categoryMultiplier, progressiveBonus),
      suggestedChanges: {
        increaseDifficulty: adjustment > 0,
        adjustmentMagnitude: Math.abs(adjustment),
      },
    };
  }

  /**
   * Get questions filtered and sorted by adaptive difficulty
   */
  async getAdaptiveQuestions(
    playerId: string,
    allQuestions: TriviaQuestion[],
    category?: string,
    count: number = 10
  ): Promise<TriviaQuestion[]> {
    const adjustment = this.getRecommendedDifficulty(playerId, category);
    
    // Filter questions by category if specified
    let filteredQuestions = category 
      ? allQuestions.filter(q => q.category === category)
      : allQuestions;

    // Sort by difficulty preference
    const targetDifficulty = adjustment.recommendedDifficulty;
    const difficultyScores = new Map<string, number>();
    
    filteredQuestions.forEach(question => {
      const questionDifficulty = question.difficulty || 'Medium';
      const difficultyIndex = this.difficultyLevels.indexOf(questionDifficulty);
      const targetIndex = this.difficultyLevels.indexOf(targetDifficulty);
      
      // Calculate score based on distance from target difficulty
      const distance = Math.abs(difficultyIndex - targetIndex);
      const score = Math.max(0, 1 - (distance / this.difficultyLevels.length));
      
      // Apply confidence factor
      difficultyScores.set(question.id, score * adjustment.confidence);
    });

    // Sort by score and return top questions
    filteredQuestions.sort((a, b) => {
      const scoreA = difficultyScores.get(a.id) || 0;
      const scoreB = difficultyScores.get(b.id) || 0;
      return scoreB - scoreA;
    });

    return filteredQuestions.slice(0, count);
  }

  /**
   * Get player statistics
   */
  getPlayerStats(playerId: string): {
    overall: any;
    byCategory: any;
    byDifficulty: any;
    trends: any;
  } {
    const performance = this.getPlayerPerformance(playerId);
    
    return {
      overall: {
        totalQuestions: performance.totalQuestions,
        correctAnswers: performance.correctAnswers,
        successRate: performance.totalQuestions > 0 ? performance.correctAnswers / performance.totalQuestions : 0,
        averageResponseTime: performance.averageResponseTime,
        currentStreak: performance.currentStreak,
        bestStreak: performance.bestStreak,
        sessionDuration: (Date.now() - performance.sessionStartTime) / 60000, // minutes
      },
      byCategory: Object.fromEntries(performance.categoryPerformance),
      byDifficulty: Object.fromEntries(performance.difficultyPerformance),
      trends: {
        recentPerformance: performance.recentPerformance.slice(-10),
        improving: this.isPerformanceImproving(performance),
      },
    };
  }

  /**
   * Reset player performance data
   */
  resetPlayerPerformance(playerId: string): void {
    this.performance.delete(playerId);
  }

  /**
   * Update adaptive difficulty settings
   */
  updateSettings(newSettings: Partial<AdaptiveDifficultySettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  /**
   * Get current settings
   */
  getSettings(): AdaptiveDifficultySettings {
    return { ...this.settings };
  }

  // Private helper methods

  private initializeCategoryWeights(): void {
    // Default weights for categories (can be customized)
    this.categoryWeights.set('Science', 1.0);
    this.categoryWeights.set('History', 1.0);
    this.categoryWeights.set('Geography', 1.0);
    this.categoryWeights.set('Literature', 1.0);
    this.categoryWeights.set('Sports', 1.0);
    this.categoryWeights.set('General', 1.0);
  }

  private updateCategoryPerformance(
    performance: PlayerPerformance,
    category: string,
    isCorrect: boolean,
    responseTime: number
  ): void {
    if (!performance.categoryPerformance.has(category)) {
      performance.categoryPerformance.set(category, {
        categoryId: category,
        totalQuestions: 0,
        correctAnswers: 0,
        averageResponseTime: 0,
        lastUpdated: Date.now(),
      });
    }

    const categoryPerf = performance.categoryPerformance.get(category)!;
    categoryPerf.totalQuestions++;
    
    if (isCorrect) {
      categoryPerf.correctAnswers++;
    }

    const totalResponseTime = categoryPerf.averageResponseTime * (categoryPerf.totalQuestions - 1) + responseTime;
    categoryPerf.averageResponseTime = totalResponseTime / categoryPerf.totalQuestions;
    categoryPerf.lastUpdated = Date.now();
  }

  private updateDifficultyPerformance(
    performance: PlayerPerformance,
    difficulty: string,
    isCorrect: boolean,
    responseTime: number
  ): void {
    if (!performance.difficultyPerformance.has(difficulty)) {
      performance.difficultyPerformance.set(difficulty, {
        difficulty,
        totalQuestions: 0,
        correctAnswers: 0,
        averageResponseTime: 0,
        lastUpdated: Date.now(),
      });
    }

    const difficultyPerf = performance.difficultyPerformance.get(difficulty)!;
    difficultyPerf.totalQuestions++;
    
    if (isCorrect) {
      difficultyPerf.correctAnswers++;
    }

    const totalResponseTime = difficultyPerf.averageResponseTime * (difficultyPerf.totalQuestions - 1) + responseTime;
    difficultyPerf.averageResponseTime = totalResponseTime / difficultyPerf.totalQuestions;
    difficultyPerf.lastUpdated = Date.now();
  }

  private calculateRecentSuccessRate(performance: PlayerPerformance): number {
    if (performance.recentPerformance.length === 0) return 0;
    
    const correctCount = performance.recentPerformance.filter(entry => entry.isCorrect).length;
    return correctCount / performance.recentPerformance.length;
  }

  private getCurrentDifficultyIndex(performance: PlayerPerformance): number {
    // Calculate current difficulty based on recent performance
    const recentEntries = performance.recentPerformance.slice(-5);
    if (recentEntries.length === 0) return 1; // Default to Medium

    const difficulties = recentEntries.map(entry => entry.difficulty);
    const avgDifficultyIndex = difficulties.reduce((sum, diff) => {
      const index = this.difficultyLevels.indexOf(diff);
      return sum + (index >= 0 ? index : 1);
    }, 0) / difficulties.length;

    return avgDifficultyIndex;
  }

  private generateAdjustmentReason(deviation: number, categoryMultiplier: number, progressiveBonus: number): string {
    const reasons: string[] = [];
    
    if (Math.abs(deviation) > 0.1) {
      if (deviation > 0) {
        reasons.push('Performing above target success rate');
      } else {
        reasons.push('Performing below target success rate');
      }
    }

    if (Math.abs(categoryMultiplier - 1.0) > 0.1) {
      if (categoryMultiplier > 1.0) {
        reasons.push('Strong performance in this category');
      } else {
        reasons.push('Challenges in this category');
      }
    }

    if (progressiveBonus > 0.05) {
      reasons.push('Progressive difficulty increase');
    }

    return reasons.length > 0 ? reasons.join(', ') : 'Maintaining current difficulty';
  }

  private isPerformanceImproving(performance: PlayerPerformance): boolean {
    if (performance.recentPerformance.length < 10) return false;
    
    const recent = performance.recentPerformance.slice(-5);
    const previous = performance.recentPerformance.slice(-10, -5);
    
    const recentSuccessRate = recent.filter(e => e.isCorrect).length / recent.length;
    const previousSuccessRate = previous.filter(e => e.isCorrect).length / previous.length;
    
    return recentSuccessRate > previousSuccessRate;
  }
}
