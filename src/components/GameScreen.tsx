import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ScreenOrientation from 'expo-screen-orientation';
import { GameState } from '../services/gameState';
import { OrientationDetector } from '../services/orientationDetector';
import { TimerManager } from '../services/timerManager';
import { FeedbackManager } from '../services/feedbackManager';
import { ItemDatabase } from '../services/itemDatabase';
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

  const gameStateRef = useRef<GameState>(new GameState());
  const orientationDetectorRef = useRef<OrientationDetector>(
    new OrientationDetector()
  );
  const timerManagerRef = useRef<TimerManager>(new TimerManager());
  const feedbackManagerRef = useRef<FeedbackManager>(new FeedbackManager());
  const itemDatabaseRef = useRef<ItemDatabase>(new ItemDatabase());
  const currentItemRef = useRef<GameItem | null>(null);

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
      orientationDetectorRef.current.stopListening();
      timerManagerRef.current.stop();
    };
  }, []);

  // Start a new round
  const startRound = async () => {
    const gameState = gameStateRef.current;
    const timerManager = timerManagerRef.current;
    const orientationDetector = orientationDetectorRef.current;
    const itemDatabase = itemDatabaseRef.current;

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

    // Set up orientation detection
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
    } catch (error) {
      console.error('Failed to get first item:', error);
    }

    // Start timer
    timerManager.start();
    setIsRoundActive(true);
    setScore(0);
  };

  // Update ref whenever currentItem changes
  useEffect(() => {
    currentItemRef.current = currentItem;
  }, [currentItem]);

  // Handle correct guess or skip action
  const handleAction = async (action: string) => {
    const gameState = gameStateRef.current;
    const itemDatabase = itemDatabaseRef.current;
    const feedbackManager = feedbackManagerRef.current;
    const item = currentItemRef.current;

    console.log('GameScreen: handleAction called with action =', action, 'item =', item?.text);

    if (!item) {
      console.log('GameScreen: No current item');
      return;
    }

    const actionType = action === 'CORRECT' ? 'CORRECT' : 'SKIP';

    if (action === 'CORRECT') {
      gameState.registerCorrectGuess(item.id);
      setScore(gameState.getCurrentScore());
      console.log('GameScreen: Correct guess registered, new score =', gameState.getCurrentScore());
    } else if (action === 'SKIP') {
      gameState.registerSkip(item.id);
      console.log('GameScreen: Skip registered');
    }

    // Generate feedback
    feedbackManager.generateFeedback({
      type: actionType,
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

    gameState.endRound();
    timerManager.stop();
    orientationDetector.stopListening();
    setIsRoundActive(false);

    const finalScore = gameState.getCurrentScore();
    
    try {
      await ScoreManager.saveScore(finalScore);
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
        <Text style={styles.scoreLabel}>Score</Text>
        <Text style={styles.scoreValue}>{score}</Text>
      </View>

      {/* Item Display */}
      <View style={styles.itemContainer}>
        {currentItem && isRoundActive ? (
          <Text style={styles.itemText}>{currentItem.text}</Text>
        ) : (
          <Text style={styles.itemText}>Ready?</Text>
        )}
      </View>

      {/* Timer Display */}
      <View style={styles.timerContainer}>
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
