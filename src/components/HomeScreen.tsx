import React, { useState, useEffect, useRef } from 'react';  
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    Image,
    ImageBackground, 
} from 'react-native';
import { GameState } from '../services/gameState';
import { OrientationDetector } from '../services/orientationDetector';
import { TimerManager } from '../services/timerManager';
import { FeedbackManager } from '../services/feedbackManager';
import { ItemDatabase } from '../services/itemDatabase';
import { GameItem } from '../types/index';
import { GameScreen } from './GameScreen';

interface HomeScreenProps {
  roundDuration?: number;
  onRoundEnd?: (finalScore: number) => void;
}

/**
 * GameScreen component - Main game interface displaying items, score, and timer
 */
export const HomeScreen: React.FC<HomeScreenProps> = ({
  roundDuration = 60,
  onRoundEnd,
}) => {
  const [currentItem, setCurrentItem] = useState<GameItem | null>(null);
  const [score, setScore] = useState(0);
  const [remainingTime, setRemainingTime] = useState(roundDuration * 1000);
  const [isRoundActive, setIsRoundActive] = useState(false);
  const timerManagerRef = useRef<TimerManager>(new TimerManager());
  const itemDatabaseRef = useRef<ItemDatabase>(new ItemDatabase());

  // Initialize game on mount
//   useEffect(() => {
//     const initializeGame = async () => {
//       try {
//         await itemDatabaseRef.current.initialize();
        
//       } catch (error) {
//         console.error('Failed to initialize game:', error);
//       }
//     };

//     initializeGame();

//     return () => {
//     //   orientationDetectorRef.current.stopListening();
//       timerManagerRef.current.stop();
//     };
//   }, []);

  // End the round
  const endRound = () => {
    // const gameState = gameStateRef.current;
    const timerManager = timerManagerRef.current;
    

    // const finalScore = gameState.getCurrentScore();
    // if (onRoundEnd) {
    //   onRoundEnd(finalScore);
    // }
  };

  return (    
    <ImageBackground 
    source={require('../assets/torresTrivia.png')} 
    resizeMode='cover' 
    style={styles.background}
    >
    <View style={styles.content}>
        <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Head's Up</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Trivia Questions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Jeopardy</Text>
        </TouchableOpacity>
        </View>
    </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
    background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  content: {
    flex: 1,
    justifyContent: "flex-start", 
    alignItems: "center",
  },

  topText: {
    marginTop: 60,
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },

  buttonGroup: {
    position: "absolute",
    bottom: "28%",   // bottom third of screen
    left: 0,
    right: 0,
    alignItems: "center",
    gap: 16,
  },

  button: {
    backgroundColor: "#b909ff",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
  },

  buttonText: {
    color: "#fff",
    fontSize: 22,
    textAlign: "center",
  },
});
