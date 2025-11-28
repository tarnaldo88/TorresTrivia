import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GameState } from '../services/gameState';
import { OrientationDetector } from '../services/orientationDetector';
import { TimerManager } from '../services/timerManager';
import { FeedbackManager } from '../services/feedbackManager';
import { ItemDatabase } from '../services/itemDatabase';
import { GameItem } from '../types/index';

interface GameScreenProps {
  roundDuration?: number;
  onRoundEnd?: (finalScore: number) => void;
}

/**
 * GameScreen component - Main game interface displaying items, score, and timer
 */
export const GameScreen: React.FC<GameScreenProps> = ({
  roundDuration = 60,
  onRoundEnd,
}) => {
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

  // Handle correct guess or skip action
  const handleAction = async (action: string) => {
    const gameState = gameStateRef.current;
    const itemDatabase = itemDatabaseRef.current;
    const feedbackManager = feedbackManagerRef.current;

    if (!currentItem) {
      return;
    }

    const actionType = action === 'CORRECT' ? 'CORRECT' : 'SKIP';

    if (action === 'CORRECT') {
      gameState.registerCorrectGuess(currentItem.id);
      setScore(gameState.getCurrentScore());
    } else if (action === 'SKIP') {
      gameState.registerSkip(currentItem.id);
    }

    // Generate feedback
    feedbackManager.generateFeedback({
      type: actionType,
      timestamp: Date.now(),
      itemId: currentItem.id,
    });

    // Display next item
    try {
      const nextItem = await itemDatabase.getRandomItem();
      setCurrentItem(nextItem);
    } catch (error) {
      console.error('Failed to get next item:', error);
    }
  };

  // End the round
  const endRound = () => {
    const gameState = gameStateRef.current;
    const timerManager = timerManagerRef.current;
    const orientationDetector = orientationDetectorRef.current;

    gameState.endRound();
    timerManager.stop();
    orientationDetector.stopListening();
    setIsRoundActive(false);

    const finalScore = gameState.getCurrentScore();
    if (onRoundEnd) {
      onRoundEnd(finalScore);
    }
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
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#666',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000',
  },
  itemContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: 16,
    color: '#666',
  },
  timerValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000',
  },
});
