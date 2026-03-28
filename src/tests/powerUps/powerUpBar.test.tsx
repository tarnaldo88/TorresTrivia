import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { PowerUpBar } from '../../components/PowerUpBar';
import { PowerUpManager, PowerUpType } from '../../services/powerUpManager';
import { TriviaQuestion } from '../../types/index';

// Mock Alert
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  Alert: {
    alert: jest.fn(),
  },
  Vibration: {
    vibrate: jest.fn(),
  },
}));

// Mock trivia question
const mockTriviaQuestion: TriviaQuestion = {
  id: 'test-question-1',
  question: 'What is the capital of France?',
  answer: 'Paris',
  category: 'Geography',
  difficulty: 'Easy',
};

describe('PowerUpBar Component', () => {
  const testPlayerId = 'test-player-123';
  let powerUpManager: PowerUpManager;
  let mockOnPowerUpUsed: jest.Mock;
  let mockOnTimeFreezeActive: jest.Mock;
  let mockOnDoublePointsActive: jest.Mock;
  let mockOnSkipPassActive: jest.Mock;
  let mockOnFiftyFiftyActive: jest.Mock;

  beforeEach(() => {
    powerUpManager = new PowerUpManager();
    mockOnPowerUpUsed = jest.fn();
    mockOnTimeFreezeActive = jest.fn();
    mockOnDoublePointsActive = jest.fn();
    mockOnSkipPassActive = jest.fn();
    mockOnFiftyFiftyActive = jest.fn();
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    powerUpManager.resetPlayerInventory(testPlayerId);
  });

  const renderPowerUpBar = (props = {}) => {
    return render(
      <PowerUpBar
        playerId={testPlayerId}
        currentQuestion={mockTriviaQuestion}
        currentScore={100}
        timeRemaining={60}
        onPowerUpUsed={mockOnPowerUpUsed}
        onTimeFreezeActive={mockOnTimeFreezeActive}
        onDoublePointsActive={mockOnDoublePointsActive}
        onSkipPassActive={mockOnSkipPassActive}
        onFiftyFiftyActive={mockOnFiftyFiftyActive}
        disabled={false}
        {...props}
      />
    );
  };

  describe('Rendering', () => {
    it('should render available power-ups correctly', () => {
      const { getByText, queryByText } = renderPowerUpBar();
      
      // Should show basic power-ups that are unlocked by default
      expect(getByText('Power-Ups')).toBeTruthy();
      expect(getByText('50/50')).toBeTruthy();
      expect(getByText('Skip Pass')).toBeTruthy();
      
      // Should not show locked power-ups
      expect(queryByText('Time Freeze')).toBeFalsy();
      expect(queryByText('Double Points')).toBeFalsy();
    });

    it('should display correct power-up uses', () => {
      const { getAllByText } = renderPowerUpBar();
      
      // Should show uses for each available power-up
      const usesTexts = getAllByText(/\d+/);
      expect(usesTexts).toContain('3'); // 50/50 has 3 uses
      expect(usesTexts).toContain('1'); // Skip Pass has 1 use
    });

    it('should not render when no power-ups are available', () => {
      // Use all available power-ups
      powerUpManager.usePowerUp(testPlayerId, PowerUpType.FIFTY_FIFTY, { question: mockTriviaQuestion });
      powerUpManager.usePowerUp(testPlayerId, PowerUpType.FIFTY_FIFTY, { question: mockTriviaQuestion });
      powerUpManager.usePowerUp(testPlayerId, PowerUpType.FIFTY_FIFTY, { question: mockTriviaQuestion });
      powerUpManager.usePowerUp(testPlayerId, PowerUpType.SKIP_PASS);
      
      const { queryByText } = renderPowerUpBar();
      
      expect(queryByText('Power-Ups')).toBeFalsy();
    });

    it('should sort power-ups by rarity and name', () => {
      // Unlock all power-ups for testing
      powerUpManager.unlockPowerUp(testPlayerId, PowerUpType.TIME_FREEZE);
      powerUpManager.unlockPowerUp(testPlayerId, PowerUpType.DOUBLE_POINTS);
      
      const { getAllByText } = renderPowerUpBar();
      
      // Should show all power-ups
      expect(getAllByText(/50\/50|Time Freeze|Double Points|Skip Pass/)).toHaveLength(4);
    });
  });

  describe('Power-Up Usage', () => {
    it('should use 50/50 power-up when pressed', async () => {
      const { getByText } = renderPowerUpBar();
      
      const fiftyFiftyButton = getByText('50/50').parent;
      fireEvent.press(fiftyFiftyButton!);
      
      await waitFor(() => {
        expect(mockOnPowerUpUsed).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            type: PowerUpType.FIFTY_FIFTY,
            message: 'Two wrong answers removed!',
          })
        );
        expect(mockOnFiftyFiftyActive).toHaveBeenCalledWith(
          expect.objectContaining({
            removedAnswers: expect.any(Array),
            remainingAnswers: expect.any(Array),
            correctAnswer: mockTriviaQuestion.answer,
          })
        );
      });
    });

    it('should use skip pass power-up when pressed', async () => {
      const { getByText } = renderPowerUpBar();
      
      const skipPassButton = getByText('Skip Pass').parent;
      fireEvent.press(skipPassButton!);
      
      await waitFor(() => {
        expect(mockOnPowerUpUsed).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            type: PowerUpType.SKIP_PASS,
            message: 'Free skip activated! No penalty for next skip.',
          })
        );
        expect(mockOnSkipPassActive).toHaveBeenCalled();
      });
    });

    it('should show confirmation dialog for score-related power-ups', async () => {
      // Unlock double points for testing
      powerUpManager.unlockPowerUp(testPlayerId, PowerUpType.DOUBLE_POINTS);
      
      const { getByText } = renderPowerUpBar();
      
      const doublePointsButton = getByText('Double Points').parent;
      fireEvent.press(doublePointsButton!);
      
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Use Double Points?',
          'Next question worth 2x points',
          expect.arrayContaining([
            expect.objectContaining({ text: 'Cancel' }),
            expect.objectContaining({ text: 'Use' }),
          ])
        );
      });
    });

    it('should trigger haptic feedback on power-up use', async () => {
      const { Vibration } = require('react-native');
      const { getByText } = renderPowerUpBar();
      
      const fiftyFiftyButton = getByText('50/50').parent;
      fireEvent.press(fiftyFiftyButton!);
      
      await waitFor(() => {
        expect(Vibration.vibrate).toHaveBeenCalledWith(100);
      });
    });

    it('should update uses after power-up consumption', async () => {
      const { getByText, getAllByText } = renderPowerUpBar();
      
      // Initial uses should be 3 for 50/50
      expect(getAllByText('3')).toBeTruthy();
      
      const fiftyFiftyButton = getByText('50/50').parent;
      fireEvent.press(fiftyFiftyButton!);
      
      await waitFor(() => {
        // Uses should decrease to 2
        const updatedUses = getAllByText(/\d+/);
        expect(updatedUses).toContain('2');
      });
    });
  });

  describe('Active Power-Ups', () => {
    it('should show active indicator for active power-ups', async () => {
      // First use a power-up to make it active
      powerUpManager.usePowerUp(testPlayerId, PowerUpType.SKIP_PASS);
      
      const { getByText } = renderPowerUpBar();
      
      await waitFor(() => {
        expect(getByText('ACTIVE')).toBeTruthy();
      });
    });

    it('should disable buttons for active power-ups', async () => {
      // Activate skip pass
      powerUpManager.usePowerUp(testPlayerId, PowerUpType.SKIP_PASS);
      
      const { getByText } = renderPowerUpBar();
      
      await waitFor(() => {
        const skipPassButton = getByText('Skip Pass').parent;
        expect(skipPassButton?.props.disabled).toBe(true);
      });
    });

    it('should show alert when trying to use already active power-up', async () => {
      // Activate skip pass
      powerUpManager.usePowerUp(testPlayerId, PowerUpType.SKIP_PASS);
      
      const { getByText } = renderPowerUpBar();
      
      const skipPassButton = getByText('Skip Pass').parent;
      fireEvent.press(skipPassButton!);
      
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Power-Up Active',
          'This power-up is already active!'
        );
      });
    });
  });

  describe('Disabled State', () => {
    it('should disable all power-ups when disabled prop is true', () => {
      const { getByText } = renderPowerUpBar({ disabled: true });
      
      const powerUpButtons = getByText('50/50').parent;
      expect(powerUpButtons?.props.disabled).toBe(true);
    });

    it('should not trigger callbacks when disabled', async () => {
      const { getByText } = renderPowerUpBar({ disabled: true });
      
      const fiftyFiftyButton = getByText('50/50').parent;
      fireEvent.press(fiftyFiftyButton!);
      
      // Wait a bit to ensure no async callbacks are triggered
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(mockOnPowerUpUsed).not.toHaveBeenCalled();
      expect(mockOnFiftyFiftyActive).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should show error alert when power-up use fails', async () => {
      // Try to use power-up without question for 50/50
      const { getByText } = renderPowerUpBar({ currentQuestion: undefined });
      
      const fiftyFiftyButton = getByText('50/50').parent;
      fireEvent.press(fiftyFiftyButton!);
      
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Power-Up Failed',
          'No active question'
        );
      });
    });

    it('should handle power-ups with no remaining uses', async () => {
      // Use all 50/50 power-ups
      powerUpManager.usePowerUp(testPlayerId, PowerUpType.FIFTY_FIFTY, { question: mockTriviaQuestion });
      powerUpManager.usePowerUp(testPlayerId, PowerUpType.FIFTY_FIFTY, { question: mockTriviaQuestion });
      powerUpManager.usePowerUp(testPlayerId, PowerUpType.FIFTY_FIFTY, { question: mockTriviaQuestion });
      
      const { getByText } = renderPowerUpBar();
      
      const fiftyFiftyButton = getByText('50/50').parent;
      fireEvent.press(fiftyFiftyButton!);
      
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Power-Up Failed',
          'No uses remaining'
        );
      });
    });

    it('should handle cooldown periods', async () => {
      // Unlock and use time freeze (has cooldown)
      powerUpManager.unlockPowerUp(testPlayerId, PowerUpType.TIME_FREEZE);
      powerUpManager.usePowerUp(testPlayerId, PowerUpType.TIME_FREEZE);
      
      const { getByText } = renderPowerUpBar();
      
      const timeFreezeButton = getByText('Time Freeze').parent;
      fireEvent.press(timeFreezeButton!);
      
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Power-Up Failed',
          expect.stringContaining('on cooldown')
        );
      });
    });
  });

  describe('Visual Effects and Animations', () => {
    it('should show power-up effect animation on successful use', async () => {
      const { getByText, queryByText } = renderPowerUpBar();
      
      const fiftyFiftyButton = getByText('50/50').parent;
      fireEvent.press(fiftyFiftyButton!);
      
      // Should show effect message
      await waitFor(() => {
        expect(queryByText('Two wrong answers removed!')).toBeTruthy();
        expect(queryByText('🎯')).toBeTruthy();
      });
    });

    it('should hide effect after animation duration', async () => {
      const { getByText, queryByText } = renderPowerUpBar();
      
      const fiftyFiftyButton = getByText('50/50').parent;
      fireEvent.press(fiftyFiftyButton!);
      
      // Effect should be visible initially
      await waitFor(() => {
        expect(queryByText('Two wrong answers removed!')).toBeTruthy();
      });
      
      // Effect should disappear after 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2100));
      
      expect(queryByText('Two wrong answers removed!')).toBeFalsy();
    });

    it('should apply rarity-based colors to power-up buttons', () => {
      // Unlock rare power-ups
      powerUpManager.unlockPowerUp(testPlayerId, PowerUpType.TIME_FREEZE);
      powerUpManager.unlockPowerUp(testPlayerId, PowerUpType.DOUBLE_POINTS);
      
      const { getByText } = renderPowerUpBar();
      
      // Should render buttons with different border colors based on rarity
      const timeFreezeButton = getByText('Time Freeze').parent;
      const doublePointsButton = getByText('Double Points').parent;
      const fiftyFiftyButton = getByText('50/50').parent;
      
      // Rare power-ups should have blue border
      expect(timeFreezeButton?.props.style.borderColor).toBe('#3498DB');
      expect(doublePointsButton?.props.style.borderColor).toBe('#3498DB');
      
      // Common power-ups should have gray border
      expect(fiftyFiftyButton?.props.style.borderColor).toBe('#95A5A6');
    });
  });

  describe('Context Integration', () => {
    it('should pass current question to power-up usage', async () => {
      const customQuestion: TriviaQuestion = {
        id: 'custom-question',
        question: 'Custom question?',
        answer: 'Custom answer',
        category: 'Custom',
        difficulty: 'Medium',
      };
      
      const { getByText } = renderPowerUpBar({ currentQuestion: customQuestion });
      
      const fiftyFiftyButton = getByText('50/50').parent;
      fireEvent.press(fiftyFiftyButton!);
      
      await waitFor(() => {
        expect(mockOnFiftyFiftyActive).toHaveBeenCalledWith(
          expect.objectContaining({
            correctAnswer: 'Custom answer',
          })
        );
      });
    });

    it('should pass current score to power-up usage', async () => {
      powerUpManager.unlockPowerUp(testPlayerId, PowerUpType.DOUBLE_POINTS);
      
      const { getByText } = renderPowerUpBar({ currentScore: 250 });
      
      // Simulate confirming the dialog
      (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
        if (buttons && buttons[1]?.text === 'Use') {
          buttons[1].onPress?.();
        }
      });
      
      const doublePointsButton = getByText('Double Points').parent;
      fireEvent.press(doublePointsButton!);
      
      await waitFor(() => {
        expect(mockOnDoublePointsActive).toHaveBeenCalledWith(2);
      });
    });

    it('should pass time remaining to power-up usage', async () => {
      powerUpManager.unlockPowerUp(testPlayerId, PowerUpType.TIME_FREEZE);
      
      const { getByText } = renderPowerUpBar({ timeRemaining: 45 });
      
      // Simulate confirming the dialog
      (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
        if (buttons && buttons[1]?.text === 'Use') {
          buttons[1].onPress?.();
        }
      });
      
      const timeFreezeButton = getByText('Time Freeze').parent;
      fireEvent.press(timeFreezeButton!);
      
      await waitFor(() => {
        expect(mockOnTimeFreezeActive).toHaveBeenCalledWith(10);
      });
    });
  });

  describe('Component Lifecycle', () => {
    it('should refresh available power-ups after use', async () => {
      const { getByText, queryByText, rerender } = renderPowerUpBar();
      
      // Initially should show 50/50
      expect(getByText('50/50')).toBeTruthy();
      
      // Use the power-up
      const fiftyFiftyButton = getByText('50/50').parent;
      fireEvent.press(fiftyFiftyButton!);
      
      await waitFor(() => {
        expect(mockOnPowerUpUsed).toHaveBeenCalled();
      });
      
      // Rerender to check if component updates
      rerender(
        <PowerUpBar
          playerId={testPlayerId}
          currentQuestion={mockTriviaQuestion}
          currentScore={100}
          timeRemaining={60}
          onPowerUpUsed={mockOnPowerUpUsed}
          onTimeFreezeActive={mockOnTimeFreezeActive}
          onDoublePointsActive={mockOnDoublePointsActive}
          onSkipPassActive={mockOnSkipPassActive}
          onFiftyFiftyActive={mockOnFiftyFiftyActive}
        />
      );
      
      // Should still show 50/50 but with reduced uses
      expect(getByText('50/50')).toBeTruthy();
    });

    it('should handle player ID changes correctly', () => {
      const { rerender } = renderPowerUpBar({ playerId: 'player-1' });
      
      // Change player ID
      rerender(
        <PowerUpBar
          playerId="player-2"
          currentQuestion={mockTriviaQuestion}
          currentScore={100}
          timeRemaining={60}
          onPowerUpUsed={mockOnPowerUpUsed}
          onTimeFreezeActive={mockOnTimeFreezeActive}
          onDoublePointsActive={mockOnDoublePointsActive}
          onSkipPassActive={mockOnSkipPassActive}
          onFiftyFiftyActive={mockOnFiftyFiftyActive}
        />
      );
      
      // Should render without errors for new player
      expect(mockOnPowerUpUsed).not.toHaveBeenCalled();
    });
  });
});
