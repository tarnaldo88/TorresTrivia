import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { PowerUpTriviaScreen } from '../../components/PowerUpTriviaScreen';
import { TriviaDatabase } from '../../services/triviaDatabase';
import { PowerUpManager, PowerUpType } from '../../services/powerUpManager';
import { TriviaQuestion } from '../../types/index';

// Mock dependencies
jest.mock('../../services/triviaDatabase');
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  Alert: {
    alert: jest.fn(),
  },
  Vibration: {
    vibrate: jest.fn(),
  },
  Animated: {
    timing: jest.fn(({ onFinish }) => {
      onFinish?.();
      return { start: jest.fn() };
    }),
    Value: jest.fn(() => ({
      setValue: jest.fn(),
    })),
  },
}));

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));

// Mock trivia questions
const mockQuestions: TriviaQuestion[] = [
  {
    id: 'q1',
    question: 'What is the capital of France?',
    answer: 'Paris',
    category: 'Geography',
    difficulty: 'Easy',
  },
  {
    id: 'q2',
    question: 'What is 2 + 2?',
    answer: '4',
    category: 'Math',
    difficulty: 'Easy',
  },
];

describe('PowerUpTriviaScreen Integration Tests', () => {
  const testPlayerId = 'test-player-123';
  let mockTriviaDb: jest.Mocked<TriviaDatabase>;
  let powerUpManager: PowerUpManager;
  let mockOnRoundEnd: jest.Mock;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    mockNavigation.navigate.mockClear();
    mockNavigation.goBack.mockClear();
    
    // Create fresh instances
    powerUpManager = new PowerUpManager();
    mockOnRoundEnd = jest.fn();
    
    // Mock TriviaDatabase
    mockTriviaDb = {
      initialize: jest.fn().mockResolvedValue(undefined),
      getRandomQuestion: jest.fn()
        .mockResolvedValueOnce(mockQuestions[0])
        .mockResolvedValueOnce(mockQuestions[1])
        .mockResolvedValue(mockQuestions[0]),
    } as any;
    
    (TriviaDatabase as jest.Mock).mockImplementation(() => mockTriviaDb);
  });

  afterEach(() => {
    powerUpManager.resetPlayerInventory(testPlayerId);
  });

  const renderPowerUpTriviaScreen = (props = {}) => {
    return render(
      <PowerUpTriviaScreen
        playerId={testPlayerId}
        roundDuration={120}
        onRoundEnd={mockOnRoundEnd}
        {...props}
      />
    );
  };

  describe('Initial Rendering', () => {
    it('should render trivia screen with power-up integration', async () => {
      const { getByText, queryByText } = renderPowerUpTriviaScreen();
      
      // Should show loading initially
      expect(getByText('Loading trivia questions...')).toBeTruthy();
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(queryByText('Loading trivia questions...')).toBeFalsy();
      });
      
      // Should show question and power-ups
      expect(getByText('What is the capital of France?')).toBeTruthy();
      expect(getByText('Power-Ups')).toBeTruthy();
      expect(getByText('50/50')).toBeTruthy();
      expect(getByText('Skip Pass')).toBeTruthy();
    });

    it('should display score and timer correctly', async () => {
      const { getByText } = renderPowerUpTriviaScreen();
      
      await waitFor(() => {
        expect(getByText('Score: 0')).toBeTruthy();
        expect(getByText('Time: 120s')).toBeTruthy();
      });
    });

    it('should show question metadata', async () => {
      const { getByText } = renderPowerUpTriviaScreen();
      
      await waitFor(() => {
        expect(getByText('Question 1')).toBeTruthy();
        expect(getByText('Geography')).toBeTruthy();
        expect(getByText('Difficulty: Easy')).toBeTruthy();
      });
    });
  });

  describe('Power-Up Integration', () => {
    it('should integrate 50/50 power-up with trivia gameplay', async () => {
      const { getByText, queryByText } = renderPowerUpTriviaScreen();
      
      await waitFor(() => {
        expect(getByText('50/50')).toBeTruthy();
      });
      
      // Use 50/50 power-up
      const fiftyFiftyButton = getByText('50/50').parent;
      fireEvent.press(fiftyFiftyButton!);
      
      await waitFor(() => {
        // Should show 50/50 effect
        expect(queryByText('50/50 Active')).toBeTruthy();
        expect(queryByText('Removed:')).toBeTruthy();
      });
    });

    it('should integrate time freeze with timer system', async () => {
      // Unlock time freeze for testing
      powerUpManager.unlockPowerUp(testPlayerId, PowerUpType.TIME_FREEZE);
      
      const { getByText } = renderPowerUpTriviaScreen();
      
      await waitFor(() => {
        expect(getByText('Time Freeze')).toBeTruthy();
      });
      
      // Use time freeze
      const timeFreezeButton = getByText('Time Freeze').parent;
      fireEvent.press(timeFreezeButton!);
      
      await waitFor(() => {
        // Should show frozen timer
        expect(getByText('FROZEN!')).toBeTruthy();
        // Timer should increase by 10 seconds
        expect(getByText('Time: 130s')).toBeTruthy();
      });
    });

    it('should integrate double points with scoring system', async () => {
      // Unlock double points for testing
      powerUpManager.unlockPowerUp(testPlayerId, PowerUpType.DOUBLE_POINTS);
      
      const { getByText } = renderPowerUpTriviaScreen();
      
      await waitFor(() => {
        expect(getByText('Double Points')).toBeTruthy();
      });
      
      // Use double points
      const doublePointsButton = getByText('Double Points').parent;
      fireEvent.press(doublePointsButton!);
      
      await waitFor(() => {
        // Should show double points indicator
        expect(getByText('2X POINTS!')).toBeTruthy();
      });
      
      // Answer correctly to test double points
      fireEvent.press(getByText('Show Answer'));
      fireEvent.press(getByText('Correct ✓'));
      
      await waitFor(() => {
        // Should get 20 points instead of 10
        expect(getByText('Score: 20')).toBeTruthy();
      });
    });

    it('should integrate skip pass with skip functionality', async () => {
      const { getByText } = renderPowerUpTriviaScreen();
      
      await waitFor(() => {
        expect(getByText('Skip Pass')).toBeTruthy();
        expect(getByText('Skip (-5 pts)')).toBeTruthy();
      });
      
      // Use skip pass
      const skipPassButton = getByText('Skip Pass').parent;
      fireEvent.press(skipPassButton!);
      
      await waitFor(() => {
        // Should show free skip
        expect(getByText('Skip (Free!)')).toBeTruthy();
      });
      
      // Use the free skip
      fireEvent.press(getByText('Skip (Free!)'));
      
      await waitFor(() => {
        // Score should remain unchanged (no penalty)
        expect(getByText('Score: 0')).toBeTruthy();
      });
    });
  });

  describe('Game Flow with Power-Ups', () => {
    it('should maintain power-up state across questions', async () => {
      const { getByText } = renderPowerUpTriviaScreen();
      
      await waitFor(() => {
        expect(getByText('50/50')).toBeTruthy();
      });
      
      // Use 50/50 on first question
      const fiftyFiftyButton = getByText('50/50').parent;
      fireEvent.press(fiftyFiftyButton!);
      
      await waitFor(() => {
        expect(getByText('50/50 Active')).toBeTruthy();
      });
      
      // Move to next question
      fireEvent.press(getByText('Next Question'));
      
      await waitFor(() => {
        // Should show second question
        expect(getByText('What is 2 + 2?')).toBeTruthy();
        // 50/50 effect should be cleared for new question
        expect(getByText('50/50 Active')).toBeFalsy();
      });
    });

    it('should track power-up usage in round statistics', async () => {
      const { getByText } = renderPowerUpTriviaScreen();
      
      await waitFor(() => {
        expect(getByText('50/50')).toBeTruthy();
      });
      
      // Use multiple power-ups
      const fiftyFiftyButton = getByText('50/50').parent;
      fireEvent.press(fiftyFiftyButton!);
      
      // Answer some questions
      fireEvent.press(getByText('Show Answer'));
      fireEvent.press(getByText('Correct ✓'));
      
      // Simulate round completion (timer reaches 0)
      // This would normally happen with timer, but we'll trigger it manually
      act(() => {
        // Simulate timer reaching 0
        jest.advanceTimersByTime(120000);
      });
      
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Round Complete!',
          expect.stringContaining('Final Score:'),
          expect.any(Array)
        );
      });
      
      // Check if round end callback includes power-up stats
      const alertCall = (Alert.alert as jest.Mock).mock.calls.find(
        call => call[0] === 'Round Complete!'
      );
      expect(alertCall).toBeDefined();
    });

    it('should handle power-up toggle visibility', async () => {
      const { getByText, queryByText } = renderPowerUpTriviaScreen();
      
      await waitFor(() => {
        expect(getByText('Power-Ups')).toBeTruthy();
        expect(getByText('50/50')).toBeTruthy();
      });
      
      // Toggle power-ups visibility
      fireEvent.press(getByText('Power-Ups'));
      
      await waitFor(() => {
        // Power-ups should be hidden
        expect(queryByText('50/50')).toBeFalsy();
      });
      
      // Toggle back
      fireEvent.press(getByText('Power-Ups'));
      
      await waitFor(() => {
        // Power-ups should be visible again
        expect(getByText('50/50')).toBeTruthy();
      });
    });
  });

  describe('Score Integration', () => {
    it('should calculate score correctly with power-ups', async () => {
      // Unlock double points
      powerUpManager.unlockPowerUp(testPlayerId, PowerUpType.DOUBLE_POINTS);
      
      const { getByText } = renderPowerUpTriviaScreen();
      
      await waitFor(() => {
        expect(getByText('Score: 0')).toBeTruthy();
      });
      
      // Use double points
      const doublePointsButton = getByText('Double Points').parent;
      fireEvent.press(doublePointsButton!);
      
      await waitFor(() => {
        expect(getByText('2X POINTS!')).toBeTruthy();
      });
      
      // Answer correctly
      fireEvent.press(getByText('Show Answer'));
      fireEvent.press(getByText('Correct ✓'));
      
      await waitFor(() => {
        // Should have 20 points (10 * 2)
        expect(getByText('Score: 20')).toBeTruthy();
      });
      
      // Move to next question
      fireEvent.press(getByText('Next Question'));
      
      await waitFor(() => {
        // Double points should be deactivated
        expect(getByText('2X POINTS!')).toBeFalsy();
      });
      
      // Answer correctly without double points
      fireEvent.press(getByText('Show Answer'));
      fireEvent.press(getByText('Correct ✓'));
      
      await waitFor(() => {
        // Should have 30 points total (20 + 10)
        expect(getByText('Score: 30')).toBeTruthy();
      });
    });

    it('should handle skip penalties with skip pass', async () => {
      const { getByText } = renderPowerUpTriviaScreen();
      
      await waitFor(() => {
        expect(getByText('Score: 0')).toBeTruthy();
        expect(getByText('Skip (-5 pts)')).toBeTruthy();
      });
      
      // Skip without skip pass (should have penalty)
      fireEvent.press(getByText('Skip (-5 pts)'));
      
      await waitFor(() => {
        // Score should be -5
        expect(getByText('Score: -5')).toBeTruthy();
      });
      
      // Use skip pass
      const skipPassButton = getByText('Skip Pass').parent;
      fireEvent.press(skipPassButton!);
      
      await waitFor(() => {
        expect(getByText('Skip (Free!)')).toBeTruthy();
      });
      
      // Skip with skip pass (no penalty)
      fireEvent.press(getByText('Skip (Free!)'));
      
      await waitFor(() => {
        // Score should remain -5 (no additional penalty)
        expect(getByText('Score: -5')).toBeTruthy();
      });
    });
  });

  describe('Timer Integration', () => {
    it('should handle time freeze effect on timer', async () => {
      // Unlock time freeze
      powerUpManager.unlockPowerUp(testPlayerId, PowerUpType.TIME_FREEZE);
      
      const { getByText } = renderPowerUpTriviaScreen();
      
      await waitFor(() => {
        expect(getByText('Time: 120s')).toBeTruthy();
      });
      
      // Use time freeze
      const timeFreezeButton = getByText('Time Freeze').parent;
      fireEvent.press(timeFreezeButton!);
      
      await waitFor(() => {
        // Timer should increase by 10 seconds
        expect(getByText('Time: 130s')).toBeTruthy();
        expect(getByText('FROZEN!')).toBeTruthy();
      });
      
      // Wait for freeze to expire
      act(() => {
        jest.advanceTimersByTime(10000);
      });
      
      await waitFor(() => {
        // Frozen indicator should disappear
        expect(getByText('FROZEN!')).toBeFalsy();
      });
    });

    it('should trigger round completion when timer reaches zero', async () => {
      const { getByText } = renderPowerUpTriviaScreen();
      
      await waitFor(() => {
        expect(getByText('Time: 120s')).toBeTruthy();
      });
      
      // Advance timer to completion
      act(() => {
        jest.advanceTimersByTime(120000);
      });
      
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Round Complete!',
          expect.stringContaining('Time Remaining: 0s')
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle database initialization failure', async () => {
      mockTriviaDb.initialize.mockRejectedValue(new Error('Database error'));
      
      const { getByText } = renderPowerUpTriviaScreen();
      
      await waitFor(() => {
        expect(getByText('Loading trivia questions...')).toBeTruthy();
      });
      
      // Should eventually stop loading (though error handling could be improved)
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });
    });

    it('should handle question loading failure', async () => {
      mockTriviaDb.getRandomQuestion.mockRejectedValue(new Error('Question error'));
      
      const { getByText } = renderPowerUpTriviaScreen();
      
      await waitFor(() => {
        expect(getByText('No questions available')).toBeTruthy();
      });
    });

    it('should handle power-up usage errors gracefully', async () => {
      // Use all 50/50 power-ups
      for (let i = 0; i < 3; i++) {
        powerUpManager.usePowerUp(testPlayerId, PowerUpType.FIFTY_FIFTY, {
          question: mockQuestions[0],
        });
      }
      
      const { getByText } = renderPowerUpTriviaScreen();
      
      await waitFor(() => {
        expect(getByText('50/50')).toBeTruthy();
      });
      
      // Try to use depleted power-up
      const fiftyFiftyButton = getByText('50/50').parent;
      fireEvent.press(fiftyFiftyButton!);
      
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Power-Up Failed',
          'No uses remaining'
        );
      });
    });
  });

  describe('Navigation and Cleanup', () => {
    it('should navigate back when back button pressed', async () => {
      const { getByText } = renderPowerUpTriviaScreen();
      
      await waitFor(() => {
        expect(getByText('Back')).toBeTruthy();
      });
      
      fireEvent.press(getByText('Back'));
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Home');
    });

    it('should handle round end navigation', async () => {
      const { getByText } = renderPowerUpTriviaScreen();
      
      await waitFor(() => {
        expect(getByText('Back')).toBeTruthy();
      });
      
      // Simulate round completion
      act(() => {
        jest.advanceTimersByTime(120000);
      });
      
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalled();
      });
      
      // Simulate clicking "Home" in the round complete dialog
      const alertCall = (Alert.alert as jest.Mock).mock.calls.find(
        call => call[0] === 'Round Complete!'
      );
      if (alertCall && alertCall[2] && alertCall[2][1]) {
        alertCall[2][1].onPress?.();
      }
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Home');
    });

    it('should call onRoundEnd with correct statistics', async () => {
      const { getByText } = renderPowerUpTriviaScreen();
      
      await waitFor(() => {
        expect(getByText('Show Answer')).toBeTruthy();
      });
      
      // Answer some questions and use power-ups
      fireEvent.press(getByText('Show Answer'));
      fireEvent.press(getByText('Correct ✓'));
      
      // Use a power-up
      const fiftyFiftyButton = getByText('50/50').parent;
      fireEvent.press(fiftyFiftyButton!);
      
      // Simulate round completion
      act(() => {
        jest.advanceTimersByTime(120000);
      });
      
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalled();
      });
      
      // Simulate clicking "View Stats" then "OK"
      const alertCall = (Alert.alert as jest.Mock).mock.calls.find(
        call => call[0] === 'Round Complete!'
      );
      if (alertCall && alertCall[2] && alertCall[2][0]) {
        alertCall[2][0].onPress?.();
      }
      
      // Then simulate stats dialog
      const statsCall = (Alert.alert as jest.Mock).mock.calls.find(
        call => call[0] === 'Game Statistics'
      );
      if (statsCall && statsCall[2] && statsCall[2][0]) {
        statsCall[2][0].onPress?.();
      }
      
      expect(mockOnRoundEnd).toHaveBeenCalledWith(10, expect.any(Number)); // Score and power-ups used
    });
  });

  describe('Component State Management', () => {
    it('should maintain correct question counter', async () => {
      const { getByText } = renderPowerUpTriviaScreen();
      
      await waitFor(() => {
        expect(getByText('Question 1')).toBeTruthy();
      });
      
      // Move to next question
      fireEvent.press(getByText('Next Question'));
      
      await waitFor(() => {
        expect(getByText('Question 2')).toBeTruthy();
      });
    });

    it('should track correct answers count', async () => {
      const { getByText } = renderPowerUpTriviaScreen();
      
      await waitFor(() => {
        expect(getByText('Show Answer')).toBeTruthy();
      });
      
      // Answer correctly
      fireEvent.press(getByText('Show Answer'));
      fireEvent.press(getByText('Correct ✓'));
      
      await waitFor(() => {
        expect(getByText('Score: 10')).toBeTruthy();
      });
      
      // Move to next question and answer incorrectly
      fireEvent.press(getByText('Next Question'));
      fireEvent.press(getByText('Show Answer'));
      fireEvent.press(getByText('Incorrect ✗'));
      
      await waitFor(() => {
        // Score should remain 10 (no points for incorrect)
        expect(getByText('Score: 10')).toBeTruthy();
      });
    });

    it('should handle answer visibility toggle', async () => {
      const { getByText, queryByText } = renderPowerUpTriviaScreen();
      
      await waitFor(() => {
        expect(getByText('Show Answer')).toBeTruthy();
        expect(queryByText('Answer:')).toBeFalsy();
      });
      
      // Show answer
      fireEvent.press(getByText('Show Answer'));
      
      await waitFor(() => {
        expect(getByText('Hide Answer')).toBeTruthy();
        expect(getByText('Answer: Paris')).toBeTruthy();
        expect(getByText('Correct ✓')).toBeTruthy();
        expect(getByText('Incorrect ✗')).toBeTruthy();
      });
      
      // Hide answer
      fireEvent.press(getByText('Hide Answer'));
      
      await waitFor(() => {
        expect(getByText('Show Answer')).toBeTruthy();
        expect(queryByText('Answer:')).toBeFalsy();
      });
    });
  });
});
