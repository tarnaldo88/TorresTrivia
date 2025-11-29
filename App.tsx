import { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { Database } from './src/services/database';
import { seedDatabase } from './src/services/databaseSeeder';
import { ScoreManager } from './src/services/scoreManager';
import { HomeScreen } from './src/components/HomeScreen';
import { GameScreen } from './src/components/GameScreen';

type Screen = 'home' | 'game';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize database
        await Database.initialize();
        await seedDatabase();
        await ScoreManager.initialize();
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setIsReady(true); // Still show app even if init fails
      }
    };

    initializeApp();
  }, []);

  const handleGameEnd = async (finalScore: number) => {
    try {
      await ScoreManager.saveScore(finalScore);
      setCurrentScreen('home');
    } catch (error) {
      console.error('Failed to save score:', error);
      setCurrentScreen('home');
    }
  };

  if (!isReady) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {currentScreen === 'home' ? (
        <HomeScreen 
          onPlayHeadsUp={() => setCurrentScreen('game')}
          onPlayTrivia={() => setCurrentScreen('game')}
          onPlayJeopardy={() => setCurrentScreen('game')}
        />
      ) : (
        <GameScreen onRoundEnd={handleGameEnd} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
