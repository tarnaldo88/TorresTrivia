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
import { useTeams } from '../context/TeamContext';
import { RootStackParamList } from '../navigation/MainNavigator';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;
type GameMode = 'noTeams' | 'teamMode';

/**
 * HomeScreen component - Main menu with score display
 */
export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { selectedTeams } = useTeams();
  const [lastScore, setLastScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameMode, setGameMode] = useState<GameMode>('noTeams');

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

  const resetScore = async () =>{
    try{
      await ScoreManager.resetHighScore();
      // Reload scores to update the display
      await loadScores();
    } catch (error) {
      console.error('Failed to reset scores', error);
    }
  };

  const handleGameModeChange = (mode: GameMode) => {
    setGameMode(mode);
  };

  const handleStartGame = async (modeOfGame: GameMode) => {
    try {
      // Store game mode for use in game screens if needed
      // This function can be extended to initialize game state
      const newLastScore = await ScoreManager.getLastScore();
      const newHighScore = await ScoreManager.getHighScore();
      setLastScore(newLastScore);
      setHighScore(newHighScore);
    } catch (error) {
      console.error('Failed to start game', error);
    }
  };

  return (    
    <ImageBackground 
      source={require('../assets/torresTrivia.png')} 
      resizeMode='cover' 
      style={styles.background}
    >
      <View style={styles.content}>
      {/* <View style={styles.scoreBox}>
        <Text style={styles.scoreTitle}>Choose Game Mode:</Text>
        <TouchableOpacity
          style={gameMode === 'noTeams' ? styles.button : styles.button}
          onPress={() => handleGameModeChange('noTeams')}
        >
          <Text style={gameMode === 'noTeams' ? styles.modeTextSelected : styles.modeText}>No Teams</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={gameMode === 'teamMode' ? styles.modeBtnSelected : styles.modeBtn}
          onPress={() => handleGameModeChange('teamMode')}
        >
          <Text style={gameMode === 'teamMode' ? styles.modeTextSelected : styles.modeText}>Team Mode</Text>
        </TouchableOpacity>
      </View> */}
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreTitle}>Last Score:</Text>
        <Text style={styles.scoreValue}>{lastScore}</Text>
        <Text style={styles.scoreTitle}>High Score:</Text>
        <Text style={styles.scoreValue}>{highScore}</Text>
      </View>
      
      {selectedTeams.length > 0 && (
        <View style={styles.selectedTeamsContainer}>
          <Text style={styles.selectedTeamsTitle}>Selected Teams:</Text>
          <View style={styles.selectedTeamsList}>
            {selectedTeams.map((team, index) => (
              <View key={index} style={styles.selectedTeamBadge}>
                <Text style={styles.selectedTeamBadgeText}>{team}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
         
          <TouchableOpacity style ={styles.button} onPress={() => resetScore()}>
              <Text style= {styles.resetScore}>Reset High Score</Text>
            </TouchableOpacity>
               
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => navigation.navigate('PlayerSelect')}
          >            
            <Image source={require('../assets/playSelBtn.png')} style={styles.buttonImage} resizeMode="cover"/>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => {
              handleStartGame(gameMode); 
              navigation.navigate('HeadsUp')
            }}
          >            
            <Image source={require('../assets/headsup.png')} style={styles.buttonImage} resizeMode="cover"/>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => {
              handleStartGame(gameMode);
              navigation.navigate('Trivia');
            }}
          >
            <Image source={require('../assets/trivia.png')} style={styles.buttonImage} resizeMode="cover"/>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => navigation.navigate('Jeopardy')}
          >
            <Image source={require('../assets/jeopardy.png')} style={styles.buttonImage} resizeMode="cover"/>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('JeopTriv')}
          >
            <Image source={require('../assets/jeoptriv.png')} style={styles.buttonImage} resizeMode="cover"/>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('AddQuestion')} style={styles.button}>
            <Text>Add a Trivia Question</Text>
          </TouchableOpacity>
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
    backgroundColor: "rgba(0, 0, 0, 0.6)",
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
  resetScore: {
    color: "#df313fff",
    fontSize: 32,
    fontWeight: "bold",
  },
  teamSelectText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  scoreTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },

  buttonGroup: {
    position: "absolute",
    bottom: "10%",
    left: 0,
    right: 0,
    alignItems: "center",
    gap: 16,
  },

  button: {
    width: "50%",
    height: "9%",
    borderRadius: 20,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(173, 214, 198, 0.94)",
    margin:10,
  },

  buttonImage: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor:"##03c54dff",
  },
  modeBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#03c54dff",
  },
  modeBtnSelected: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#9c03f5ff",
  },
  modeText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modeTextSelected: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  selectedTeamsContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginHorizontal: 20,
    alignItems: "center",
  },
  selectedTeamsTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  selectedTeamsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  selectedTeamBadge: {
    backgroundColor: "#9c03f5ff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  selectedTeamBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
