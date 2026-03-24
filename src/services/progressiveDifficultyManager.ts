import { AdaptiveDifficulty, PlayerPerformance } from './adaptiveDifficulty';
import { TriviaQuestion } from '../types/index';

/**
 * Round configuration for progressive difficulty
 */
export interface RoundConfiguration {
  roundNumber: number;
  questionCount: number;
  timeLimit: number; // in seconds
  targetDifficulty: string;
  difficultyMultiplier: number; // How much harder than baseline
  specialRules: RoundSpecialRule[];
  pointMultiplier: number;
}

/**
 * Special rules that can be applied to rounds
 */
export interface RoundSpecialRule {
  type: 'TIME_BONUS' | 'STREAK_BONUS' | 'CATEGORY_CHALLENGE' | 'DIFFICULTY_SPIKE' | 'SPEED_ROUND';
  description: string;
  value: number; // Multiplier or bonus amount
  enabled: boolean;
}

/**
 * Progressive difficulty curve configuration
 */
export interface ProgressiveDifficultyCurve {
  curveType: 'LINEAR' | 'EXPONENTIAL' | 'LOGARITHMIC' | 'STEP_FUNCTION' | 'CUSTOM';
  baseDifficulty: string;
  maxDifficulty: string;
  roundsToMax: number;
  customCurve?: number[]; // For custom curve type
  adaptiveAdjustment: boolean; // Whether to adjust based on performance
}

/**
 * Session progression tracking
 */
export interface SessionProgression {
  sessionId: string;
  playerId: string;
  startTime: number;
  currentRound: number;
  totalRounds: number;
  roundsCompleted: RoundConfiguration[];
  overallScore: number;
  averageDifficulty: number;
  performanceTrend: 'IMPROVING' | 'DECLINING' | 'STABLE';
  nextRoundRecommendation: RoundConfiguration;
}

/**
 * ProgressiveDifficultyManager handles difficulty progression across multiple rounds
 */
export class ProgressiveDifficultyManager {
  private adaptiveDifficulty: AdaptiveDifficulty;
  private currentCurve: ProgressiveDifficultyCurve;
  private activeSessions: Map<string, SessionProgression> = new Map();
  private difficultyLevels = ['Easy', 'Medium', 'Hard', 'Expert'];
  private difficultyValues = { Easy: 1, Medium: 2, Hard: 3, Expert: 4 };

  constructor(
    adaptiveDifficulty: AdaptiveDifficulty,
    curve?: Partial<ProgressiveDifficultyCurve>
  ) {
    this.adaptiveDifficulty = adaptiveDifficulty;
    this.currentCurve = {
      curveType: 'LINEAR',
      baseDifficulty: 'Easy',
      maxDifficulty: 'Expert',
      roundsToMax: 10,
      adaptiveAdjustment: true,
      ...curve,
    };
  }

  /**
   * Start a new progressive session
   */
  startProgressiveSession(
    playerId: string,
    totalRounds: number = 5,
    questionsPerRound: number = 10
  ): SessionProgression {
    const sessionId = `${playerId}-${Date.now()}`;
    const firstRound = this.generateRoundConfiguration(1, totalRounds, questionsPerRound);

    const session: SessionProgression = {
      sessionId,
      playerId,
      startTime: Date.now(),
      currentRound: 1,
      totalRounds,
      roundsCompleted: [],
      overallScore: 0,
      averageDifficulty: (this.difficultyValues[firstRound.targetDifficulty as keyof typeof this.difficultyValues] || 2),
      performanceTrend: 'STABLE',
      nextRoundRecommendation: firstRound,
    };

    this.activeSessions.set(sessionId, session);
    console.log(`Started progressive session ${sessionId} for player ${playerId}`);
    
    return session;
  }

  /**
   * Generate round configuration based on progression
   */
  generateRoundConfiguration(
    roundNumber: number,
    totalRounds: number,
    questionsPerRound: number
  ): RoundConfiguration {
    // Calculate difficulty based on curve type
    const targetDifficulty = this.calculateDifficultyForRound(roundNumber, totalRounds);
    const difficultyMultiplier = this.calculateDifficultyMultiplier(roundNumber, totalRounds);
    
    // Generate special rules based on round
    const specialRules = this.generateSpecialRules(roundNumber, totalRounds);
    
    // Calculate point multiplier
    const pointMultiplier = 1 + (difficultyMultiplier - 1) * 0.5;

    return {
      roundNumber,
      questionCount: questionsPerRound,
      timeLimit: this.calculateTimeLimit(roundNumber, targetDifficulty),
      targetDifficulty,
      difficultyMultiplier,
      specialRules,
      pointMultiplier,
    };
  }

  /**
   * Complete a round and update progression
   */
  completeRound(
    sessionId: string,
    roundScore: number,
    questionsAnswered: number,
    averageResponseTime: number
  ): SessionProgression {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Update session stats
    session.roundsCompleted.push(session.nextRoundRecommendation);
    session.overallScore += roundScore;
    session.currentRound++;

    // Calculate performance trend
    this.updatePerformanceTrend(session, roundScore, questionsAnswered);

    // Check if session is complete
    if (session.currentRound > session.totalRounds) {
      console.log(`Session ${sessionId} completed! Final score: ${session.overallScore}`);
      return session;
    }

    // Generate next round with adaptive adjustments
    session.nextRoundRecommendation = this.generateNextRound(session);
    
    return session;
  }

  /**
   * Get adaptive questions for current round
   */
  async getRoundQuestions(
    sessionId: string,
    allQuestions: TriviaQuestion[],
    category?: string
  ): Promise<TriviaQuestion[]> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const roundConfig = session.nextRoundRecommendation;
    
    // Use adaptive difficulty to get appropriate questions
    const adaptiveQuestions = await this.adaptiveDifficulty.getAdaptiveQuestions(
      session.playerId,
      allQuestions,
      category,
      roundConfig.questionCount
    );

    // Apply round-specific modifications
    return this.applyRoundModifications(adaptiveQuestions, roundConfig);
  }

  /**
   * Get session progression status
   */
  getSessionProgression(sessionId: string): SessionProgression | null {
    return this.activeSessions.get(sessionId) || null;
  }

  /**
   * Get player's progression history
   */
  getPlayerProgressionHistory(playerId: string): SessionProgression[] {
    const sessions = Array.from(this.activeSessions.values())
      .filter(session => session.playerId === playerId)
      .sort((a, b) => b.startTime - a.startTime);
    
    return sessions;
  }

  /**
   * Update progression curve
   */
  updateProgressionCurve(newCurve: Partial<ProgressiveDifficultyCurve>): void {
    this.currentCurve = { ...this.currentCurve, ...newCurve };
  }

  /**
   * Get current progression curve
   */
  getProgressionCurve(): ProgressiveDifficultyCurve {
    return { ...this.currentCurve };
  }

  /**
   * End session and return summary
   */
  endSession(sessionId: string): {
    sessionSummary: SessionProgression;
    performanceAnalysis: any;
    recommendations: string[];
  } {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const performanceAnalysis = this.analyzeSessionPerformance(session);
    const recommendations = this.generateRecommendations(session);

    this.activeSessions.delete(sessionId);

    return {
      sessionSummary: session,
      performanceAnalysis,
      recommendations,
    };
  }

  // Private helper methods

  private calculateDifficultyForRound(roundNumber: number, totalRounds: number): string {
    const progress = (roundNumber - 1) / (totalRounds - 1);
    const baseIndex = this.difficultyLevels.indexOf(this.currentCurve.baseDifficulty);
    const maxIndex = this.difficultyLevels.indexOf(this.currentCurve.maxDifficulty);
    
    let difficultyValue: number;

    switch (this.currentCurve.curveType) {
      case 'LINEAR':
        difficultyValue = baseIndex + (maxIndex - baseIndex) * progress;
        break;
      
      case 'EXPONENTIAL':
        difficultyValue = baseIndex + (maxIndex - baseIndex) * Math.pow(progress, 2);
        break;
      
      case 'LOGARITHMIC':
        difficultyValue = baseIndex + (maxIndex - baseIndex) * Math.log(1 + progress) / Math.log(2);
        break;
      
      case 'STEP_FUNCTION':
        const stepSize = (maxIndex - baseIndex) / this.currentCurve.roundsToMax;
        difficultyValue = baseIndex + Math.floor(progress * this.currentCurve.roundsToMax) * stepSize;
        break;
      
      case 'CUSTOM':
        if (this.currentCurve.customCurve) {
          const curveIndex = Math.floor(progress * (this.currentCurve.customCurve.length - 1));
          const curveValue = this.currentCurve.customCurve[curveIndex];
          difficultyValue = baseIndex + (maxIndex - baseIndex) * curveValue;
        } else {
          difficultyValue = baseIndex + (maxIndex - baseIndex) * progress;
        }
        break;
      
      default:
        difficultyValue = baseIndex + (maxIndex - baseIndex) * progress;
    }

    const roundedIndex = Math.round(difficultyValue);
    const clampedIndex = Math.max(0, Math.min(this.difficultyLevels.length - 1, roundedIndex));
    
    return this.difficultyLevels[clampedIndex];
  }

  private calculateDifficultyMultiplier(roundNumber: number, totalRounds: number): number {
    const progress = (roundNumber - 1) / (totalRounds - 1);
    return 1 + progress * 2; // 1x to 3x multiplier
  }

  private calculateTimeLimit(roundNumber: number, targetDifficulty: string): number {
    const baseTime = 60; // 60 seconds base
    const difficultyPenalty = (this.difficultyValues[targetDifficulty as keyof typeof this.difficultyValues] || 2) * 5; // 5s per difficulty level
    const roundBonus = (roundNumber - 1) * 2; // 2s bonus per round
    
    return Math.max(30, baseTime + roundBonus - difficultyPenalty); // Minimum 30 seconds
  }

  private generateSpecialRules(roundNumber: number, totalRounds: number): RoundSpecialRule[] {
    const rules: RoundSpecialRule[] = [];
    
    // Time bonus for early rounds
    if (roundNumber <= 2) {
      rules.push({
        type: 'TIME_BONUS',
        description: '+15 seconds time bonus',
        value: 15,
        enabled: true,
      });
    }
    
    // Streak bonus for middle rounds
    if (roundNumber >= 3 && roundNumber <= totalRounds - 2) {
      rules.push({
        type: 'STREAK_BONUS',
        description: '2x points for 3+ correct streak',
        value: 2,
        enabled: true,
      });
    }
    
    // Category challenge for later rounds
    if (roundNumber >= totalRounds - 2) {
      rules.push({
        type: 'CATEGORY_CHALLENGE',
        description: 'Focus on weakest category',
        value: 1.5,
        enabled: true,
      });
    }
    
    // Speed round for final round
    if (roundNumber === totalRounds) {
      rules.push({
        type: 'SPEED_ROUND',
        description: 'Fast answers worth extra points',
        value: 1.2,
        enabled: true,
      });
    }
    
    return rules;
  }

  private applyRoundModifications(
    questions: TriviaQuestion[],
    roundConfig: RoundConfiguration
  ): TriviaQuestion[] {
    // Apply category challenge rule
    const categoryChallenge = roundConfig.specialRules.find(rule => rule.type === 'CATEGORY_CHALLENGE');
    if (categoryChallenge && categoryChallenge.enabled) {
      // This would integrate with adaptive difficulty to focus on weak categories
      // For now, return questions as-is
    }
    
    return questions;
  }

  private updatePerformanceTrend(
    session: SessionProgression,
    roundScore: number,
    questionsAnswered: number
  ): void {
    const performance = this.adaptiveDifficulty.getPlayerPerformance(session.playerId);
    const recentPerformance = performance.recentPerformance.slice(-10);
    
    if (recentPerformance.length >= 5) {
      const recent = recentPerformance.slice(-5);
      const previous = recentPerformance.slice(-10, -5);
      
      const recentSuccessRate = recent.filter(e => e.isCorrect).length / recent.length;
      const previousSuccessRate = previous.filter(e => e.isCorrect).length / previous.length;
      
      if (recentSuccessRate > previousSuccessRate + 0.1) {
        session.performanceTrend = 'IMPROVING';
      } else if (recentSuccessRate < previousSuccessRate - 0.1) {
        session.performanceTrend = 'DECLINING';
      } else {
        session.performanceTrend = 'STABLE';
      }
    }
  }

  private generateNextRound(session: SessionProgression): RoundConfiguration {
    const baseRound = this.generateRoundConfiguration(
      session.currentRound,
      session.totalRounds,
      session.nextRoundRecommendation.questionCount
    );

    // Apply adaptive adjustments if enabled
    if (this.currentCurve.adaptiveAdjustment) {
      const performance = this.adaptiveDifficulty.getPlayerPerformance(session.playerId);
      const successRate = performance.correctAnswers / Math.max(1, performance.totalQuestions);
      
      // Adjust difficulty based on performance
      if (successRate > 0.8) {
        // Increase difficulty
        const currentIndex = this.difficultyLevels.indexOf(baseRound.targetDifficulty);
        if (currentIndex < this.difficultyLevels.length - 1) {
          baseRound.targetDifficulty = this.difficultyLevels[currentIndex + 1];
        }
      } else if (successRate < 0.4) {
        // Decrease difficulty
        const currentIndex = this.difficultyLevels.indexOf(baseRound.targetDifficulty);
        if (currentIndex > 0) {
          baseRound.targetDifficulty = this.difficultyLevels[currentIndex - 1];
        }
      }
    }

    return baseRound;
  }

  private analyzeSessionPerformance(session: SessionProgression): any {
    const performance = this.adaptiveDifficulty.getPlayerPerformance(session.playerId);
    const sessionDuration = (Date.now() - session.startTime) / 60000; // minutes
    
    return {
      sessionDuration,
      averageScorePerRound: session.overallScore / Math.max(1, session.roundsCompleted.length),
      difficultyProgression: session.roundsCompleted.map(r => r.targetDifficulty),
      specialRulesUsed: session.roundsCompleted.flatMap(r => r.specialRules.filter(sr => sr.enabled)),
      performanceTrend: session.performanceTrend,
      overallSuccessRate: performance.correctAnswers / Math.max(1, performance.totalQuestions),
    };
  }

  private generateRecommendations(session: SessionProgression): string[] {
    const recommendations: string[] = [];
    const performance = this.adaptiveDifficulty.getPlayerPerformance(session.playerId);
    const successRate = performance.correctAnswers / Math.max(1, performance.totalQuestions);
    
    if (successRate > 0.8) {
      recommendations.push('Consider increasing difficulty for more challenge');
    } else if (successRate < 0.4) {
      recommendations.push('Try easier questions to build confidence');
    }
    
    if (performance.averageResponseTime > 10) {
      recommendations.push('Work on improving response speed');
    }
    
    if (session.performanceTrend === 'IMPROVING') {
      recommendations.push('Great progress! Keep up the momentum');
    } else if (session.performanceTrend === 'DECLINING') {
      recommendations.push('Take a break and come back refreshed');
    }
    
    // Find weak categories
    const categoryPerformance = Array.from(performance.categoryPerformance.entries())
      .filter(([_, perf]) => perf.totalQuestions >= 3)
      .sort((a, b) => {
        const aRate = a[1].correctAnswers / a[1].totalQuestions;
        const bRate = b[1].correctAnswers / b[1].totalQuestions;
        return aRate - bRate;
      });
    
    if (categoryPerformance.length > 0) {
      const weakestCategory = categoryPerformance[0][0];
      recommendations.push(`Focus on ${weakestCategory} category for improvement`);
    }
    
    return recommendations;
  }
}
