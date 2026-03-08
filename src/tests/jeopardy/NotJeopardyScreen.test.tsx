import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
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

// Mock ScoreManager static methods
jest.mock('../../services/scoreManager', () => ({
  ScoreManager: {
    saveScore: jest.fn(),
    saveJeopardyTriviaScore: jest.fn(),
  },
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

describe('NotJeopardyScreen', () => {
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

  describe('Initial State', () => {
    it('should render with initial scores of 0 for all players', () => {
      const { getByText } = renderComponent();
      
      expect(getByText('Player 1: $0')).toBeTruthy();
      expect(getByText('Player 2: $0')).toBeTruthy();
      expect(getByText('Player 3: $0')).toBeTruthy();
    });

    it('should display the title', () => {
      const { getByText } = renderComponent();
      
      expect(getByText('Not Jeopardy')).toBeTruthy();
    });

    it('should show dollar amount buttons', () => {
      const { getByText } = renderComponent();
      
      expect(getByText('200')).toBeTruthy();
      expect(getByText('400')).toBeTruthy();
      expect(getByText('600')).toBeTruthy();
      expect(getByText('800')).toBeTruthy();
      expect(getByText('1000')).toBeTruthy();
    });

    it('should have double jeopardy set to No by default', () => {
      const { getByText } = renderComponent();
      
      expect(getByText('Is it Double Jeopardy(Round 2)?')).toBeTruthy();
      expect(getByText('No')).toBeTruthy();
    });

    it('should have daily double set to false by default', () => {
      const { getByText, queryByText } = renderComponent();
      
      expect(getByText('Is it a Daily Double?')).toBeTruthy();
      expect(queryByText('Enter Daily Double Question $ Amount')).toBeFalsy();
    });
  });

  describe('Dollar Amount Selection', () => {
    it('should update question amount when dollar button is pressed', () => {
      const { getByText } = renderComponent();
      
      fireEvent.press(getByText('400'));
      expect(getByText('Question Selected: $400')).toBeTruthy();
    });

    it('should handle multiple dollar amount selections', () => {
      const { getByText } = renderComponent();
      
      fireEvent.press(getByText('200'));
      expect(getByText('Question Selected: $200')).toBeTruthy();
      
      fireEvent.press(getByText('800'));
      expect(getByText('Question Selected: $800')).toBeTruthy();
    });
  });

  describe('Double Jeopardy Toggle', () => {
    it('should toggle double jeopardy state', () => {
      const { getByText } = renderComponent();
      
      // Initially No
      expect(getByText('No')).toBeTruthy();
      
      // Toggle to Yes
      fireEvent.press(getByText('No'));
      expect(getByText('Yes')).toBeTruthy();
      
      // Toggle back to No
      fireEvent.press(getByText('Yes'));
      expect(getByText('No')).toBeTruthy();
    });
  });

  describe('Daily Double Feature', () => {
    it('should show input field when daily double is enabled', () => {
      const { getByText, getByPlaceholderText } = renderComponent();
      
      fireEvent.press(getByText('Is it a Daily Double?'));
      expect(getByPlaceholderText('Enter Daily Double Question $ Amount')).toBeTruthy();
    });

    it('should hide input field when daily double is disabled', () => {
      const { getByText, queryByPlaceholderText } = renderComponent();
      
      // Enable daily double
      fireEvent.press(getByText('Is it a Daily Double?'));
      expect(queryByPlaceholderText('Enter Daily Double Question $ Amount')).toBeTruthy();
      
      // Disable daily double
      fireEvent.press(getByText('Is it a Daily Double?'));
      expect(queryByPlaceholderText('Enter Daily Double Question $ Amount')).toBeFalsy();
    });

    it('should allow custom amount input for daily double', () => {
      const { getByText, getByPlaceholderText } = renderComponent();
      
      fireEvent.press(getByText('Is it a Daily Double?'));
      
      const textInput = getByPlaceholderText('Enter Daily Double Question $ Amount');
      fireEvent.changeText(textInput, '1500');
      
      expect(getByText('Question Selected: $1500')).toBeTruthy();
    });
  });

  describe('Player Selection', () => {
    it('should highlight selected player', () => {
      const { getByText } = renderComponent();
      
      // Select Player 2
      fireEvent.press(getByText('Player 2'));
      
      // Check that Player 2 is selected (button should have selected style)
      const player2Button = getByText('Player 2');
      expect(player2Button.parent?.props.style).toContainEqual(
        expect.objectContaining({ backgroundColor: 'green' })
      );
    });

    it('should handle player selection changes', () => {
      const { getByText } = renderComponent();
      
      // Select Player 1
      fireEvent.press(getByText('Player 1'));
      
      // Change to Player 3
      fireEvent.press(getByText('Player 3'));
      
      // Player 3 should be selected
      const player3Button = getByText('Player 3');
      expect(player3Button.parent?.props.style).toContainEqual(
        expect.objectContaining({ backgroundColor: 'green' })
      );
    });
  });

  describe('Score Management', () => {
    it('should add points to correct player when CORRECT is pressed', () => {
      const { getByText } = renderComponent();
      
      // Select amount and player
      fireEvent.press(getByText('400'));
      fireEvent.press(getByText('Player 1'));
      
      // Mark as correct
      fireEvent.press(getByText('CORRECT!'));
      
      expect(getByText('Player 1: $400')).toBeTruthy();
      expect(getByText('Player 2: $0')).toBeTruthy();
      expect(getByText('Player 3: $0')).toBeTruthy();
    });

    it('should subtract points from selected player when WRONG is pressed', () => {
      const { getByText } = renderComponent();
      
      // Select amount and player
      fireEvent.press(getByText('600'));
      fireEvent.press(getByText('Player 2'));
      
      // Mark as wrong
      fireEvent.press(getByText('WRONG!'));
      
      expect(getByText('Player 1: $0')).toBeTruthy();
      expect(getByText('Player 2: $-600')).toBeTruthy();
      expect(getByText('Player 3: $0')).toBeTruthy();
    });

    it('should handle multiple score changes for different players', () => {
      const { getByText } = renderComponent();
      
      // Player 1 gets 200 correct
      fireEvent.press(getByText('200'));
      fireEvent.press(getByText('Player 1'));
      fireEvent.press(getByText('CORRECT!'));
      
      // Player 2 gets 400 wrong
      fireEvent.press(getByText('400'));
      fireEvent.press(getByText('Player 2'));
      fireEvent.press(getByText('WRONG!'));
      
      // Player 3 gets 800 correct
      fireEvent.press(getByText('800'));
      fireEvent.press(getByText('Player 3'));
      fireEvent.press(getByText('CORRECT!'));
      
      expect(getByText('Player 1: $200')).toBeTruthy();
      expect(getByText('Player 2: $-400')).toBeTruthy();
      expect(getByText('Player 3: $800')).toBeTruthy();
    });
  });

  describe('Double Jeopardy Scoring', () => {
    it('should double points when double jeopardy is enabled and answer is correct', () => {
      const { getByText } = renderComponent();
      
      // Enable double jeopardy
      fireEvent.press(getByText('No')); // Toggle to Yes
      
      // Select amount and player
      fireEvent.press(getByText('400'));
      fireEvent.press(getByText('Player 1'));
      
      // Mark as correct
      fireEvent.press(getByText('CORRECT!'));
      
      expect(getByText('Player 1: $800')).toBeTruthy(); // 400 * 2 = 800
    });

    it('should double point deduction when double jeopardy is enabled and answer is wrong', () => {
      const { getByText } = renderComponent();
      
      // Enable double jeopardy
      fireEvent.press(getByText('No')); // Toggle to Yes
      
      // Select amount and player
      fireEvent.press(getByText('300'));
      fireEvent.press(getByText('Player 2'));
      
      // Mark as wrong
      fireEvent.press(getByText('WRONG!'));
      
      expect(getByText('Player 2: $-600')).toBeTruthy(); // 300 * 2 = 600 deduction
    });

    it('should not double points when double jeopardy is disabled', () => {
      const { getByText } = renderComponent();
      
      // Ensure double jeopardy is disabled (default state)
      expect(getByText('No')).toBeTruthy();
      
      // Select amount and player
      fireEvent.press(getByText('500'));
      fireEvent.press(getByText('Player 3'));
      
      // Mark as correct
      fireEvent.press(getByText('CORRECT!'));
      
      expect(getByText('Player 3: $500')).toBeTruthy(); // No doubling
    });
  });

  describe('High Score Saving', () => {
    it('should call saveJeopardyTriviaScore when Save High Score button is pressed', () => {
      const { getByText } = renderComponent();
      
      fireEvent.press(getByText('Save High Score'));
      
      expect(ScoreManager.saveJeopardyTriviaScore).toHaveBeenCalled();
    });

    it('should save the maximum score among all players', () => {
      const { getByText } = renderComponent();
      
      // Set up different scores for players
      fireEvent.press(getByText('200'));
      fireEvent.press(getByText('Player 1'));
      fireEvent.press(getByText('CORRECT!'));
      
      fireEvent.press(getByText('400'));
      fireEvent.press(getByText('Player 2'));
      fireEvent.press(getByText('CORRECT!'));
      
      fireEvent.press(getByText('600'));
      fireEvent.press(getByText('Player 3'));
      fireEvent.press(getByText('CORRECT!'));
      
      fireEvent.press(getByText('Save High Score'));
      
      // Should save the max score (600)
      expect(ScoreManager.saveJeopardyTriviaScore).toHaveBeenCalledWith(600);
    });
  });

  describe('Navigation', () => {
    it('should navigate back when Back button is pressed', () => {
      const { getByText } = renderComponent();
      
      fireEvent.press(getByText('Back'));
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Home');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero amount selection', () => {
      const { getByText } = renderComponent();
      
      // Enable daily double and set amount to 0
      fireEvent.press(getByText('Is it a Daily Double?'));
      const textInput = getByPlaceholderText('Enter Daily Double Question $ Amount');
      fireEvent.changeText(textInput, '0');
      
      fireEvent.press(getByText('Player 1'));
      fireEvent.press(getByText('CORRECT!'));
      
      expect(getByText('Player 1: $0')).toBeTruthy();
    });

    it('should handle very large amounts in double jeopardy', () => {
      const { getByText } = renderComponent();
      
      // Enable double jeopardy
      fireEvent.press(getByText('No'));
      
      // Enable daily double and set large amount
      fireEvent.press(getByText('Is it a Daily Double?'));
      const textInput = getByPlaceholderText('Enter Daily Double Question $ Amount');
      fireEvent.changeText(textInput, '2000');
      
      fireEvent.press(getByText('Player 1'));
      fireEvent.press(getByText('CORRECT!'));
      
      expect(getByText('Player 1: $4000')).toBeTruthy(); // 2000 * 2
    });

    it('should handle negative amounts in daily double input', () => {
      const { getByText } = renderComponent();
      
      fireEvent.press(getByText('Is it a Daily Double?'));
      const textInput = getByPlaceholderText('Enter Daily Double Question $ Amount');
      fireEvent.changeText(textInput, '-100');
      
      expect(getByText('Question Selected: $-100')).toBeTruthy();
    });

    it('should not change scores when no player is selected', () => {
      const { getByText } = renderComponent();
      
      // Select amount but no player
      fireEvent.press(getByText('400'));
      
      // Try to mark as correct
      fireEvent.press(getByText('CORRECT!'));
      
      // Scores should remain unchanged
      expect(getByText('Player 1: $0')).toBeTruthy();
      expect(getByText('Player 2: $0')).toBeTruthy();
      expect(getByText('Player 3: $0')).toBeTruthy();
    });

    it('should not change scores when no amount is selected', () => {
      const { getByText } = renderComponent();
      
      // Select player but no amount
      fireEvent.press(getByText('Player 1'));
      
      // Try to mark as correct
      fireEvent.press(getByText('CORRECT!'));
      
      // Scores should remain unchanged
      expect(getByText('Player 1: $0')).toBeTruthy();
    });
  });

  describe('Component Props', () => {
    it('should accept custom round duration', () => {
      const { getByText } = renderComponent({ roundDuration: 180 });
      
      // Component should render without errors
      expect(getByText('Not Jeopardy')).toBeTruthy();
    });

    it('should accept custom onRoundEnd callback', () => {
      const mockOnRoundEnd = jest.fn();
      renderComponent({ onRoundEnd: mockOnRoundEnd });
      
      // Component should render without errors
      expect(mockOnRoundEnd).not.toHaveBeenCalled(); // Should not be called automatically
    });
  });
});
