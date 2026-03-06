import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GameScreen } from '../../components/GameScreen';
import { 
  MockTimerManager, 
  MockOrientationDetector, 
  MockFeedbackManager, 
  MockItemDatabase, 
  MockCountdownManager,
  MockGameItemFactory,
  TestHelpers 
} from '../utils/testUtils';

// Mock the dependencies
jest.mock('expo-screen-orientation', () => ({
  lockAsync: jest.fn(),
  unlockAsync: jest.fn(),
  PlatformOrientation: {
    PORTRAIT_UP: 1,
    LANDSCAPE_LEFT: 2,
  },
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => TestHelpers.createMockNavigation(),
  useFocusEffect: jest.fn((fn) => fn()),
}));

jest.mock('../../services/gameState');
jest.mock('../../services/orientationDetector');
jest.mock('../../services/timerManager');
jest.mock('../../services/feedbackManager');
jest.mock('../../services/itemDatabase');
jest.mock('../../services/countdownManager');

describe('GameScreen Component Tests', () => {
  let mockTimerManager: MockTimerManager;
  let mockOrientationDetector: MockOrientationDetector;
  let mockFeedbackManager: MockFeedbackManager;
  let mockItemDatabase: MockItemDatabase;
  let mockCountdownManager: MockCountdownManager;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockTimerManager = new MockTimerManager();
    mockOrientationDetector = new MockOrientationDetector();
    mockFeedbackManager = new MockFeedbackManager();
    mockItemDatabase = new MockItemDatabase(MockGameItemFactory.createMockItems(10));
    mockCountdownManager = new MockCountdownManager();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const renderGameScreen = (props = {}) => {
    return render(
      <NavigationContainer>
        <GameScreen roundDuration={60} {...props} />
      </NavigationContainer>
    );
  };

  describe('Component Initialization', () => {
    it('should render without crashing', () => {
      const { getByTestId } = renderGameScreen();
      
      // GameScreen should render successfully
      expect(getByTestId('game-screen')).toBeTruthy();
    });

    it('should display initial countdown message', async () => {
      const { getByText } = renderGameScreen();
      
      await waitFor(() => {
        expect(getByText('Get Ready...')).toBeTruthy();
      });
    });

    it('should display initial score of 0', async () => {
      const { getByText } = renderGameScreen();
      
      await waitFor(() => {
        expect(getByText('0')).toBeTruthy();
      });
    });

    it('should display initial timer value', async () => {
      const { getByText } = renderGameScreen();
      
      await waitFor(() => {
        expect(getByText('60')).toBeTruthy();
      });
    });
  });

  describe('Game Flow', () => {
    it('should start game after countdown', async () => {
      const { getByText, queryByText } = renderGameScreen();
      
      // Initially shows countdown
      expect(getByText('Get Ready...')).toBeTruthy();
      
      // Simulate countdown completion
      act(() => {
        mockCountdownManager.simulateCompleteCountdown();
      });
      
      await waitFor(() => {
        expect(queryByText('Get Ready...')).toBeFalsy();
      });
    });

    it('should display first item when game starts', async () => {
      const { getByText } = renderGameScreen();
      
      // Complete countdown
      act(() => {
        mockCountdownManager.simulateCompleteCountdown();
      });
      
      await waitFor(() => {
        expect(getByText('Test Item 0')).toBeTruthy();
      });
    });

    it('should update score on correct guess', async () => {
      const { getByText } = renderGameScreen();
      
      // Start game
      act(() => {
        mockCountdownManager.simulateCompleteCountdown();
      });
      
      await waitFor(() => {
        expect(getByText('Test Item 0')).toBeTruthy();
      });
      
      // Simulate correct guess
      act(() => {
        mockOrientationDetector.simulateTiltedDown();
      });
      
      await waitFor(() => {
        expect(getByText('1')).toBeTruthy();
      });
    });

    it('should not update score on skip', async () => {
      const { getByText } = renderGameScreen();
      
      // Start game
      act(() => {
        mockCountdownManager.simulateCompleteCountdown();
      });
      
      await waitFor(() => {
        expect(getByText('Test Item 0')).toBeTruthy();
      });
      
      // Simulate skip
      act(() => {
        mockOrientationDetector.simulateUpright();
      });
      
      await waitFor(() => {
        expect(getByText('0')).toBeTruthy();
      });
    });

    it('should advance to next item after action', async () => {
      const { getByText, queryByText } = renderGameScreen();
      
      // Start game
      act(() => {
        mockCountdownManager.simulateCompleteCountdown();
      });
      
      await waitFor(() => {
        expect(getByText('Test Item 0')).toBeTruthy();
      });
      
      // Simulate correct guess
      act(() => {
        mockOrientationDetector.simulateTiltedDown();
      });
      
      await waitFor(() => {
        expect(queryByText('Test Item 0')).toBeFalsy();
        expect(getByText('Test Item 1')).toBeTruthy();
      });
    });
  });

  describe('Timer Functionality', () => {
    it('should update timer display as time passes', async () => {
      const { getByText } = renderGameScreen();
      
      // Start game
      act(() => {
        mockCountdownManager.simulateCompleteCountdown();
      });
      
      await waitFor(() => {
        expect(getByText('60')).toBeTruthy();
      });
      
      // Simulate time passing
      act(() => {
        mockTimerManager.simulateTimeElapsed(10000); // 10 seconds
      });
      
      await waitFor(() => {
        expect(getByText('50')).toBeTruthy();
      });
    });

    it('should end game when timer reaches zero', async () => {
      const { getByText, queryByText } = renderGameScreen();
      
      // Start game
      act(() => {
        mockCountdownManager.simulateCompleteCountdown();
      });
      
      await waitFor(() => {
        expect(getByText('Test Item 0')).toBeTruthy();
      });
      
      // Simulate timer completion
      act(() => {
        mockTimerManager.simulateTimerComplete();
      });
      
      await waitFor(() => {
        expect(queryByText('Test Item 0')).toBeFalsy();
      });
    });

    it('should display final score when game ends', async () => {
      const { getByText } = renderGameScreen();
      
      // Start game and get some points
      act(() => {
        mockCountdownManager.simulateCompleteCountdown();
      });
      
      await waitFor(() => {
        expect(getByText('Test Item 0')).toBeTruthy();
      });
      
      // Get some points
      act(() => {
        mockOrientationDetector.simulateTiltedDown();
        mockOrientationDetector.simulateTiltedDown();
        mockOrientationDetector.simulateTiltedDown();
      });
      
      // End game
      act(() => {
        mockTimerManager.simulateTimerComplete();
      });
      
      await waitFor(() => {
        expect(getByText('Final Score: 3')).toBeTruthy();
      });
    });
  });

  describe('Orientation Controls', () => {
    it('should register correct guess on tilt down', async () => {
      const { getByText } = renderGameScreen();
      
      // Start game
      act(() => {
        mockCountdownManager.simulateCompleteCountdown();
      });
      
      await waitFor(() => {
        expect(getByText('Test Item 0')).toBeTruthy();
      });
      
      // Simulate tilt down
      act(() => {
        mockOrientationDetector.simulateTiltedDown();
      });
      
      await waitFor(() => {
        expect(getByText('1')).toBeTruthy();
      });
    });

    it('should register skip on upright orientation', async () => {
      const { getByText } = renderGameScreen();
      
      // Start game
      act(() => {
        mockCountdownManager.simulateCompleteCountdown();
      });
      
      await waitFor(() => {
        expect(getByText('Test Item 0')).toBeTruthy();
      });
      
      // Simulate upright
      act(() => {
        mockOrientationDetector.simulateUpright();
      });
      
      await waitFor(() => {
        expect(getByText('Test Item 1')).toBeTruthy(); // Should advance to next item
      });
    });

    it('should handle rapid orientation changes', async () => {
      const { getByText } = renderGameScreen();
      
      // Start game
      act(() => {
        mockCountdownManager.simulateCompleteCountdown();
      });
      
      await waitFor(() => {
        expect(getByText('Test Item 0')).toBeTruthy();
      });
      
      // Rapid orientation changes
      act(() => {
        mockOrientationDetector.simulateTiltedDown();
        mockOrientationDetector.simulateUpright();
        mockOrientationDetector.simulateTiltedDown();
        mockOrientationDetector.simulateUpright();
      });
      
      await waitFor(() => {
        expect(getByText('2')).toBeTruthy(); // Should have 2 correct guesses
      });
    });
  });

  describe('Feedback System', () => {
    it('should play correct sound on correct guess', async () => {
      renderGameScreen();
      
      // Start game
      act(() => {
        mockCountdownManager.simulateCompleteCountdown();
      });
      
      // Simulate correct guess
      act(() => {
        mockOrientationDetector.simulateTiltedDown();
      });
      
      await waitFor(() => {
        expect(mockFeedbackManager.getFeedbackCount('correct')).toBe(1);
      });
    });

    it('should play skip sound on skip', async () => {
      renderGameScreen();
      
      // Start game
      act(() => {
        mockCountdownManager.simulateCompleteCountdown();
      });
      
      // Simulate skip
      act(() => {
        mockOrientationDetector.simulateUpright();
      });
      
      await waitFor(() => {
        expect(mockFeedbackManager.getFeedbackCount('skip')).toBe(1);
      });
    });

    it('should play game over sound when timer ends', async () => {
      renderGameScreen();
      
      // Start game
      act(() => {
        mockCountdownManager.simulateCompleteCountdown();
      });
      
      // End game
      act(() => {
        mockTimerManager.simulateTimerComplete();
      });
      
      await waitFor(() => {
        expect(mockFeedbackManager.getFeedbackCount('gameOver')).toBe(1);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle timer errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      renderGameScreen();
      
      // Simulate timer error
      act(() => {
        mockTimerManager.simulateTimerComplete();
      });
      
      await waitFor(() => {
        expect(consoleSpy).not.toHaveBeenCalled();
      });
      
      consoleSpy.mockRestore();
    });

    it('should handle orientation detector errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      renderGameScreen();
      
      // Start game
      act(() => {
        mockCountdownManager.simulateCompleteCountdown();
      });
      
      // Simulate orientation error
      act(() => {
        mockOrientationDetector.simulateOrientationChange('INVALID');
      });
      
      await waitFor(() => {
        expect(consoleSpy).not.toHaveBeenCalled();
      });
      
      consoleSpy.mockRestore();
    });

    it('should handle database errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Create database that will throw errors
      const errorDatabase = new MockItemDatabase([]);
      jest.spyOn(errorDatabase, 'getRandomItem').mockRejectedValue(new Error('Database error'));
      
      renderGameScreen();
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe('Performance Tests', () => {
    it('should handle rapid UI updates efficiently', async () => {
      const { getByText } = renderGameScreen();
      
      // Start game
      act(() => {
        mockCountdownManager.simulateCompleteCountdown();
      });
      
      const startTime = performance.now();
      
      // Simulate rapid actions
      for (let i = 0; i < 50; i++) {
        act(() => {
          mockOrientationDetector.simulateTiltedDown();
        });
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      await waitFor(() => {
        expect(getByText('50')).toBeTruthy();
      });
      
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle timer updates efficiently', async () => {
      const { getByText } = renderGameScreen();
      
      // Start game
      act(() => {
        mockCountdownManager.simulateCompleteCountdown();
      });
      
      const startTime = performance.now();
      
      // Simulate many timer updates
      for (let i = 0; i < 100; i++) {
        act(() => {
          mockTimerManager.simulateTimeElapsed(100);
        });
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(500); // Should complete within 500ms
    });
  });

  describe('Accessibility Tests', () => {
    it('should have proper accessibility labels', async () => {
      const { getByLabelText } = renderGameScreen();
      
      await waitFor(() => {
        expect(getByLabelText('Current score')).toBeTruthy();
        expect(getByLabelText('Time remaining')).toBeTruthy();
        expect(getByLabelText('Current item')).toBeTruthy();
      });
    });

    it('should announce score changes', async () => {
      const { getByText } = renderGameScreen();
      
      // Start game
      act(() => {
        mockCountdownManager.simulateCompleteCountdown();
      });
      
      // Get a point
      act(() => {
        mockOrientationDetector.simulateTiltedDown();
      });
      
      await waitFor(() => {
        expect(getByText('1')).toBeTruthy();
      });
    });
  });

  describe('Integration Tests', () => {
    it('should complete full game cycle successfully', async () => {
      const { getByText, queryByText } = renderGameScreen();
      
      // Start game
      act(() => {
        mockCountdownManager.simulateCompleteCountdown();
      });
      
      await waitFor(() => {
        expect(getByText('Test Item 0')).toBeTruthy();
      });
      
      // Play game
      act(() => {
        mockOrientationDetector.simulateTiltedDown(); // Score 1
        mockOrientationDetector.simulateUpright(); // Skip
        mockOrientationDetector.simulateTiltedDown(); // Score 2
        mockOrientationDetector.simulateTiltedDown(); // Score 3
      });
      
      // End game
      act(() => {
        mockTimerManager.simulateTimerComplete();
      });
      
      await waitFor(() => {
        expect(getByText('Final Score: 3')).toBeTruthy();
        expect(queryByText('Test Item')).toBeFalsy();
      });
    });

    it('should handle multiple rounds correctly', async () => {
      const { getByText, queryByText } = renderGameScreen();
      
      // First round
      act(() => {
        mockCountdownManager.simulateCompleteCountdown();
      });
      
      await waitFor(() => {
        expect(getByText('Test Item 0')).toBeTruthy();
      });
      
      act(() => {
        mockOrientationDetector.simulateTiltedDown();
        mockTimerManager.simulateTimerComplete();
      });
      
      await waitFor(() => {
        expect(getByText('Final Score: 1')).toBeTruthy();
      });
      
      // Second round would require navigation, which is tested separately
    });
  });
});
