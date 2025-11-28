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
            <Image source={require('../assets/headsup.png')} style={styles.buttonImage} resizeMode="cover"/>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
            <Image source={require('../assets/trivia.png')} style={styles.buttonImage} resizeMode="cover"/>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
            <Image source={require('../assets/jeopardy.png')} style={styles.buttonImage} resizeMode="cover"/>
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

  buttonGroup: {
    position: "absolute",
    bottom: "20%",   // bottom third of screen
    left: 0,
    right: 0,
    alignItems: "center",
    gap: 16,
  },

  button: {
    width: 250,             // set the size of the button
    height: 120,
    borderRadius: 20,        // rounded edges for the button
    overflow: "hidden",      // REQUIRED: clips image to rounded edges
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0002" // optional background during loading
  },

    buttonImage: {
        width: "100%",
        height: "100%",
        borderRadius: 20,        // match parent radius (optional but helps Android)
    },
});
