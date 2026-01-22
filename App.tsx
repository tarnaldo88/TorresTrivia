import { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Database } from './src/services/database';
import { seedDatabase } from './src/services/databaseSeeder';
import { ScoreManager } from './src/services/scoreManager';
import { MainNavigator } from './src/navigation/MainNavigator';
import { TeamProvider } from './src/context/TeamContext';

export default function App() {
  const [isReady, setIsReady] = useState(false);

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

  if (!isReady) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer} />
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer>
      <TeamProvider>
        <MainNavigator />
      </TeamProvider>
    </NavigationContainer>
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
