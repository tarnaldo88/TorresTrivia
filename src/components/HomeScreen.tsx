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
    
    <ImageBackground source={require('../assets/torresTrivia.png')} resizeMode='cover' style={styles.background}>
    <ScrollView style={styles.scrollContent}>    
      {/* Score Display */}
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>Last Round's Score : </Text>
        <Text style={styles.scoreValue}>{score}</Text>
      </View>

      {/* Item Display */}
      <View style={styles.itemContainer}>        
        <TouchableOpacity>
            <Text>Head's Up</Text>
        </TouchableOpacity>
      </View>

      {/* Timer Display */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerLabel}>Time</Text>
        <Text style={styles.timerValue}>
          {Math.ceil(remainingTime / 1000)}s
        </Text>
      </View>
      </ScrollView>
    </ImageBackground>
    
    
    
    
  );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        flex: 1,
        justifyContent: 'center',
    },
  scrollContent: {
    flexGrow: 1,
    justify: "center",
    padding: 20,
    // backgroundColor: "#221e27",
  },
  button: {
    borderRadius: 10,
    backgroundColor:"#fff",
  },
  
  scoreContainer: {
    alignItems: 'center',
  },
  scoreLabel: {
    marginTop:20,
    fontSize: 26,
    color: '#20e00eff',
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
