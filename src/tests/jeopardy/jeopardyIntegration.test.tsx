import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NotJeopardyScreen } from '../../components/NotJeopardyScreen';
import { ScoreManager } from '../../services/scoreManager';
import { NavigationContainer } from '@react-navigation/native';

// Mock the navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  setOptions: jest.fn(),
  isFocused: jest.fn(() => true),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  dispatch: jest.fn(),
  canGoBack: jest.fn(() => true),
  getId: jest.fn(() => 'test-id'),
  getParent: jest.fn(),
  getState: jest.fn(),
};

// Mock ScoreManager
jest.mock('../../services/scoreManager', () => ({
  ScoreManager: {
    saveScore: jest.fn(),
    saveJeopardyTriviaScore: jest.fn(),
  },
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

describe('Jeopardy Trivia Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(
      <NavigationContainer>
        <NotJeopardyScreen
          roundDuration={120}
          onRoundEnd={jest.fn()}
          {...props}
        />
      </NavigationContainer>,
      {
        wrapper: ({ children }) => {
          // Mock the navigation hook
          const MockedNavigation = React.createContext({
            navigate: mockNavigation.navigate,
          });
          return (
            <MockedNavigation.Provider value={mockNavigation}>
              {children}
            </MockedNavigation.Provider>
          );
        },
      }
    );
  };

  describe('Complete Game Flow', () => {
    it('should simulate a complete jeopardy trivia game with multiple players', async () => {
      const { getByText } = renderComponent();

      // Round 1: Regular Jeopardy
      // Player 1 answers $200 correctly
      fireEvent.press(getByText('200'));
      fireEvent.press(getByText('Player 1'));
      fireEvent.press(getByText('CORRECT!'));
      expect(getByText('Player 1: $200')).toBeTruthy();

      // Player 2 answers $400 incorrectly
      fireEvent.press(getByText('400'));
      fireEvent.press(getByText('Player 2'));
      fireEvent.press(getByText('WRONG!'));
      expect(getByText('Player 2: $-400')).toBeTruthy();

      // Player 3 answers $600 correctly
      fireEvent.press(getByText('600'));
      fireEvent.press(getByText('Player 3'));
      fireEvent.press(getByText('CORRECT!'));
      expect(getByText('Player 3: $600')).toBeTruthy();

      // Enable Double Jeopardy (Round 2)
      fireEvent.press(getByText('No')); // Toggle to Yes
      expect(getByText('Yes')).toBeTruthy();

      // Double Jeopardy Round
      // Player 1 answers $800 correctly (doubled to $1600)
      fireEvent.press(getByText('800'));
      fireEvent.press(getByText('Player 1'));
      fireEvent.press(getByText('CORRECT!'));
      expect(getByText('Player 1: $1800')).toBeTruthy(); // $200 + $1600

      // Player 2 answers $1000 incorrectly (doubled to -$2000)
      fireEvent.press(getByText('1000'));
      fireEvent.press(getByText('Player 2'));
      fireEvent.press(getByText('WRONG!'));
      expect(getByText('Player 2: $-2400')).toBeTruthy(); // -$400 + -$2000

      // Daily Double for Player 3
      fireEvent.press(getByText('Is it a Daily Double?'));
      const textInput = getByText('Enter Daily Double Question $ Amount');
      fireEvent.changeText(textInput, '1200');
      fireEvent.press(getByText('Player 3'));
      fireEvent.press(getByText('CORRECT!'));
      expect(getByText('Player 3: $3000')).toBeTruthy(); // $600 + $2400 (1200 * 2)

      // Save high score (should save max score: $3000)
      fireEvent.press(getByText('Save High Score'));
      expect(ScoreManager.saveJeopardyTriviaScore).toHaveBeenCalledWith(3000);
    });

    it('should handle a game with all negative scores', async () => {
      const { getByText } = renderComponent();

      // All players get wrong answers
      fireEvent.press(getByText('200'));
      fireEvent.press(getByText('Player 1'));
      fireEvent.press(getByText('WRONG!'));

      fireEvent.press(getByText('400'));
      fireEvent.press(getByText('Player 2'));
      fireEvent.press(getByText('WRONG!'));

      fireEvent.press(getByText('600'));
      fireEvent.press(getByText('Player 3'));
      fireEvent.press(getByText('WRONG!'));

      expect(getByText('Player 1: $-200')).toBeTruthy();
      expect(getByText('Player 2: $-400')).toBeTruthy();
      expect(getByText('Player 3: $-600')).toBeTruthy();

      // Save high score (should save 0 since all are negative)
      fireEvent.press(getByText('Save High Score'));
      expect(ScoreManager.saveJeopardyTriviaScore).toHaveBeenCalledWith(0);
    });

    it('should handle a game with daily double and custom amounts', async () => {
      const { getByText } = renderComponent();

      // Enable daily double with custom amount
      fireEvent.press(getByText('Is it a Daily Double?'));
      
      // Set custom amount
      const textInput = getByText('Enter Daily Double Question $ Amount');
      fireEvent.changeText(textInput, '2500');
      
      // Player 1 gets daily double correct
      fireEvent.press(getByText('Player 1'));
      fireEvent.press(getByText('CORRECT!'));
      
      expect(getByText('Player 1: $2500')).toBeTruthy();
      expect(getByText('Player 2: $0')).toBeTruthy();
      expect(getByText('Player 3: $0')).toBeTruthy();

      // Disable daily double and continue normally
      fireEvent.press(getByText('Is it a Daily Double?'));
      
      // Normal question for Player 2
      fireEvent.press(getByText('500'));
      fireEvent.press(getByText('Player 2'));
      fireEvent.press(getByText('CORRECT!'));
      
      expect(getByText('Player 1: $2500')).toBeTruthy();
      expect(getByText('Player 2: $500')).toBeTruthy();
      expect(getByText('Player 3: $0')).toBeTruthy();
    });
  });

  describe('Score Persistence Integration', () => {
    it('should integrate with ScoreManager for high score tracking', async () => {
      const { getByText } = renderComponent();
      
      // Simulate a high-scoring game
      const amounts = [200, 400, 600, 800, 1000];
      
      amounts.forEach((amount, index) => {
        fireEvent.press(getByText(amount.toString()));
        fireEvent.press(getByText(`Player ${(index % 3) + 1}`));
        fireEvent.press(getByText('CORRECT!'));
      });

      // Enable double jeopardy for round 2
      fireEvent.press(getByText('No')); // Toggle to Yes
      
      amounts.forEach((amount, index) => {
        fireEvent.press(getByText(amount.toString()));
        fireEvent.press(getByText(`Player ${(index % 3) + 1}`));
        fireEvent.press(getByText('CORRECT!'));
      });

      // Save the high score
      fireEvent.press(getByText('Save High Score'));
      
      // Verify ScoreManager was called with the correct max score
      expect(ScoreManager.saveJeopardyTriviaScore).toHaveBeenCalledTimes(1);
      const savedScore = (ScoreManager.saveJeopardyTriviaScore as jest.Mock).mock.calls[0][0];
      expect(savedScore).toBeGreaterThan(0);
      expect(typeof savedScore).toBe('number');
    });
  });

  describe('User Experience Flow', () => {
    it('should allow user to navigate back to home', async () => {
      const { getByText } = renderComponent();
      
      fireEvent.press(getByText('Back'));
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Home');
    });

    it('should handle rapid button presses without errors', async () => {
      const { getByText } = renderComponent();
      
      // Rapidly press multiple buttons
      fireEvent.press(getByText('200'));
      fireEvent.press(getByText('Player 1'));
      fireEvent.press(getByText('Player 2'));
      fireEvent.press(getByText('Player 3'));
      fireEvent.press(getByText('400'));
      fireEvent.press(getByText('CORRECT!'));
      fireEvent.press(getByText('WRONG!'));
      
      // Should still have valid scores
      expect(getByText('Player 1: $200')).toBeTruthy();
      expect(getByText('Player 2: $-400')).toBeTruthy();
      expect(getByText('Player 3: $0')).toBeTruthy();
    });

    it('should handle state changes in correct order', async () => {
      const { getByText } = renderComponent();
      
      // Verify initial state
      expect(getByText('Double Jeopardy(Round 2)?')).toBeTruthy();
      expect(getByText('No')).toBeTruthy();
      expect(getByText('Question Selected: $0')).toBeTruthy();
      
      // Change states in sequence
      fireEvent.press(getByText('200'));
      expect(getByText('Question Selected: $200')).toBeTruthy();
      
      fireEvent.press(getByText('Player 1'));
      // Player 1 button should be selected (green background)
      
      fireEvent.press(getByText('CORRECT!'));
      expect(getByText('Player 1: $200')).toBeTruthy();
      
      fireEvent.press(getByText('No')); // Enable double jeopardy
      expect(getByText('Yes')).toBeTruthy();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle invalid input gracefully', async () => {
      const { getByText } = renderComponent();
      
      // Enable daily double
      fireEvent.press(getByText('Is it a Daily Double?'));
      
      // Try to enter invalid text
      const textInput = getByText('Enter Daily Double Question $ Amount');
      fireEvent.changeText(textInput, 'invalid');
      
      // Should not crash and should handle gracefully
      expect(getByText('Question Selected: $NaN')).toBeTruthy();
      
      // Select player and try to score
      fireEvent.press(getByText('Player 1'));
      fireEvent.press(getByText('CORRECT!'));
      
      // Should handle NaN gracefully
      expect(getByText('Player 1: $NaN')).toBeTruthy();
    });

    it('should handle empty daily double input', async () => {
      const { getByText } = renderComponent();
      
      // Enable daily double
      fireEvent.press(getByText('Is it a Daily Double?'));
      
      // Clear the input
      const textInput = getByText('Enter Daily Double Question $ Amount');
      fireEvent.changeText(textInput, '');
      
      // Should handle empty input
      expect(getByText('Question Selected: $0')).toBeTruthy();
    });

    it('should handle maximum score scenarios', async () => {
      const { getByText } = renderComponent();
      
      // Enable double jeopardy
      fireEvent.press(getByText('No'));
      
      // Enable daily double with max amount
      fireEvent.press(getByText('Is it a Daily Double?'));
      const textInput = getByText('Enter Daily Double Question $ Amount');
      fireEvent.changeText(textInput, '999999');
      
      fireEvent.press(getByText('Player 1'));
      fireEvent.press(getByText('CORRECT!'));
      
      expect(getByText('Player 1: $1999998')).toBeTruthy(); // 999999 * 2
    });
  });

  describe('Component Lifecycle', () => {
    it('should handle onRoundEnd callback correctly', async () => {
      const mockOnRoundEnd = jest.fn();
      const { getByText } = renderComponent({ onRoundEnd: mockOnRoundEnd });
      
      // Play a round
      fireEvent.press(getByText('200'));
      fireEvent.press(getByText('Player 1'));
      fireEvent.press(getByText('CORRECT!'));
      
      // Note: The timer functionality is commented out in the component,
      // so onRoundEnd is not automatically called
      expect(mockOnRoundEnd).not.toHaveBeenCalled();
    });

    it('should handle custom round duration', async () => {
      const { getByText } = renderComponent({ roundDuration: 300 });
      
      // Component should render normally with custom duration
      expect(getByText('Not Jeopardy')).toBeTruthy();
      expect(getByText('Player 1: $0')).toBeTruthy();
    });
  });
});
