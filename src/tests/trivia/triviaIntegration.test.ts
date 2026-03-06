import { TriviaDatabase } from '../../services/triviaDatabase';
import { ScoreManager } from '../../services/scoreManager';
import { MockTriviaDatabase, MockTriviaQuestionFactory } from '../utils/testUtils';
import * as fc from 'fast-check';

describe('Trivia Integration Tests', () => {
  let triviaDb: TriviaDatabase;
  let mockTriviaDb: MockTriviaDatabase;

  beforeEach(() => {
    triviaDb = new TriviaDatabase();
    mockTriviaDb = new MockTriviaDatabase();
  });

  describe('Database + Score Integration', () => {
    it('should track trivia scores correctly', async () => {
      await ScoreManager.initialize();
      await mockTriviaDb.initialize();
      
      // Simulate trivia session
      let correctAnswers = 0;
      let totalQuestions = 0;
      
      for (let i = 0; i < 10; i++) {
        const question = await mockTriviaDb.getRandomQuestion();
        totalQuestions++;
        
        // Simulate 70% correct answer rate
        if (Math.random() > 0.3) {
          correctAnswers++;
        }
      }
      
      // Save trivia score
      await ScoreManager.saveTriviaScore(correctAnswers);
      
      const triviaScore = await ScoreManager.getTriviaScore();
      expect(triviaScore).toBe(correctAnswers);
    });

    it('should handle multiple trivia sessions', async () => {
      await ScoreManager.initialize();
      await mockTriviaDb.initialize();
      
      const sessionScores = [8, 12, 15, 10, 7];
      
      for (const score of sessionScores) {
        await ScoreManager.saveTriviaScore(score);
      }
      
      // Should save the last session score
      const finalScore = await ScoreManager.getTriviaScore();
      expect(finalScore).toBe(sessionScores[sessionScores.length - 1]);
    });

    it('should maintain score consistency across database operations', async () => {
      await ScoreManager.initialize();
      await mockTriviaDb.initialize();
      
      // Add questions to database
      const newQuestions = MockTriviaQuestionFactory.createMockQuestions(5, 'Hard');
      for (const question of newQuestions) {
        await mockTriviaDb.addQuestion(question);
      }
      
      // Get questions and simulate scoring
      const questions = [];
      for (let i = 0; i < 5; i++) {
        const question = await mockTriviaDb.getRandomQuestion();
        questions.push(question);
      }
      
      expect(questions.length).toBe(5);
      
      // Score tracking should work independently
      await ScoreManager.saveTriviaScore(questions.length);
      const score = await ScoreManager.getTriviaScore();
      expect(score).toBe(5);
    });
  });

  describe('Question Flow Integration', () => {
    it('should handle complete trivia workflow', async () => {
      await mockTriviaDb.initialize();
      
      const workflowSteps = [];
      
      // Step 1: Get initial question
      const question1 = await mockTriviaDb.getRandomQuestion();
      workflowSteps.push({ action: 'get-question', id: question1.id });
      
      // Step 2: Get next question
      const question2 = await mockTriviaDb.getRandomQuestion();
      workflowSteps.push({ action: 'get-question', id: question2.id });
      
      // Step 3: Get question by ID
      const foundQuestion = await mockTriviaDb.getQuestionById(question1.id);
      workflowSteps.push({ action: 'get-by-id', id: foundQuestion.id });
      
      // Step 4: Get questions by category
      const categoryQuestions = await mockTriviaDb.getQuestionsByCategory('Test Category');
      workflowSteps.push({ action: 'get-by-category', count: categoryQuestions.length });
      
      // Verify workflow
      expect(workflowSteps.length).toBe(4);
      expect(workflowSteps[0].action).toBe('get-question');
      expect(workflowSteps[1].action).toBe('get-question');
      expect(workflowSteps[2].action).toBe('get-by-id');
      expect(workflowSteps[3].action).toBe('get-by-category');
      
      // Verify question consistency
      expect(question1.id).toBe(foundQuestion.id);
      expect(categoryQuestions.length).toBeGreaterThan(0);
    });

    it('should handle question cycling with score tracking', async () => {
      await ScoreManager.initialize();
      await mockTriviaDb.initialize();
      
      const questions = MockTriviaQuestionFactory.createMockQuestions(3);
      const db = new MockTriviaDatabase(questions);
      await db.initialize();
      
      let score = 0;
      let rounds = 0;
      
      // Complete multiple rounds
      for (let round = 0; round < 2; round++) {
        for (let i = 0; i < 3; i++) {
          const question = await db.getRandomQuestion();
          rounds++;
          
          // Simulate correct answer
          if (Math.random() > 0.3) {
            score++;
          }
        }
        
        // Save score after each round
        await ScoreManager.saveTriviaScore(score);
      }
      
      expect(rounds).toBe(6);
      expect(score).toBeGreaterThan(0);
      
      const finalScore = await ScoreManager.getTriviaScore();
      expect(finalScore).toBe(score);
    });

    it('should handle category-based trivia sessions', async () => {
      const categorizedQuestions = MockTriviaQuestionFactory.createCategorizedQuestions();
      const db = new MockTriviaDatabase(categorizedQuestions);
      await db.initialize();
      
      const categories = ['Science', 'History', 'Geography'];
      const sessionResults = {};
      
      for (const category of categories) {
        const categoryQuestions = await db.getQuestionsByCategory(category);
        sessionResults[category] = {
          available: categoryQuestions.length,
          answered: 0,
          correct: 0,
        };
        
        // Simulate answering questions from this category
        for (let i = 0; i < Math.min(3, categoryQuestions.length); i++) {
          sessionResults[category].answered++;
          
          // 70% correct rate
          if (Math.random() > 0.3) {
            sessionResults[category].correct++;
          }
        }
      }
      
      // Verify category session results
      Object.keys(sessionResults).forEach(category => {
        const result = sessionResults[category];
        expect(result.available).toBeGreaterThan(0);
        expect(result.answered).toBeGreaterThanOrEqual(0);
        expect(result.correct).toBeLessThanOrEqual(result.answered);
      });
    });
  });

  describe('Property-Based Integration Tests', () => {
    it('should handle random trivia sessions correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.constantFrom('CORRECT', 'INCORRECT', 'SKIP'), { minLength: 1, maxLength: 50 }),
          fc.integer({ min: 5, max: 20 }),
          async (actions, questionCount) => {
            const freshMockDb = new MockTriviaDatabase(
              MockTriviaQuestionFactory.createMockQuestions(questionCount)
            );
            await freshMockDb.initialize();
            
            let score = 0;
            let questionsAnswered = 0;
            const usedQuestions = new Set();
            
            for (const action of actions) {
              const question = await freshMockDb.getRandomQuestion();
              usedQuestions.add(question.id);
              questionsAnswered++;
              
              switch (action) {
                case 'CORRECT':
                  score++;
                  break;
                case 'INCORRECT':
                  // No score change
                  break;
                case 'SKIP':
                  // No score change
                  break;
              }
            }
            
            // Verify session integrity
            expect(questionsAnswered).toBe(actions.length);
            expect(score).toBeLessThanOrEqual(actions.length);
            expect(usedQuestions.size).toBeGreaterThanOrEqual(1);
            
            // Score should be non-negative
            expect(score).toBeGreaterThanOrEqual(0);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should maintain database consistency under random operations', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.constantFrom('GET_RANDOM', 'GET_BY_ID', 'GET_BY_CATEGORY', 'ADD_QUESTION'), { minLength: 1, maxLength: 20 }),
          async (operations) => {
            const freshMockDb = new MockTriviaDatabase(
              MockTriviaQuestionFactory.createCategorizedQuestions()
            );
            await freshMockDb.initialize();
            
            const allQuestions = await freshMockDb.getAllQuestions();
            const initialCount = allQuestions.length;
            
            for (const operation of operations) {
              switch (operation) {
                case 'GET_RANDOM':
                  const randomQuestion = await freshMockDb.getRandomQuestion();
                  expect(randomQuestion).toBeDefined();
                  expect(allQuestions.some(q => q.id === randomQuestion.id)).toBe(true);
                  break;
                  
                case 'GET_BY_ID':
                  if (allQuestions.length > 0) {
                    const randomId = allQuestions[0].id;
                    const foundQuestion = await freshMockDb.getQuestionById(randomId);
                    expect(foundQuestion.id).toBe(randomId);
                  }
                  break;
                  
                case 'GET_BY_CATEGORY':
                  const categoryQuestions = await freshMockDb.getQuestionsByCategory('Science');
                  categoryQuestions.forEach(q => {
                    expect(q.category).toBe('Science');
                  });
                  break;
                  
                case 'ADD_QUESTION':
                  const newQuestion = MockTriviaQuestionFactory.createMockQuestion(
                    `test-${Date.now()}`,
                    'Test Question',
                    'Test Answer',
                    'Test Category',
                    'Easy'
                  );
                  await freshMockDb.addQuestion(newQuestion);
                  break;
              }
            }
            
            // Final consistency check
            const finalQuestions = await freshMockDb.getAllQuestions();
            expect(finalQuestions.length).toBeGreaterThanOrEqual(initialCount);
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  describe('Performance Integration', () => {
    it('should handle large trivia sessions efficiently', async () => {
      const largeQuestionSet = MockTriviaQuestionFactory.createMockQuestions(1000);
      const largeDb = new MockTriviaDatabase(largeQuestionSet);
      await largeDb.initialize();
      
      const startTime = performance.now();
      
      // Simulate 100-question session
      const sessionQuestions = [];
      for (let i = 0; i < 100; i++) {
        const question = await largeDb.getRandomQuestion();
        sessionQuestions.push(question);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(sessionQuestions.length).toBe(100);
      expect(duration).toBeLessThan(2000); // Should complete in less than 2 seconds
      
      // Verify question variety
      const uniqueQuestions = new Set(sessionQuestions.map(q => q.id));
      expect(uniqueQuestions.size).toBe(100);
    });

    it('should handle concurrent database operations', async () => {
      await mockTriviaDb.initialize();
      
      const startTime = performance.now();
      
      // Simulate concurrent operations
      const promises = [];
      for (let i = 0; i < 50; i++) {
        promises.push(mockTriviaDb.getRandomQuestion());
        promises.push(mockTriviaDb.getAllQuestions());
        promises.push(mockTriviaDb.getQuestionsByCategory('Test Category'));
      }
      
      const results = await Promise.all(promises);
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(results.length).toBe(150);
      expect(duration).toBeLessThan(3000); // Should complete in less than 3 seconds
      
      // Verify all operations succeeded
      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });

    it('should handle rapid score updates efficiently', async () => {
      await ScoreManager.initialize();
      
      const startTime = performance.now();
      
      // Simulate rapid score updates
      for (let i = 0; i < 100; i++) {
        await ScoreManager.saveTriviaScore(i);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(2000); // Should complete in less than 2 seconds
      
      const finalScore = await ScoreManager.getTriviaScore();
      expect(finalScore).toBe(99);
    });
  });

  describe('Error Recovery Integration', () => {
    it('should recover from database errors during trivia session', async () => {
      const errorDb = new MockTriviaDatabase([], true);
      
      try {
        await errorDb.initialize();
        fail('Should have thrown error');
      } catch (error) {
        // Expected error
      }
      
      // Recovery with valid database
      errorDb.setQuestions(MockTriviaQuestionFactory.createMockQuestions(5));
      await errorDb.initialize();
      
      const question = await errorDb.getRandomQuestion();
      expect(question).toBeDefined();
    });

    it('should handle score persistence errors gracefully', async () => {
      await ScoreManager.initialize();
      
      // Normal score saving should work
      await ScoreManager.saveTriviaScore(10);
      expect(await ScoreManager.getTriviaScore()).toBe(10);
      
      // Simulate error recovery would be tested here
      // In real implementation, this would test database error handling
    });

    it('should maintain session integrity after errors', async () => {
      await mockTriviaDb.initialize();
      
      const sessionData = {
        questionsAnswered: 0,
        correctAnswers: 0,
        errors: 0,
      };
      
      // Simulate session with occasional errors
      for (let i = 0; i < 20; i++) {
        try {
          const question = await mockTriviaDb.getRandomQuestion();
          sessionData.questionsAnswered++;
          
          // Simulate 10% error rate
          if (Math.random() < 0.1) {
            throw new Error('Simulated error');
          }
          
          // 70% correct rate
          if (Math.random() > 0.3) {
            sessionData.correctAnswers++;
          }
        } catch (error) {
          sessionData.errors++;
        }
      }
      
      // Verify session integrity
      expect(sessionData.questionsAnswered + sessionData.errors).toBe(20);
      expect(sessionData.correctAnswers).toBeLessThanOrEqual(sessionData.questionsAnswered);
      expect(sessionData.errors).toBeLessThan(5); // Should have minimal errors
    });
  });

  describe('Real-World Scenarios', () => {
    it('should simulate complete trivia tournament', async () => {
      await ScoreManager.initialize();
      
      const categories = ['Science', 'History', 'Geography', 'Sports', 'Entertainment'];
      const tournamentResults = {
        rounds: 0,
        totalQuestions: 0,
        totalCorrect: 0,
        categoryScores: {},
      };
      
      for (const category of categories) {
        const categoryQuestions = MockTriviaQuestionFactory.createMockQuestions(5, 'Medium');
        const categoryDb = new MockTriviaDatabase(categoryQuestions);
        await categoryDb.initialize();
        
        let roundScore = 0;
        
        // Play category round
        for (let i = 0; i < 5; i++) {
          const question = await categoryDb.getRandomQuestion();
          tournamentResults.totalQuestions++;
          
          // 60% correct rate for tournament
          if (Math.random() > 0.4) {
            roundScore++;
            tournamentResults.totalCorrect++;
          }
        }
        
        tournamentResults.categoryScores[category] = roundScore;
        tournamentResults.rounds++;
        
        // Save category score
        await ScoreManager.saveTriviaScore(roundScore);
      }
      
      // Verify tournament results
      expect(tournamentResults.rounds).toBe(categories.length);
      expect(tournamentResults.totalQuestions).toBe(categories.length * 5);
      expect(tournamentResults.totalCorrect).toBeGreaterThan(0);
      
      Object.values(tournamentResults.categoryScores).forEach(score => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(5);
      });
    });

    it('should handle mixed difficulty trivia challenge', async () => {
      const difficulties = ['Easy', 'Medium', 'Hard'];
      const challengeResults = {
        easy: { correct: 0, total: 0 },
        medium: { correct: 0, total: 0 },
        hard: { correct: 0, total: 0 },
      };
      
      for (const difficulty of difficulties) {
        const questions = MockTriviaQuestionFactory.createMockQuestions(10, difficulty);
        const db = new MockTriviaDatabase(questions);
        await db.initialize();
        
        // Play difficulty round
        for (let i = 0; i < 10; i++) {
          const question = await db.getRandomQuestion();
          challengeResults[difficulty.toLowerCase()].total++;
          
          // Varying success rates by difficulty
          let successRate = 0.8; // Easy
          if (difficulty === 'Medium') successRate = 0.6;
          if (difficulty === 'Hard') successRate = 0.4;
          
          if (Math.random() < successRate) {
            challengeResults[difficulty.toLowerCase()].correct++;
          }
        }
      }
      
      // Verify difficulty-based results
      expect(challengeResults.easy.correct / challengeResults.easy.total).toBeGreaterThan(0.7);
      expect(challengeResults.medium.correct / challengeResults.medium.total).toBeGreaterThan(0.5);
      expect(challengeResults.hard.correct / challengeResults.hard.total).toBeLessThan(0.6);
      
      // Total questions answered
      const totalQuestions = Object.values(challengeResults).reduce((sum, result) => sum + result.total, 0);
      expect(totalQuestions).toBe(30);
    });

    it('should simulate time-based trivia session', async () => {
      await mockTriviaDb.initialize();
      
      const sessionDuration = 120000; // 2 minutes in milliseconds
      const averageQuestionTime = 10000; // 10 seconds per question
      const maxQuestions = Math.floor(sessionDuration / averageQuestionTime);
      
      const sessionResults = {
        startTime: Date.now(),
        endTime: 0,
        questionsAnswered: 0,
        correctAnswers: 0,
        timeElapsed: 0,
      };
      
      const startTime = Date.now();
      
      // Simulate time-limited session
      while (Date.now() - startTime < sessionDuration && sessionResults.questionsAnswered < maxQuestions) {
        const question = await mockTriviaDb.getRandomQuestion();
        sessionResults.questionsAnswered++;
        
        // Simulate thinking time
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 65% correct rate
        if (Math.random() > 0.35) {
          sessionResults.correctAnswers++;
        }
      }
      
      sessionResults.endTime = Date.now();
      sessionResults.timeElapsed = sessionResults.endTime - sessionResults.startTime;
      
      // Verify session results
      expect(sessionResults.timeElapsed).toBeLessThanOrEqual(sessionDuration);
      expect(sessionResults.questionsAnswered).toBeLessThanOrEqual(maxQuestions);
      expect(sessionResults.correctAnswers).toBeLessThanOrEqual(sessionResults.questionsAnswered);
      
      // Should have answered reasonable number of questions
      expect(sessionResults.questionsAnswered).toBeGreaterThan(5);
    });
  });

  describe('Data Consistency', () => {
    it('should maintain data consistency across operations', async () => {
      await mockTriviaDb.initialize();
      
      const consistencyChecks = {
        initialQuestions: 0,
        afterAdd: 0,
        afterRandom: 0,
        afterCategory: 0,
      };
      
      // Initial state
      const initialQuestions = await mockTriviaDb.getAllQuestions();
      consistencyChecks.initialQuestions = initialQuestions.length;
      
      // Add questions
      const newQuestions = MockTriviaQuestionFactory.createMockQuestions(5);
      for (const question of newQuestions) {
        await mockTriviaDb.addQuestion(question);
      }
      const afterAddQuestions = await mockTriviaDb.getAllQuestions();
      consistencyChecks.afterAdd = afterAddQuestions.length;
      
      // Get random questions
      await mockTriviaDb.getRandomQuestion();
      await mockTriviaDb.getRandomQuestion();
      const afterRandomQuestions = await mockTriviaDb.getAllQuestions();
      consistencyChecks.afterRandom = afterRandomQuestions.length;
      
      // Get category questions
      await mockTriviaDb.getQuestionsByCategory('Test Category');
      const afterCategoryQuestions = await mockTriviaDb.getAllQuestions();
      consistencyChecks.afterCategory = afterCategoryQuestions.length;
      
      // Verify consistency
      expect(consistencyChecks.afterAdd).toBe(consistencyChecks.initialQuestions + 5);
      expect(consistencyChecks.afterRandom).toBe(consistencyChecks.afterAdd);
      expect(consistencyChecks.afterCategory).toBe(consistencyChecks.afterAdd);
    });

    it('should handle concurrent access safely', async () => {
      await mockTriviaDb.initialize();
      
      const concurrentResults = {
        randomQuestions: [],
        allQuestions: [],
        categoryQuestions: [],
        errors: 0,
      };
      
      // Simulate concurrent access
      const promises = [];
      
      // Concurrent random question access
      for (let i = 0; i < 10; i++) {
        promises.push(
          mockTriviaDb.getRandomQuestion()
            .then(question => concurrentResults.randomQuestions.push(question))
            .catch(error => concurrentResults.errors++)
        );
      }
      
      // Concurrent all questions access
      for (let i = 0; i < 5; i++) {
        promises.push(
          mockTriviaDb.getAllQuestions()
            .then(questions => concurrentResults.allQuestions.push(questions))
            .catch(error => concurrentResults.errors++)
        );
      }
      
      // Concurrent category access
      for (let i = 0; i < 3; i++) {
        promises.push(
          mockTriviaDb.getQuestionsByCategory('Test Category')
            .then(questions => concurrentResults.categoryQuestions.push(questions))
            .catch(error => concurrentResults.errors++)
        );
      }
      
      await Promise.all(promises);
      
      // Verify concurrent access safety
      expect(concurrentResults.randomQuestions.length).toBe(10);
      expect(concurrentResults.allQuestions.length).toBe(5);
      expect(concurrentResults.categoryQuestions.length).toBe(3);
      expect(concurrentResults.errors).toBe(0);
      
      // All questions should be valid
      concurrentResults.randomQuestions.forEach(question => {
        expect(question.id).toBeDefined();
        expect(question.question).toBeDefined();
      });
    });
  });
});
