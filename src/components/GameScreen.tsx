import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ScreenOrientation from 'expo-screen-orientation';
import { GameState } from '../services/gameState';
import { OrientationDetector } from '../services/orientationDetector';
import { TimerManager } from '../services/timerManager';
import { FeedbackManager } from '../services/feedbackManager';
import { ItemDatabase } from '../services/itemDatabase';
import { CountdownManager } from '../services/countdownManager';
import { ScoreManager } from '../services/scoreManager';
import { GameItem } from '../types/index';
import { RootStackParamList } from '../navigation/MainNavigator';

type GameScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'HeadsUp'>;

interface GameScreenProps {
  roundDuration?: number;
}

/**
 * GameScreen component - Main game interface displaying items, score, and timer
 */
export const GameScreen: React.FC<GameScreenProps> = ({
  roundDuration = 60,
}) => {
  const navigation = useNavigation<GameScreenNavigationProp>();
  const [currentItem, setCurrentItem] = useState<GameItem | null>(null);
  const [score, setScore] = useState(0);
  const [remainingTime, setRemainingTime] = useState(roundDuration * 1000);
  const [isRoundActive, setIsRoundActive] = useState(false);
  const [countdownMessage, setCountdownMessage] = useState<string | null>('Get Ready...'); // Get Ready... -> Go! -> START_GAME

  const gameStateRef = useRef<GameState>(new GameState());
  const orientationDetectorRef = useRef<OrientationDetector>(
    new OrientationDetector()
  );
  const timerManagerRef = useRef<TimerManager>(new TimerManager());
  const feedbackManagerRef = useRef<FeedbackManager>(new FeedbackManager());
  const itemDatabaseRef = useRef<ItemDatabase>(new ItemDatabase());
  const countdownManagerRef = useRef<CountdownManager>(new CountdownManager());
  const currentItemRef = useRef<GameItem | null>(null);
  const gameStartedRef = useRef(false);
  const lastActionTimeRef = useRef(0);

  // Lock to landscape orientation when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const lockOrientation = async () => {
        try {
          console.log('Locking to landscape');
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
        } catch (error) {
          console.error('Failed to lock orientation:', error);
        }
      };

      lockOrientation();

      return () => {
        // Lock back to portrait when leaving
        try {
          ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT).catch(console.error);
        } catch (error) {
          console.error('Failed to unlock orientation:', error);
        }
      };
    }, [])
  );

  // Initialize game on mount
  useEffect(() => {
    const initializeGame = async () => {
      try {
        await itemDatabaseRef.current.initialize();
        startRound();
      } catch (error) {
        console.error('Failed to initialize game:', error);
      }
    };

    initializeGame();

    return () => {
      console.log('GameScreen: Cleaning up - stopping listeners');
      orientationDetectorRef.current.stopListening();
      timerManagerRef.current.stop();
      countdownManagerRef.current.cleanup().catch(console.error);
    };
  }, []);

  // Stop listening when screen loses focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('GameScreen: Focused - starting game');
      return () => {
        console.log('GameScreen: Lost focus - stopping listeners');
        orientationDetectorRef.current.stopListening();
        timerManagerRef.current.stop();
      };
    }, [])
  );

  // Handle countdown message changes
  useEffect(() => {
    if (countdownMessage === 'START_GAME') {
      // Countdown sequence finished, start the actual game
      startGame();
    }
  }, [countdownMessage]);

  // Start the actual game (after countdown)
  const startGame = async () => {
    if (gameStartedRef.current) {
      console.log('GameScreen: Game already started, skipping');
      return;
    }
    gameStartedRef.current = true;

    const gameState = gameStateRef.current;
    const timerManager = timerManagerRef.current;
    const orientationDetector = orientationDetectorRef.current;
    const itemDatabase = itemDatabaseRef.current;

    console.log('GameScreen: Starting game');

    // Initialize game state
    gameState.startRound(roundDuration);
    itemDatabase.resetRound();

    // Initialize timer
    timerManager.initialize(roundDuration);
    timerManager.setOnTimerUpdate(() => {
      const remaining = timerManager.getRemainingTime();
      setRemainingTime(remaining);
    });

    timerManager.setOnRoundEnd(() => {
      endRound();
    });

    // Clear old callbacks and set up orientation detection
    orientationDetector.clearCallbacks();
    orientationDetector.onOrientationChange((action) => {
      if (!gameState.isRoundActive()) {
        return;
      }

      handleAction(action);
    });

    orientationDetector.startListening();

    // Display first item
    try {
      const item = await itemDatabase.getRandomItem();
      setCurrentItem(item);
      console.log('GameScreen: First item displayed:', item.text);
    } catch (error) {
      console.error('Failed to get first item:', error);
    }

    // Start timer
    timerManager.start();
    setIsRoundActive(true);
    setScore(0);
  };

  // Start a new round (initialize countdown)
  const startRound = async () => {
    const countdownManager = countdownManagerRef.current;
    
    // Set up countdown callback
    countdownManager.onCountdown((message) => {
      console.log('GameScreen: Countdown message:', message);
      setCountdownMessage(message);
    });

    // Start the countdown sequence with audio
    await countdownManager.startCountdown();
  };

  // Update ref whenever currentItem changes
  useEffect(() => {
    currentItemRef.current = currentItem;
  }, [currentItem]);

  // Handle correct guess or skip action
  const handleAction = async (action: string) => {
    const now = Date.now();
    
    // Debounce: ignore if action was triggered less than 1 second ago
    if (now - lastActionTimeRef.current < 1000) {
      console.log('GameScreen: Action debounced, too soon after last action');
      return;
    }
    lastActionTimeRef.current = now;

    const gameState = gameStateRef.current;
    const itemDatabase = itemDatabaseRef.current;
    const feedbackManager = feedbackManagerRef.current;
    const item = currentItemRef.current;

    console.log('GameScreen: handleAction called with action =', action, 'type =', typeof action, 'item =', item?.text);

    if (!item) {
      console.log('GameScreen: No current item');
      return;
    }

    const actionType = action?.toUpperCase?.() || action;
    console.log('GameScreen: actionType =', actionType);

    if (actionType === 'CORRECT') {
      gameState.registerCorrectGuess(item.id);
      const newScore = gameState.getCurrentScore();
      setScore(newScore);
      console.log('GameScreen: Correct guess registered, new score =', newScore);
    } else if (actionType === 'SKIP') {
      gameState.registerSkip(item.id);
      console.log('GameScreen: Skip registered');
    } else {
      console.log('GameScreen: Unknown action type:', actionType);
    }

    // Generate feedback
    feedbackManager.generateFeedback({
      type: actionType as 'CORRECT' | 'SKIP',
      timestamp: Date.now(),
      itemId: item.id,
    });

    // Display next item
    try {
      const nextItem = await itemDatabase.getRandomItem();
      setCurrentItem(nextItem);
      console.log('GameScreen: Next item displayed:', nextItem.text);
    } catch (error) {
      console.error('Failed to get next item:', error);
    }
  };

  // End the round
  const endRound = async () => {
    const gameState = gameStateRef.current;
    const timerManager = timerManagerRef.current;
    const orientationDetector = orientationDetectorRef.current;

    console.log('GameScreen: Ending round');
    gameState.endRound();
    timerManager.stop();
    orientationDetector.stopListening();
    setIsRoundActive(false);

    const finalScore = gameState.getCurrentScore();
    console.log('GameScreen: Final score =', finalScore);
    
    try {
      await ScoreManager.saveScore(finalScore);
      console.log('GameScreen: Score saved successfully');
    } catch (error) {
      console.error('Failed to save score:', error);
    }

    // Navigate back to home
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      {/* Score Display */}
      <View style={styles.scoreContainer}>
      <TouchableOpacity onPress={() => {handleAction("SKIP")}} style={styles.skipBtn}>
        <Text style={styles.skipTxt}>Skip</Text>
      </TouchableOpacity>
        <Text style={styles.scoreLabel}>Score</Text>
        <Text style={styles.scoreValue}>{score}</Text>
      </View>

      {/* Item Display */}
      <View style={styles.itemContainer}>
        {countdownMessage !== null ? (
          <Text style={styles.countdownText}>
            {countdownMessage}
          </Text>
        ) : currentItem && isRoundActive ? (
          <Text style={styles.itemText}>{currentItem.text}</Text>
        ) : (
          <Text style={styles.itemText}>Ready?</Text>
        )}
      </View>

      {/* Timer Display */}
      <View style={styles.timerContainer}>
        <TouchableOpacity onPress={() => {handleAction("CORRECT")}} style={styles.correctBtn}>
          <Text style={styles.correctTxt}>Correct</Text>
        </TouchableOpacity>
        <Text style={styles.timerLabel}>Time</Text>
        <Text style={styles.timerValue}>
          {Math.ceil(remainingTime / 1000)}s
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  skipBtn: {
    backgroundColor:'rgba(245, 7, 67, 0.67)',
    width:200,
    height:250,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipTxt:{
    color:"#ffff",
    fontSize: 40,
  },
  correctBtn: {
    backgroundColor:'rgba(5, 223, 41, 0.67)',
    width:200,
    height:250,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  correctTxt:{
    color:"#ffff",
    fontSize: 40,
  },
  scoreContainer: {
    alignItems: 'center',
    minWidth: 100,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  itemContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  itemText: {
    fontSize: 72,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
  },
  countdownText: {
    fontSize: 120,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#4CAF50',
  },
  timerContainer: {
    alignItems: 'center',
    minWidth: 100,
  },
  timerLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  timerValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
});
