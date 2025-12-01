import {useState} from 'react';  
import React from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    Image,
    ImageBackground, 
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScoreManager } from '../services/scoreManager';
import { RootStackParamList } from '../navigation/MainNavigator';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

/**
 * HomeScreen component - Main menu with score display
 */
export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [lastScore, setLastScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      loadScores();
    }, [])
  );

  const loadScores = async () => {
    try {
      const last = await ScoreManager.getLastScore();
      const high = await ScoreManager.getHighScore();
      setLastScore(last);
      setHighScore(high);
    } catch (error) {
      console.error('Failed to load scores:', error);
    }
  };

  return (    
    <ImageBackground 
      source={require('../assets/torresTrivia.png')} 
      resizeMode='cover' 
      style={styles.background}
    >
      <View style={styles.content}>
        <View style={styles.buttonGroup}>
          <View style={styles.scoreContainer}>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>Last Score</Text>
            <Text style={styles.scoreValue}>{lastScore}</Text>
          </View>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>High Score</Text>
            <Text style={styles.scoreValue}>{highScore}</Text>
          </View>
        </View>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => navigation.navigate('HeadsUp')}
          >            
            <Image source={require('../assets/headsup.png')} style={styles.buttonImage} resizeMode="cover"/>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => navigation.navigate('Trivia')}
          >
            <Image source={require('../assets/trivia.png')} style={styles.buttonImage} resizeMode="cover"/>
          </TouchableOpacity>
          {/* <TouchableOpacity 
            style={styles.button} 
            onPress={() => navigation.navigate('Jeopardy')}
          >
            <Image source={require('../assets/jeopardy.png')} style={styles.buttonImage} resizeMode="cover"/>
          </TouchableOpacity> */}
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

  scoreContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingTop: 40,
    paddingHorizontal: 20,
    gap: 20,
  },

  scoreBox: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  scoreLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },

  scoreValue: {
    color: "#4CAF50",
    fontSize: 32,
    fontWeight: "bold",
  },

  buttonGroup: {
    position: "absolute",
    bottom: "20%",
    left: 0,
    right: 0,
    alignItems: "center",
    gap: 16,
  },

  button: {
    width: 250,
    height: 120,
    borderRadius: 20,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0002"
  },

  buttonImage: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
});
