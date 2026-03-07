import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { TriviaScreen } from '../../components/TriviaScreen';
import { TriviaDatabase } from '../../services/triviaDatabase';
import { MockTriviaDatabase, MockTriviaQuestionFactory } from '../utils/testUtils';

// Mock the dependencies
jest.mock('../../services/triviaDatabase');
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
    setParams: jest.fn(),
    dispatch: jest.fn(),
    isFocused: jest.fn(() => true),
    canGoBack: jest.fn(() => true),
    getId: jest.fn(() => 'test-id'),
  }),
  useFocusEffect: jest.fn((fn) => fn()),
}));

describe('TriviaScreen Component Tests', () => {
  let mockTriviaDb: MockTriviaDatabase;

  beforeEach(() => {
    mockTriviaDb = new MockTriviaDatabase();
    
    // Mock TriviaDatabase constructor to return our mock
    (TriviaDatabase as jest.Mock).mockImplementation(() => mockTriviaDb);
    
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const renderTriviaScreen = (props = {}) => {
    return render(
      <NavigationContainer>
        <TriviaScreen roundDuration={120} {...props} />
      </NavigationContainer>
    );
  };

  describe('Component Initialization', () => {
    it('should render loading state initially', () => {
      const { getByTestId } = renderTriviaScreen();
      
      expect(getByTestId('loading-indicator')).toBeTruthy();
    });

    it('should render error state when no questions available', async () => {
      const emptyDb = new MockTriviaDatabase([]);
      (TriviaDatabase as jest.Mock).mockImplementation(() => emptyDb);
      
      const { getByText } = renderTriviaScreen();
      
      await waitFor(() => {
        expect(getByText('No questions available')).toBeTruthy();
      });
    });

    it('should render question when data is loaded', async () => {
      const { getByText } = renderTriviaScreen();
      
      await waitFor(() => {
        expect(getByText('Question 1')).toBeTruthy();
        expect(getByText('Test Category')).toBeTruthy();
        expect(getByText('Difficulty: Medium')).toBeTruthy();
        expect(getByText('Mock Question 0')).toBeTruthy();
      });
    });
  });

  describe('Question Display', () => {
    it('should display question counter', async () => {
      const { getByText } = renderTriviaScreen();
      
      await waitFor(() => {
        expect(getByText('Question 1')).toBeTruthy();
      });
    });

    it('should display question category', async () => {
      const { getByText } = renderTriviaScreen();
      
      await waitFor(() => {
        expect(getByText('Test Category')).toBeTruthy();
      });
    });

    it('should display question difficulty', async () => {
      const { getByText } = renderTriviaScreen();
      
      await waitFor(() => {
        expect(getByText('Difficulty: Medium')).toBeTruthy();
      });
    });

    it('should display question text', async () => {
      const { getByText } = renderTriviaScreen();
      
      await waitFor(() => {
        expect(getByText('Mock Question 0')).toBeTruthy();
      });
    });
  });

  describe('Answer Toggle', () => {
    it('should show answer when button is pressed', async () => {
      const { getByText, getByTestId } = renderTriviaScreen();
      
      await waitFor(() => {
        expect(getByTestId('show-answer-button')).toBeTruthy();
      });
      
      // Initially answer should be hidden
      expect(getByText('Answer: Mock Answer 0')).toBeFalsy();
      
      // Press show answer button
      fireEvent.press(getByTestId('show-answer-button'));
      
      await waitFor(() => {
        expect(getByText('Answer: Mock Answer 0')).toBeTruthy();
        expect(getByText('Hide Answer')).toBeTruthy();
      });
    });

    it('should hide answer when button is pressed again', async () => {
      const { getByText, getByTestId } = renderTriviaScreen();
      
      await waitFor(() => {
        expect(getByTestId('show-answer-button')).toBeTruthy();
      });
      
      // Show answer
      fireEvent.press(getByTestId('show-answer-button'));
      
      await waitFor(() => {
        expect(getByText('Answer: Mock Answer 0')).toBeTruthy();
        expect(getByText('Hide Answer')).toBeTruthy();
      });
      
      // Hide answer
      fireEvent.press(getByTestId('show-answer-button'));
      
      await waitFor(() => {
        expect(getByText('Answer: Mock Answer 0')).toBeFalsy();
        expect(getByText('Show Answer')).toBeTruthy();
      });
    });

    it('should toggle answer state correctly', async () => {
      const { getByText, getByTestId } = renderTriviaScreen();
      
      await waitFor(() => {
        expect(getByTestId('show-answer-button')).toBeTruthy();
      });
      
      // Show answer
      fireEvent.press(getByTestId('show-answer-button'));
      await waitFor(() => {
        expect(getByText('Answer: Mock Answer 0')).toBeTruthy();
      });
      
      // Hide answer
      fireEvent.press(getByTestId('show-answer-button'));
      await waitFor(() => {
        expect(getByText('Answer: Answer: Mock Answer 0')).toBeFalsy();
      });
      
      // Show answer again
      fireEvent.press(getByTestId('show-answer-button'));
      await waitFor(() => {
        expect(getByText('Answer: Mock Answer 0')).toBeTruthy();
      });
    });
  });

  describe('Next Question Navigation', () => {
    it('should navigate to next question when button is pressed', async () => {
      const { getByText, getByTestId } = renderTriviaScreen();
      
      await waitFor(() => {
        expect(getByText('Question 1')).toBeTruthy();
        expect(getByText('Mock Question 0')).toBeTruthy();
      });
      
      // Press next question button
      fireEvent.press(getByTestId('next-question-button'));
      
      await waitFor(() => {
        expect(getByText('Question 2')).toBeTruthy();
        expect(getByText('Mock Question 1')).toBeTruthy();
      });
    });

    it('should increment question counter', async () => {
      const { getByText, getByTestId } = renderTriviaScreen();
      
      await waitFor(() => {
        expect(getByText('Question 1')).toBeTruthy();
      });
      
      // Go to next question multiple times
      fireEvent.press(getByTestId('next-question-button'));
      await waitFor(() => {
        expect(getByText('Question 2')).toBeTruthy();
      });
      
      fireEvent.press(getByTestId('next-question-button'));
      await waitFor(() => {
        expect(getByText('Question 3')).toBeTruthy();
      });
    });

    it('should cycle through available questions', async () => {
      const questions = MockTriviaQuestionFactory.createMockQuestions(3);
      const db = new MockTriviaDatabase(questions);
      (TriviaDatabase as jest.Mock).mockImplementation(() => db);
      
      await db.initialize();
      
      const { getByText, getByTestId } = renderTriviaScreen();
      
      // Go through all questions
      await waitFor(() => {
        expect(getByText('Question 1')).toBeTruthy();
      });
      
      fireEvent.press(getByTestId('next-question-button'));
      await waitFor(() => {
        expect(getByText('Question 2')).toBeTruthy();
      });
      
      fireEvent.press(getByTestId('next-question-button'));
      await waitFor(() => {
        expect(getByText('Question 3')).toBeTruthy();
      });
      
      // Should cycle back to first question
      fireEvent.press(getByTestId('next-question-button'));
      await waitFor(() => {
        expect(getByText('Question 4')).toBeTruthy();
      });
    });

    it('should reset answer visibility when navigating', async () => {
      const { getByText, getByTestId } = renderTriviaScreen();
      
      await waitFor(() => {
        expect(getByTestId('show-answer-button')).toBeTruthy();
      });
      
      // Show answer
      fireEvent.press(getByTestId('show-answer-button'));
      await waitFor(() => {
        expect(getByText('Answer: Mock Answer 0')).toBeTruthy();
      });
      
      // Navigate to next question should hide answer
      fireEvent.press(getByTestId('next-question-button'));
      
      await waitFor(() => {
        expect(getByText('Answer: Mock Answer 0')).toBeFalsy();
        expect(getByText('Show Answer')).toBeTruthy();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate back to Home when back button is pressed', async () => {
      const mockNavigate = jest.fn();
      (require('@react-navigation/native').useNavigation as jest.Mock).mockReturnValue({ navigate: mockNavigate });
      
      const { getByTestId } = renderTriviaScreen();
      
      await waitFor(() => {
        expect(getByTestId('back-button')).toBeTruthy();
      });
      
      fireEvent.press(getByTestId('back-button'));
      
      expect(mockNavigate).toHaveBeenCalledWith('Home');
    });
  });

  describe('Error Handling', () => {
    it('should handle database initialization errors gracefully', async () => {
      const errorDb = new MockTriviaDatabase([], true);
      (TriviaDatabase as jest.Mock).mockImplementation(() => errorDb);
      
      const { getByText } = renderTriviaScreen();
      
      await waitFor(() => {
        expect(getByText('No questions available')).toBeTruthy();
      });
    });

    it('should handle question loading errors gracefully', async () => {
      const errorDb = new MockTriviaDatabase([]);
      (TriviaDatabase as jest.Mock).mockImplementation(() => errorDb);
      
      const { getByText } = renderTriviaScreen();
      
      await waitFor(() => {
        expect(getByText('No questions available')).toBeTruthy();
      });
    });

    it('should handle next question errors gracefully', async () => {
      const errorDb = new MockTriviaDatabase([], true);
      (TriviaDatabase as jest.Mock).mockImplementation(() => errorDb);
      
      const { getByText, getByTestId } = renderTriviaScreen();
      
      await waitFor(() => {
        expect(getByText('No questions available')).toBeTruthy();
      });
      
      // Should not crash when pressing next question
      expect(() => {
        fireEvent.press(getByTestId('next-question-button'));
      }).not.toThrow();
    });
  });

  describe('Component Lifecycle', () => {
    it('should initialize database on mount', async () => {
      renderTriviaScreen();
      
      // Should call initialize on mock database
      expect(mockTriviaDb.initialize).toHaveBeenCalled();
    });

    it('should cleanup on unmount', () => {
      const { unmount } = renderTriviaScreen();
      
      unmount();
      
      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should render efficiently with many questions', async () => {
      const largeDb = new MockTriviaDatabase(
        MockTriviaQuestionFactory.createMockQuestions(1000)
      );
      (TriviaDatabase as jest.Mock).mockImplementation(() => largeDb);
      
      const startTime = performance.now();
      
      const { getByTestId } = renderTriviaScreen();
      
      await waitFor(() => {
        expect(getByTestId('show-answer-button')).toBeTruthy();
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000); // Should render in less than 1 second
    });

    it('should handle rapid navigation efficiently', async () => {
      const { getByTestId } = renderTriviaScreen();
      
      await waitFor(() => {
        expect(getByTestId('show-answer-button')).toBeTruthy();
      });
      
      const startTime = performance.now();
      
      // Rapid navigation
      for (let i = 0; i < 50; i++) {
        fireEvent.press(getByTestId('next-question-button'));
        await waitFor(() => {
          // Wait for question counter to update
        }, { timeout: 10 });
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(2000); // Should complete in less than 2 seconds
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button labels', async () => {
      const { getByLabelText, getByTestId } = renderTriviaScreen();
      
      await waitFor(() => {
        expect(getByTestId('back-button')).toBeTruthy();
        expect(getByTestId('show-answer-button')).toBeTruthy();
        expect(getByTestId('next-question-button')).toBeTruthy();
      });
    });

    it('should have accessible text content', async () => {
      const { getByText } = renderTriviaScreen();
      
      await waitFor(() => {
        expect(getByText('Question 1')).toBeTruthy();
        expect(getByText('Test Category')).toBeTruthy();
        expect(getByText('Difficulty: Medium')).toBeTruthy();
        expect(getByText('Mock Question 0')).toBeTruthy();
      });
    });
  });

  describe('Real-World Scenarios', () => {
    it('should simulate typical trivia session', async () => {
      const categorizedQuestions = MockTriviaQuestionFactory.createCategorizedQuestions();
      const db = new MockTriviaDatabase(categorizedQuestions);
      (TriviaDatabase as jest.Mock).mockImplementation(() => db);
      
      await db.initialize();
      
      const { getByText, getByTestId } = renderTriviaScreen();
      
      // Simulate a trivia session
      const sessionActions = [
        { action: 'show-answer', expected: 'Answer:' },
        { action: 'next-question', expected: 'Question 2' },
        { action: 'show-answer', expected: 'Answer:' },
        { action: 'next-question', expected: 'Question 3' },
        { action: 'hide-answer', expected: 'Show Answer' },
        { action: 'next-question', expected: 'Question 4' },
      ];
      
      for (const action of sessionActions) {
        if (action.action === 'show-answer') {
          fireEvent.press(getByTestId('show-answer-button'));
          
          if (action.expected === 'Answer:') {
            await waitFor(() => {
              expect(getByText(action.expected)).toBeTruthy();
            });
          }
        } else if (action.action === 'next-question') {
          fireEvent.press(getByTestId('next-question-button'));
          
          if (action.expected !== 'Show Answer') {
            await waitFor(() => {
              expect(getByText(action.expected)).toBeTruthy();
            });
          }
        } else if (action.action === 'hide-answer') {
          fireEvent.press(getByTestId('show-answer-button'));
          
          await waitFor(() => {
            expect(getByText(action.expected)).toBeTruthy();
          });
        }
      }
    });

    it('should handle mixed difficulty trivia session', async () => {
      const mixedQuestions = [
        ...MockTriviaQuestionFactory.createMockQuestions(3, 'Easy'),
        ...MockTriviaQuestionFactory.createMockQuestions(3, 'Medium'),
        ...MockTriviaQuestionFactory.createMockQuestions(3, 'Hard'),
      ];
      
      const db = new MockTriviaDatabase(mixedQuestions);
      (TriviaDatabase as jest.Mock).mockImplementation(() => db);
      
      await db.initialize();
      
      const { getByText, getByTestId } = renderTriviaScreen();
      
      // Go through questions to check difficulty
      for (let i = 0; i < 9; i++) {
        await waitFor(() => {
          expect(getByText(`Question ${i + 1}`)).toBeTruthy();
        });
        
        const difficulty = i < 3 ? 'Easy' : i < 6 ? 'Medium' : 'Hard';
        expect(getByText(`Difficulty: ${difficulty}`)).toBeTruthy();
        
        fireEvent.press(getByTestId('next-question-button'));
        await waitFor(() => {
          expect(getByText(`Question ${i + 2}`)).toBeTruthy();
        });
      }
    });

    it('should handle category-focused trivia session', async () => {
      const categorizedQuestions = MockTriviaQuestionFactory.createCategorizedQuestions();
      const db = new MockTriviaDatabase(categorizedQuestions);
      (TriviaDatabase as jest.Mock).mockImplementation(() => db);
      
      await db.initialize();
      
      const { getByText, getByTestId } = renderTriviaScreen();
      
      // Navigate through questions to check categories
      const categories = ['Science', 'History', 'Geography'];
      
      for (const category of categories) {
        let foundCategory = false;
        
        // Try up to 5 questions to find one from each category
        for (let i = 0; i < 5 && !foundCategory; i++) {
          const question = await db.getRandomQuestion();
          if (question.category === category) {
            foundCategory = true;
            expect(getByText(question.category)).toBeTruthy();
            fireEvent.press(getByTestId('next-question-button'));
            await waitFor(() => {
              // Wait for next question to load
            }, 10);
            break;
          }
        }
        
        if (foundCategory) {
          break;
        }
      }
    });
  });

  describe('Integration with TriviaDatabase', () => {
    it('should use real database methods', async () => {
      const { getByText } = renderTriviaScreen();
      
      await waitFor(() => {
        expect(getByText('Question 1')).toBeTruthy();
      });
      
      // Should have called database methods
      expect(mockTriviaDb.initialize).toHaveBeenCalled();
      expect(mockTriviaDb.getRandomQuestion).toHaveBeenCalled();
    });

    it('should handle database errors in UI', async () => {
      const errorDb = new MockTriviaDatabase([], true);
      (TriviaDatabase as jest.Mock).mockImplementation(() => errorDb);
      
      const { getByText } = renderTriviaScreen();
      
      await waitFor(() => {
        expect(getByText('No questions available')).toBeTruthy();
      });
      
      // Should still render without crashing
      expect(getByText('No questions available')).toBeTruthy();
    });

    it('should update question counter based on database state', async () => {
      const db = new MockTriviaDatabase(
        MockTriviaQuestionFactory.createMockQuestions(5)
      );
      (TriviaDatabase as jest.Mock).mockImplementation(() => db);
      
      await db.initialize();
      
      const { getByText, getByTestId } = renderTriviaScreen();
      
      // Get 3 questions
      for (let i = 0; i < 3; i++) {
        await waitFor(() => {
          expect(getByText(`Question ${i + 1}`)).toBeTruthy();
        });
        fireEvent.press(getByTestId('next-question-button'));
        await waitFor(() => {
          expect(getByText(`Question ${i + 2}`)).toBeTruthy();
        });
      }
      
      // Counter should reflect database state
      expect(getByText('Question 4')).toBeTruthy();
    });
  });

  describe('State Management', () => {
    it('should maintain showAnswer state across re-renders', async () => {
      const { getByText, getByTestId } = renderTriviaScreen();
      
      await waitFor(() => {
        expect(getByTestId('show-answer-button')).toBeTruthy();
      });
      
      // Show answer
      fireEvent.press(getByTestId('show-answer-button'));
      
      await waitFor(() => {
        expect(getByText('Answer: Mock Answer 0')).toBeTruthy();
        expect(getByText('Hide Answer')).toBeTruthy();
      });
      
      // Re-render should maintain state
      const { getByText: getByText2 } = renderTriviaScreen();
      
      // Answer should still be visible
      expect(getByText2('Answer: Mock Answer 0')).toBeTruthy();
    });

    it('should reset question counter when database cycles', async () => {
      const questions = MockTriviaQuestionFactory.createMockQuestions(2);
      const db = new MockTriviaDatabase(questions);
      (TriviaDatabase as jest.Mock).mockImplementation(() => db);
      
      await db.initialize();
      
      const { getByText, getByTestId } = renderTriviaScreen();
      
      // Use all questions
      await waitFor(() => {
        expect(getByText('Question 1')).toBeTruthy();
      });
      
      fireEvent.press(getByTestId('next-question-button'));
      await waitFor(() => {
        expect(getByText('Question 2')).toBeTruthy();
      });
      
      // Cycle back to first question
      fireEvent.press(getByTestId('next-question-button'));
      
      await waitFor(() => {
        expect(getByText('Question 3')).toBeTruthy();
      });
      
      // Should reset to 1 after cycling
      expect(getByText('Question 1')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty database gracefully', async () => {
      const emptyDb = new MockTriviaDatabase([]);
      (TriviaDatabase as jest.Mock).mockImplementation(() => emptyDb);
      
      const { getByText, getByTestId } = renderTriviaScreen();
      
      await waitFor(() => {
        expect(getByText('No questions available')).toBeTruthy();
      });
      
      // Should not crash when trying to get next question
      expect(() => {
        fireEvent.press(getByTestId('next-question-button'));
      }).not.toThrow();
    });

    it('should handle rapid state changes', async () => {
      const { getByTestId } = renderTriviaScreen();
      
      await waitFor(() => {
        expect(getByTestId('show-answer-button')).toBeTruthy();
      });
      
      // Rapid toggle answer state
      for (let i = 0; i < 20; i++) {
        fireEvent.press(getByTestId('show-answer-button'));
        await waitFor(() => {
          // Small wait to allow state to update
        }, 5);
      }
      
      // Should still be functional
      expect(getByTestId('show-answer-button')).toBeTruthy();
    });

    it('should handle concurrent database operations', async () => {
      const db = new MockTriviaDatabase(
        MockTriviaQuestionFactory.createMockQuestions(10)
      );
      (TriviaDatabase as jest.Mock).mockImplementation(() => db);
      
      await db.initialize();
      
      const { getByTestId } = renderTriviaScreen();
      
      // Simulate concurrent next question requests
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(db.getRandomQuestion());
      }
      
      const questions = await Promise.all(promises);
      
      expect(questions.length).toBe(5);
      questions.forEach(question => {
        expect(question).toBeDefined();
      });
    });
  });
});
