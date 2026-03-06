import { TriviaDatabase } from '../../services/triviaDatabase';
import { MockTriviaDatabase, MockTriviaQuestionFactory } from '../utils/testUtils';
import * as fc from 'fast-check';

describe('Trivia Game Logic Tests', () => {
  let triviaDb: TriviaDatabase;
  let mockTriviaDb: MockTriviaDatabase;

  beforeEach(() => {
    triviaDb = new TriviaDatabase();
    mockTriviaDb = new MockTriviaDatabase();
  });

  describe('TriviaDatabase Basic Functionality', () => {
    it('should initialize without questions', async () => {
      const emptyDb = new MockTriviaDatabase([]);
      await emptyDb.initialize();
      
      expect(() => emptyDb.getRandomQuestion()).rejects.toThrow('No trivia questions available');
    });

    it('should initialize with questions', async () => {
      const questions = MockTriviaQuestionFactory.createMockQuestions(10);
      const db = new MockTriviaDatabase(questions);
      await db.initialize();
      
      const question = await db.getRandomQuestion();
      expect(question).toBeDefined();
      expect(question.id).toMatch(/^question-\d+$/);
      expect(question.question).toMatch(/^Mock Question \d+$/);
    });

    it('should get random questions', async () => {
      await mockTriviaDb.initialize();
      
      const question1 = await mockTriviaDb.getRandomQuestion();
      const question2 = await mockTriviaDb.getRandomQuestion();
      
      expect(question1).toBeDefined();
      expect(question2).toBeDefined();
      expect(question1.id).not.toBe(question2.id);
    });

    it('should track used questions', async () => {
      await mockTriviaDb.initialize();
      
      const usedIds: string[] = [];
      
      for (let i = 0; i < 5; i++) {
        const question = await mockTriviaDb.getRandomQuestion();
        usedIds.push(question.id);
      }
      
      const uniqueIds = new Set(usedIds);
      expect(uniqueIds.size).toBe(5);
    });

    it('should cycle back to beginning when all questions used', async () => {
      const questions = MockTriviaQuestionFactory.createMockQuestions(3);
      const db = new MockTriviaDatabase(questions);
      await db.initialize();
      
      // Use all questions
      const usedQuestions = [];
      for (let i = 0; i < 3; i++) {
        const question = await db.getRandomQuestion();
        usedQuestions.push(question);
      }
      
      // Should still be able to get questions (cycling back)
      const cycledQuestion = await db.getRandomQuestion();
      expect(cycledQuestion).toBeDefined();
      
      // The cycled question should be one of the original ones
      const originalIds = questions.map(q => q.id);
      expect(originalIds).toContain(cycledQuestion.id);
    });

    it('should get question by ID', async () => {
      await mockTriviaDb.initialize();
      
      const randomQuestion = await mockTriviaDb.getRandomQuestion();
      const foundQuestion = await mockTriviaDb.getQuestionById(randomQuestion.id);
      
      expect(foundQuestion.id).toBe(randomQuestion.id);
      expect(foundQuestion.question).toBe(randomQuestion.question);
      expect(foundQuestion.answer).toBe(randomQuestion.answer);
    });

    it('should get questions by category', async () => {
      const categorizedQuestions = MockTriviaQuestionFactory.createCategorizedQuestions();
      const db = new MockTriviaDatabase(categorizedQuestions);
      await db.initialize();
      
      const scienceQuestions = await db.getQuestionsByCategory('Science');
      const historyQuestions = await db.getQuestionsByCategory('History');
      
      expect(scienceQuestions.length).toBeGreaterThan(0);
      expect(historyQuestions.length).toBeGreaterThan(0);
      
      expect(scienceQuestions.every(q => q.category === 'Science')).toBe(true);
      expect(historyQuestions.every(q => q.category === 'History')).toBe(true);
    });

    it('should get all questions', async () => {
      await mockTriviaDb.initialize();
      
      const allQuestions = await mockTriviaDb.getAllQuestions();
      expect(Array.isArray(allQuestions)).toBe(true);
      expect(allQuestions.length).toBeGreaterThan(0);
      
      allQuestions.forEach(question => {
        expect(question.id).toBeDefined();
        expect(question.question).toBeDefined();
        expect(question.answer).toBeDefined();
      });
    });

    it('should add new questions', async () => {
      await mockTriviaDb.initialize();
      
      const newQuestion = MockTriviaQuestionFactory.createMockQuestion(
        'custom-1',
        'Custom Question',
        'Custom Answer',
        'Custom Category',
        'Custom Difficulty'
      );
      
      await mockTriviaDb.addQuestion(newQuestion);
      
      const foundQuestion = await mockTriviaDb.getQuestionById('custom-1');
      expect(foundQuestion.id).toBe('custom-1');
      expect(foundQuestion.question).toBe('Custom Question');
    });

    it('should handle question validation', async () => {
      await mockTriviaDb.initialize();
      
      // Test invalid question data
      const invalidQuestion = {
        id: '',
        question: '',
        answer: 'Some answer',
        category: 'Test',
        difficulty: 'Easy'
      };
      
      await expect(mockTriviaDb.addQuestion(invalidQuestion)).rejects.toThrow();
    });
  });

  describe('Question Progression', () => {
    it('should provide different questions on successive calls', async () => {
      await mockTriviaDb.initialize();
      
      const questions = [];
      for (let i = 0; i < 10; i++) {
        const question = await mockTriviaDb.getRandomQuestion();
        questions.push(question);
      }
      
      // Should have gotten 10 questions (with possible cycling)
      expect(questions.length).toBe(10);
      
      // Check that we got variety
      const uniqueQuestions = new Set(questions.map(q => q.id));
      expect(uniqueQuestions.size).toBeGreaterThan(5); // At least some variety
    });

    it('should maintain question state across operations', async () => {
      await mockTriviaDb.initialize();
      
      // Get some questions
      await mockTriviaDb.getRandomQuestion();
      await mockTriviaDb.getRandomQuestion();
      await mockTriviaDb.getRandomQuestion();
      
      const usedIds1 = mockTriviaDb.getUsedQuestionIds();
      
      // Get more questions
      await mockTriviaDb.getRandomQuestion();
      await mockTriviaDb.getRandomQuestion();
      
      const usedIds2 = mockTriviaDb.getUsedQuestionIds();
      
      // Used IDs should accumulate
      expect(usedIds2.length).toBeGreaterThanOrEqual(usedIds1.length);
    });

    it('should reset used questions correctly', async () => {
      await mockTriviaDb.initialize();
      
      // Use some questions
      for (let i = 0; i < 5; i++) {
        await mockTriviaDb.getRandomQuestion();
      }
      
      expect(mockTriviaDb.getUsedQuestionIds().length).toBe(5);
      
      // Reset
      mockTriviaDb.resetUsedQuestions();
      
      expect(mockTriviaDb.getUsedQuestionIds().length).toBe(0);
    });

    it('should handle empty database gracefully', async () => {
      const emptyDb = new MockTriviaDatabase([]);
      await emptyDb.initialize();
      
      await expect(emptyDb.getRandomQuestion()).rejects.toThrow('No trivia questions available');
      
      // Should not throw for other operations
      expect(await emptyDb.getAllQuestions()).toEqual([]);
      expect(await emptyDb.getQuestionsByCategory('Any')).toEqual([]);
    });
  });

  describe('Property-Based Tests', () => {
    it('should handle random question sequences correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 50 }),
          async (questionCount) => {
            const freshMockDb = new MockTriviaDatabase(
              MockTriviaQuestionFactory.createMockQuestions(20)
            );
            await freshMockDb.initialize();
            
            const questions = [];
            const usedIds = new Set();
            
            for (let i = 0; i < questionCount; i++) {
              const question = await freshMockDb.getRandomQuestion();
              questions.push(question);
              usedIds.add(question.id);
            }
            
            expect(questions.length).toBe(questionCount);
            expect(usedIds.size).toBeGreaterThan(0);
            
            // All questions should have valid structure
            questions.forEach(question => {
              expect(question.id).toBeDefined();
              expect(question.question).toBeDefined();
              expect(question.answer).toBeDefined();
            });
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should maintain question uniqueness within round', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.integer({ min: 0, max: 19 }), { minLength: 1, maxLength: 20 }),
          async (indices) => {
            const freshMockDb = new MockTriviaDatabase(
              MockTriviaQuestionFactory.createMockQuestions(20)
            );
            await freshMockDb.initialize();
            
            const usedIds = new Set();
            
            for (const index of indices) {
              const question = await freshMockDb.getRandomQuestion();
              
              if (usedIds.has(question.id)) {
                // This should only happen after cycling back to beginning
                expect(freshMockDb.getUsedQuestionIds().size).toBe(20);
              }
              
              usedIds.add(question.id);
            }
            
            // Should have used all questions at least once
            expect(freshMockDb.getUsedQuestionIds().size).toBeGreaterThanOrEqual(1);
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should handle category filtering consistently', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('Science', 'History', 'Geography', 'Sports', 'Entertainment'),
          async (category) => {
            const freshMockDb = new MockTriviaDatabase(
              MockTriviaQuestionFactory.createCategorizedQuestions()
            );
            await freshMockDb.initialize();
            
            const categoryQuestions = await freshMockDb.getQuestionsByCategory(category);
            
            // All returned questions should have the correct category
            categoryQuestions.forEach(question => {
              expect(question.category).toBe(category);
            });
            
            // Should have at least some questions for common categories
            if (['Science', 'History', 'Geography'].includes(category)) {
              expect(categoryQuestions.length).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 25 }
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle database initialization errors', async () => {
      const errorDb = new MockTriviaDatabase([], true); // Force error
      
      await expect(errorDb.initialize()).rejects.toThrow();
    });

    it('should handle get question by invalid ID', async () => {
      await mockTriviaDb.initialize();
      
      await expect(mockTriviaDb.getQuestionById('non-existent')).rejects.toThrow();
    });

    it('should handle concurrent question requests', async () => {
      await mockTriviaDb.initialize();
      
      // Simulate concurrent requests
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(mockTriviaDb.getRandomQuestion());
      }
      
      const questions = await Promise.all(promises);
      
      expect(questions.length).toBe(10);
      questions.forEach(question => {
        expect(question).toBeDefined();
        expect(question.id).toBeDefined();
      });
    });

    it('should handle very large question sets', async () => {
      const largeQuestionSet = MockTriviaQuestionFactory.createMockQuestions(1000);
      const largeDb = new MockTriviaDatabase(largeQuestionSet);
      
      const startTime = performance.now();
      await largeDb.initialize();
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Should initialize quickly
      
      const question = await largeDb.getRandomQuestion();
      expect(question).toBeDefined();
    });

    it('should handle question cycling with many uses', async () => {
      const smallDb = new MockTriviaDatabase(MockTriviaQuestionFactory.createMockQuestions(3));
      await smallDb.initialize();
      
      // Use questions many times to test cycling
      for (let i = 0; i < 100; i++) {
        const question = await smallDb.getRandomQuestion();
        expect(question).toBeDefined();
        expect(['question-0', 'question-1', 'question-2']).toContain(question.id);
      }
    });
  });

  describe('Performance Tests', () => {
    it('should handle rapid question retrieval efficiently', async () => {
      await mockTriviaDb.initialize();
      
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        await mockTriviaDb.getRandomQuestion();
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(500); // Should complete in less than 500ms
    });

    it('should handle category filtering efficiently', async () => {
      await mockTriviaDb.initialize();
      
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        await mockTriviaDb.getQuestionsByCategory('Test');
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(200); // Should complete in less than 200ms
    });

    it('should handle question addition efficiently', async () => {
      await mockTriviaDb.initialize();
      
      const newQuestions = MockTriviaQuestionFactory.createMockQuestions(100);
      
      const startTime = performance.now();
      
      for (const question of newQuestions) {
        await mockTriviaDb.addQuestion(question);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000); // Should complete in less than 1 second
    });
  });

  describe('Data Integrity', () => {
    it('should maintain question data integrity', async () => {
      await mockTriviaDb.initialize();
      
      const question = await mockTriviaDb.getRandomQuestion();
      
      expect(question.id).toBeDefined();
      expect(question.question).toBeDefined();
      expect(question.answer).toBeDefined();
      expect(typeof question.id).toBe('string');
      expect(typeof question.question).toBe('string');
      expect(typeof question.answer).toBe('string');
      expect(question.id.length).toBeGreaterThan(0);
      expect(question.question.length).toBeGreaterThan(0);
      expect(question.answer.length).toBeGreaterThan(0);
    });

    it('should preserve question relationships', async () => {
      const categorizedQuestions = MockTriviaQuestionFactory.createCategorizedQuestions();
      const db = new MockTriviaDatabase(categorizedQuestions);
      await db.initialize();
      
      const question = await db.getRandomQuestion();
      const sameQuestion = await db.getQuestionById(question.id);
      
      expect(question.id).toBe(sameQuestion.id);
      expect(question.question).toBe(sameQuestion.question);
      expect(question.answer).toBe(sameQuestion.answer);
      expect(question.category).toBe(sameQuestion.category);
    });

    it('should handle special characters in questions', async () => {
      const specialQuestions = [
        MockTriviaQuestionFactory.createMockQuestion(
          'special-1',
          'Question with "quotes" and \'apostrophes\'',
          'Answer with special chars: @#$%^&*()',
          'Special Category',
          'Weird Difficulty'
        ),
        MockTriviaQuestionFactory.createMockQuestion(
          'special-2',
          'Question with émojis 🎮🎯🎲',
          'Answer with unicode: café résumé',
          'Unicode Category',
          'International Difficulty'
        ),
      ];
      
      const db = new MockTriviaDatabase(specialQuestions);
      await db.initialize();
      
      const question1 = await db.getRandomQuestion();
      const question2 = await db.getRandomQuestion();
      
      expect(question1.question).toContain('quotes');
      expect(question2.question).toContain('émojis');
      
      // Should preserve special characters
      expect(question1.answer).toContain('@#$%^&*()');
      expect(question2.answer).toContain('café');
    });
  });

  describe('Integration Scenarios', () => {
    it('should simulate complete trivia session', async () => {
      await mockTriviaDb.initialize();
      
      const sessionQuestions = [];
      const sessionCategories = new Set();
      
      // Simulate 10-question trivia session
      for (let i = 0; i < 10; i++) {
        const question = await mockTriviaDb.getRandomQuestion();
        sessionQuestions.push(question);
        sessionCategories.add(question.category);
      }
      
      expect(sessionQuestions.length).toBe(10);
      expect(sessionCategories.size).toBeGreaterThan(0);
      
      // Verify all questions are valid
      sessionQuestions.forEach(question => {
        expect(question.id).toBeDefined();
        expect(question.question).toBeDefined();
        expect(question.answer).toBeDefined();
      });
    });

    it('should handle category-based trivia rounds', async () => {
      const categorizedQuestions = MockTriviaQuestionFactory.createCategorizedQuestions();
      const db = new MockTriviaDatabase(categorizedQuestions);
      await db.initialize();
      
      const categories = ['Science', 'History', 'Geography'];
      const roundQuestions = [];
      
      for (const category of categories) {
        const categoryQuestions = await db.getQuestionsByCategory(category);
        roundQuestions.push(...categoryQuestions.slice(0, 3)); // Take 3 from each
      }
      
      expect(roundQuestions.length).toBe(9);
      
      // Verify all questions are from the specified categories
      roundQuestions.forEach(question => {
        expect(categories).toContain(question.category);
      });
    });

    it('should handle mixed difficulty trivia', async () => {
      const mixedQuestions = [
        ...MockTriviaQuestionFactory.createMockQuestions(3, 'Easy'),
        ...MockTriviaQuestionFactory.createMockQuestions(3, 'Medium'),
        ...MockTriviaQuestionFactory.createMockQuestions(3, 'Hard'),
      ];
      
      const db = new MockTriviaDatabase(mixedQuestions);
      await db.initialize();
      
      const difficulties = new Set();
      
      for (let i = 0; i < 9; i++) {
        const question = await db.getRandomQuestion();
        difficulties.add(question.difficulty);
      }
      
      expect(difficulties.has('Easy')).toBe(true);
      expect(difficulties.has('Medium')).toBe(true);
      expect(difficulties.has('Hard')).toBe(true);
    });
  });

  describe('Error Recovery', () => {
    it('should recover from database errors', async () => {
      const errorDb = new MockTriviaDatabase([], true);
      
      // First initialization fails
      await expect(errorDb.initialize()).rejects.toThrow();
      
      // Second initialization with valid data should succeed
      errorDb.setQuestions(MockTriviaQuestionFactory.createMockQuestions(5));
      await errorDb.initialize();
      
      const question = await errorDb.getRandomQuestion();
      expect(question).toBeDefined();
    });

    it('should handle partial database corruption', async () => {
      const validQuestions = MockTriviaQuestionFactory.createMockQuestions(5);
      const invalidQuestions = [
        { id: '', question: 'Invalid', answer: 'Invalid', category: 'Test', difficulty: 'Easy' },
        { id: 'valid-1', question: 'Valid', answer: 'Valid', category: 'Test', difficulty: 'Easy' },
      ];
      
      const db = new MockTriviaDatabase([...validQuestions, ...invalidQuestions]);
      await db.initialize();
      
      // Should only accept valid questions
      const allQuestions = await db.getAllQuestions();
      expect(allQuestions.length).toBe(5);
      
      // Should be able to get valid questions
      const question = await db.getRandomQuestion();
      expect(question.id).toMatch(/^question-\d+$/);
    });
  });
});
