import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PowerUpManager, PowerUpType, PowerUpConfig } from '../services/powerUpManager';
import { RootStackParamList } from '../navigation/MainNavigator';

type InventoryNavigationProp = NativeStackNavigationProp<any>;

interface PowerUpInventoryScreenProps {
  playerId?: string;
}

export const PowerUpInventoryScreen: React.FC<PowerUpInventoryScreenProps> = ({
  playerId = 'default-player',
}) => {
  const navigation = useNavigation<InventoryNavigationProp>();
  const [powerUpManager] = useState(() => new PowerUpManager());
  const [availablePowerUps, setAvailablePowerUps] = useState<PowerUpConfig[]>([]);
  const [allPowerUps, setAllPowerUps] = useState<PowerUpConfig[]>([]);
  const [playerStats, setPlayerStats] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [animatingPowerUp, setAnimatingPowerUp] = useState<PowerUpType | null>(null);

  useEffect(() => {
    loadPowerUpData();
  }, [playerId]);

  const loadPowerUpData = () => {
    const available = powerUpManager.getAvailablePowerUps(playerId);
    const all = powerUpManager.getAllPowerUpConfigs();
    const stats = powerUpManager.getPlayerStats(playerId);
    
    setAvailablePowerUps(available);
    setAllPowerUps(all);
    setPlayerStats(stats);
  };

  const unlockPowerUp = (powerUpType: PowerUpType) => {
    Alert.alert(
      'Unlock Power-Up',
      'This feature would allow players to unlock new power-ups through achievements or in-app purchases.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Unlock (Demo)', onPress: () => executeUnlock(powerUpType) },
      ]
    );
  };

  const executeUnlock = (powerUpType: PowerUpType) => {
    const success = powerUpManager.unlockPowerUp(playerId, powerUpType);
    
    if (success) {
      setAnimatingPowerUp(powerUpType);
      Alert.alert('Unlocked!', `Power-up unlocked successfully!`);
      loadPowerUpData();
      
      setTimeout(() => {
        setAnimatingPowerUp(null);
      }, 1000);
    } else {
      Alert.alert('Failed', 'Unable to unlock power-up');
    }
  };

  const addPowerUpUses = (powerUpType: PowerUpType) => {
    Alert.prompt(
      'Add Power-Up Uses',
      'Enter number of uses to add (demo feature):',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: (text: any) => {
            const uses = parseInt(text || '1', 10);
            if (uses > 0) {
              const success = powerUpManager.addPowerUpUses(playerId, powerUpType, uses);
              if (success) {
                Alert.alert('Success', `Added ${uses} uses!`);
                loadPowerUpData();
              } else {
                Alert.alert('Failed', 'Unable to add uses');
              }
            }
          },
        },
      ],
      'plain-text',
      '1'
    );
  };

  const resetInventory = () => {
    Alert.alert(
      'Reset Inventory',
      'Reset all power-ups to default uses?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', onPress: () => executeReset() },
      ]
    );
  };

  const executeReset = () => {
    powerUpManager.resetPlayerInventory(playerId);
    Alert.alert('Reset Complete', 'Power-up inventory reset to defaults');
    loadPowerUpData();
  };

  const getPowerUpColor = (rarity: string): string => {
    switch (rarity) {
      case 'LEGENDARY': return '#FF6B35';
      case 'EPIC': return '#9B59B6';
      case 'RARE': return '#3498DB';
      case 'COMMON': return '#95A5A6';
      default: return '#95A5A6';
    }
  };

  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'HELPER': return '🎯';
      case 'TIME': return '⏰';
      case 'SCORE': return '💎';
      case 'SKIP': return '⏭️';
      default: return '⭐';
    }
  };

  const filteredPowerUps = selectedCategory === 'ALL' 
    ? allPowerUps 
    : allPowerUps.filter(pu => pu.category === selectedCategory);

  const renderPowerUpCard = (config: PowerUpConfig) => {
    const available = availablePowerUps.find(pu => pu.type === config.type);
    const uses = available?.uses || 0;
    const isUnlocked = uses > 0 || availablePowerUps.some(pu => pu.type === config.type);
    const isAnimating = animatingPowerUp === config.type;

    return (
      <View key={config.type} style={[
        styles.powerUpCard,
        { borderColor: getPowerUpColor(config.rarity) },
        isAnimating && styles.powerUpCardAnimating,
      ]}>
        <View style={styles.powerUpHeader}>
          <Text style={styles.powerUpIcon}>{config.icon}</Text>
          <View style={styles.powerUpTitleContainer}>
            <Text style={styles.powerUpName}>{config.name}</Text>
            <View style={styles.powerUpMeta}>
              <Text style={[styles.rarityText, { color: getPowerUpColor(config.rarity) }]}>
                {config.rarity}
              </Text>
              <Text style={styles.categoryText}>
                {getCategoryIcon(config.category)} {config.category}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.powerUpDescription}>{config.description}</Text>

        <View style={styles.powerUpStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Uses:</Text>
            <Text style={styles.statValue}>{uses}/{config.maxUses}</Text>
          </View>
          
          {config.duration && (
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Duration:</Text>
              <Text style={styles.statValue}>{config.duration}s</Text>
            </View>
          )}
          
          {config.cooldownTime && (
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Cooldown:</Text>
              <Text style={styles.statValue}>{config.cooldownTime}s</Text>
            </View>
          )}
        </View>

        <View style={styles.powerUpActions}>
          {isUnlocked ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.addButton]}
              onPress={() => addPowerUpUses(config.type)}
            >
              <Text style={styles.actionButtonText}>Add Uses</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.unlockButton]}
              onPress={() => unlockPowerUp(config.type)}
            >
              <Text style={styles.actionButtonText}>Unlock</Text>
            </TouchableOpacity>
          )}
        </View>

        {uses > 0 && (
          <View style={styles.usesIndicator}>
            <Text style={styles.usesText}>{uses}</Text>
          </View>
        )}
      </View>
    );
  };

  const categories = ['ALL', 'HELPER', 'TIME', 'SCORE', 'SKIP'];

  return (
    <ImageBackground 
      source={require('../assets/torresTrivia.png')}
      style={styles.background}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Power-Up Inventory</Text>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetInventory}
          >
            <Text style={styles.backButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>

        {playerStats && (
          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>Your Stats</Text>
            <View style={styles.statsRow}>
              <Text style={styles.statText}>Power-Ups Used: {playerStats.totalPowerUpsUsed}</Text>
              <Text style={styles.statText}>Session Time: {Math.round(playerStats.sessionDuration / 60)}m</Text>
            </View>
            <Text style={styles.statText}>
              Available: {availablePowerUps.reduce((sum: number, pu: PowerUpConfig) => sum + pu.uses, 0)} power-ups
            </Text>
          </View>
        )}

        <View style={styles.categoryContainer}>
          <Text style={styles.categoryTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.categoryButtonActive,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={styles.categoryButtonText}>
                  {category === 'ALL' ? '⭐' : getCategoryIcon(category)} {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView style={styles.powerUpList} showsVerticalScrollIndicator={false}>
          {filteredPowerUps.map(renderPowerUpCard)}
        </ScrollView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  resetButton: {
    backgroundColor: 'rgba(231, 76, 60, 0.2)',
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(231, 76, 60, 0.3)',
  },
  backButtonText: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  statsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statText: {
    fontSize: 14,
    color: '#cccccc',
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  powerUpList: {
    flex: 1,
  },
  powerUpCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    position: 'relative',
  },
  powerUpCardAnimating: {
    transform: [{ scale: 1.05 }],
    backgroundColor: 'rgba(39, 174, 96, 0.2)',
  },
  powerUpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  powerUpIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  powerUpTitleContainer: {
    flex: 1,
  },
  powerUpName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  powerUpMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rarityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  categoryText: {
    fontSize: 12,
    color: '#cccccc',
  },
  powerUpDescription: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 12,
    lineHeight: 18,
  },
  powerUpStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#cccccc',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  powerUpActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 100,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#3498DB',
  },
  unlockButton: {
    backgroundColor: '#9B59B6',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  usesIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#27AE60',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  usesText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
