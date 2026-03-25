import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
  Vibration,
} from 'react-native';
import { PowerUpManager, PowerUpType, PowerUpConfig, PowerUpResult } from '../services/powerUpManager';
import { TriviaQuestion } from '../types/index';

interface PowerUpBarProps {
  playerId: string;
  currentQuestion?: TriviaQuestion;
  currentScore?: number;
  timeRemaining?: number;
  onPowerUpUsed?: (result: PowerUpResult) => void;
  onTimeFreezeActive?: (duration: number) => void;
  onDoublePointsActive?: (multiplier: number) => void;
  onSkipPassActive?: () => void;
  onFiftyFiftyActive?: (result: any) => void;
  disabled?: boolean;
}

export const PowerUpBar: React.FC<PowerUpBarProps> = ({
  playerId,
  currentQuestion,
  currentScore,
  timeRemaining,
  onPowerUpUsed,
  onTimeFreezeActive,
  onDoublePointsActive,
  onSkipPassActive,
  onFiftyFiftyActive,
  disabled = false,
}) => {
  const [powerUpManager] = useState(() => new PowerUpManager());
  const [availablePowerUps, setAvailablePowerUps] = useState<PowerUpConfig[]>([]);
  const [activePowerUps, setActivePowerUps] = useState<Map<PowerUpType, boolean>>(new Map());
  const [animatingPowerUps, setAnimatingPowerUps] = useState<Set<PowerUpType>>(new Set());
  const [showPowerUpEffect, setShowPowerUpEffect] = useState<{
    type: PowerUpType;
    message: string;
  } | null>(null);

  useEffect(() => {
    loadAvailablePowerUps();
    checkActivePowerUps();
    
    // Check active power-ups every second
    const interval = setInterval(checkActivePowerUps, 1000);
    
    return () => clearInterval(interval);
  }, [playerId]);

  const loadAvailablePowerUps = () => {
    const powerUps = powerUpManager.getAvailablePowerUps(playerId);
    setAvailablePowerUps(powerUps);
  };

  const checkActivePowerUps = () => {
    const active = powerUpManager.getActivePowerUps(playerId);
    const activeMap = new Map<PowerUpType, boolean>();
    
    active.forEach(powerUp => {
      activeMap.set(powerUp.type, true);
      
      // Trigger callbacks for active power-ups
      switch (powerUp.type) {
        case PowerUpType.TIME_FREEZE:
          const timeRemaining = powerUpManager.hasTimeFreezeActive(playerId);
          if (timeRemaining > 0 && onTimeFreezeActive) {
            onTimeFreezeActive(timeRemaining);
          }
          break;
        case PowerUpType.DOUBLE_POINTS:
          if (onDoublePointsActive) {
            onDoublePointsActive(2);
          }
          break;
        case PowerUpType.SKIP_PASS:
          if (onSkipPassActive) {
            onSkipPassActive();
          }
          break;
      }
    });
    
    setActivePowerUps(activeMap);
  };

  const usePowerUp = async (powerUpType: PowerUpType) => {
    if (disabled) return;
    
    // Check if already active
    if (activePowerUps.get(powerUpType)) {
      Alert.alert('Power-Up Active', 'This power-up is already active!');
      return;
    }

    // Show confirmation for certain power-ups
    const config = powerUpManager.getPowerUpConfig(powerUpType);
    if (config?.category === 'SCORE' || config?.category === 'SKIP') {
      Alert.alert(
        `Use ${config?.name}?`,
        config?.description,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Use', onPress: () => executePowerUp(powerUpType) },
        ]
      );
    } else {
      executePowerUp(powerUpType);
    }
  };

  const executePowerUp = (powerUpType: PowerUpType) => {
    // Add animation
    setAnimatingPowerUps(prev => new Set(prev).add(powerUpType));
    
    // Vibrate for haptic feedback
    Vibration.vibrate(100);

    const result = powerUpManager.usePowerUp(playerId, powerUpType, {
      question: currentQuestion,
      currentScore,
      timeRemaining,
    });

    if (result.success) {
      // Show effect
      setShowPowerUpEffect({
        type: powerUpType,
        message: result.message || 'Power-up activated!',
      });

      // Handle specific power-up effects
      switch (powerUpType) {
        case PowerUpType.FIFTY_FIFTY:
          if (onFiftyFiftyActive && result.effect) {
            onFiftyFiftyActive(result.effect);
          }
          break;
        case PowerUpType.TIME_FREEZE:
          if (onTimeFreezeActive && result.effect) {
            onTimeFreezeActive(result.effect.bonusTime);
          }
          break;
        case PowerUpType.DOUBLE_POINTS:
          if (onDoublePointsActive && result.effect) {
            onDoublePointsActive(result.effect.multiplier);
          }
          break;
        case PowerUpType.SKIP_PASS:
          if (onSkipPassActive) {
            onSkipPassActive();
          }
          break;
      }

      // Refresh available power-ups
      loadAvailablePowerUps();
      
      // Clear effect after animation
      setTimeout(() => {
        setShowPowerUpEffect(null);
        setAnimatingPowerUps(prev => {
          const newSet = new Set(prev);
          newSet.delete(powerUpType);
          return newSet;
        });
      }, 2000);
    } else {
      Alert.alert('Power-Up Failed', result.message || 'Unable to use power-up');
    }

    if (onPowerUpUsed) {
      onPowerUpUsed(result);
    }
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

  const getPowerUpBackgroundColor = (type: PowerUpType): string => {
    if (activePowerUps.get(type)) {
      return '#27AE60'; // Green when active
    }
    return 'rgba(255, 255, 255, 0.1)';
  };

  const renderPowerUp = (config: PowerUpConfig) => {
    const isActive = activePowerUps.get(config.type);
    const isAnimating = animatingPowerUps.has(config.type);
    const uses = config.uses || 0;

    return (
      <View key={config.type} style={styles.powerUpContainer}>
        <TouchableOpacity
          style={[
            styles.powerUpButton,
            {
              backgroundColor: getPowerUpBackgroundColor(config.type),
              borderColor: getPowerUpColor(config.rarity),
              borderWidth: isActive ? 3 : 1,
            },
            isAnimating && styles.powerUpButtonAnimating,
          ]}
          onPress={() => usePowerUp(config.type)}
          disabled={disabled || uses === 0 || isActive}
          activeOpacity={0.7}
        >
          <View style={styles.powerUpContent}>
            <Text style={styles.powerUpIcon}>{config.icon}</Text>
            <Text style={styles.powerUpName}>{config.name}</Text>
            <View style={styles.powerUpUses}>
              <Text style={styles.powerUpUsesText}>{uses}</Text>
            </View>
          </View>
          
          {isActive && (
            <View style={styles.activeIndicator}>
              <Text style={styles.activeIndicatorText}>ACTIVE</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <Text style={styles.powerUpDescription}>{config.description}</Text>
      </View>
    );
  };

  if (availablePowerUps.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {showPowerUpEffect && (
        <Animated.View style={styles.effectContainer}>
          <View style={styles.effectContent}>
            <Text style={styles.effectIcon}>
              {powerUpManager.getPowerUpConfig(showPowerUpEffect.type)?.icon}
            </Text>
            <Text style={styles.effectMessage}>{showPowerUpEffect.message}</Text>
          </View>
        </Animated.View>
      )}
      
      <Text style={styles.title}>Power-Ups</Text>
      <View style={styles.powerUpsGrid}>
        {availablePowerUps.map(renderPowerUp)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  powerUpsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 8,
  },
  powerUpContainer: {
    width: '45%',
    alignItems: 'center',
    marginBottom: 8,
  },
  powerUpButton: {
    width: 80,
    height: 80,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  powerUpButtonAnimating: {
    transform: [{ scale: 1.1 }],
  },
  powerUpContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  powerUpIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  powerUpName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  powerUpUses: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#E74C3C',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  powerUpUsesText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  powerUpDescription: {
    fontSize: 9,
    color: '#cccccc',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 12,
  },
  activeIndicator: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    backgroundColor: '#27AE60',
    borderRadius: 6,
    alignItems: 'center',
    paddingVertical: 2,
  },
  activeIndicatorText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  effectContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    zIndex: 1000,
  },
  effectContent: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F39C12',
  },
  effectIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  effectMessage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
});
