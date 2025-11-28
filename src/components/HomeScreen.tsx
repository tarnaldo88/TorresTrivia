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
        <Text style={styles.text}>test</Text>
        <View style={styles.buttonGroup}>        
            <TouchableOpacity style={styles.button}>
                <Text style={styles.text}>Head's Up</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
                <Text style={styles.text}>Trivia Questions</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
                <Text style={styles.text}>Jeopardy</Text>
            </TouchableOpacity>
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
    text: {
        justifyContent: 'center',
        color:"#fff",
        fontSize:25,
    },
    image: {
        flex: 1,
        justifyContent: 'center',
    },
    scrollContent: {
        flex: 1,
        // padding: 20,
        // backgroundColor: "#221e27",
    },
    button: {
        borderRadius: 10,
        backgroundColor:"#0957ffff",
        width:'60%',
    },
    buttonGroup: {
        position: "absolute",
        bottom: "33%",       // bottom third of screen
        left: 0,
        right: 0,
        alignItems: "center", // center horizontally
        gap: 16,              // space between buttons (RN 0.71+)
    },
});
