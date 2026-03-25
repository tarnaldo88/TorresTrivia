import { TriviaQuestion } from '../types/index';

/**
 * Power-up types available in the game
 */
export enum PowerUpType {
  FIFTY_FIFTY = 'FIFTY_FIFTY',
  TIME_FREEZE = 'TIME_FREEZE',
  DOUBLE_POINTS = 'DOUBLE_POINTS',
  SKIP_PASS = 'SKIP_PASS',
}

/**
 * Power-up configuration
 */
export interface PowerUpConfig {
  type: PowerUpType;
  name: string;
  description: string;
  icon: string; // Icon name or emoji
  duration?: number; // Duration in seconds for timed effects
  uses: number; // Number of uses available
  maxUses: number; // Maximum uses per session
  cooldownTime?: number; // Cooldown time in seconds
  cost?: number; // Cost in points if purchaseable
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  category: 'HELPER' | 'TIME' | 'SCORE' | 'SKIP';
}

/**
 * Active power-up effect
 */
export interface ActivePowerUp {
  id: string;
  type: PowerUpType;
  startTime: number;
  endTime?: number;
  usesRemaining: number;
  isActive: boolean;
  appliedToQuestion?: string;
}

/**
 * Power-up usage result
 */
export interface PowerUpResult {
  success: boolean;
  type: PowerUpType;
  effect?: any;
  message?: string;
  remainingUses?: number;
}

/**
 * 50/50 power-up result
 */
export interface FiftyFiftyResult {
  removedAnswers: string[];
  remainingAnswers: string[];
  correctAnswer: string;
}

/**
 * Time Freeze result
 */
export interface TimeFreezeResult {
  frozenDuration: number;
  timeRemaining: number;
  bonusTime: number;
}

/**
 * Double Points result
 */
export interface DoublePointsResult {
  multiplier: number;
  basePoints: number;
  bonusPoints: number;
}

/**
 * Skip Pass result
 */
export interface SkipPassResult {
  skipUsed: boolean;
  skipsRemaining: number;
  noPenalty: boolean;
}

/**
 * Player power-up inventory
 */
export interface PlayerPowerUpInventory {
  playerId: string;
  powerUps: Map<PowerUpType, number>;
  unlockedPowerUps: Set<PowerUpType>;
  totalPowerUpsUsed: number;
  sessionStartTime: number;
  lastUsedPowerUp?: {
    type: PowerUpType;
    timestamp: number;
  };
}

/**
 * PowerUpManager manages all power-up functionality
 */
export class PowerUpManager {
  private activePowerUps: Map<string, ActivePowerUp> = new Map();
  private playerInventories: Map<string, PlayerPowerUpInventory> = new Map();
  private powerUpConfigs: Map<PowerUpType, PowerUpConfig> = new Map();

  constructor() {
    this.initializePowerUpConfigs();
  }

  /**
   * Initialize power-up configurations
   */
  private initializePowerUpConfigs(): void {
    const configs: PowerUpConfig[] = [
      {
        type: PowerUpType.FIFTY_FIFTY,
        name: '50/50',
        description: 'Remove two wrong answers',
        icon: '🎯',
        uses: 3,
        maxUses: 3,
        rarity: 'COMMON',
        category: 'HELPER',
      },
      {
        type: PowerUpType.TIME_FREEZE,
        name: 'Time Freeze',
        description: 'Pause timer for 10 seconds',
        icon: '⏰',
        duration: 10,
        uses: 2,
        maxUses: 2,
        cooldownTime: 30,
        rarity: 'RARE',
        category: 'TIME',
      },
      {
        type: PowerUpType.DOUBLE_POINTS,
        name: 'Double Points',
        description: 'Next question worth 2x points',
        icon: '💎',
        uses: 2,
        maxUses: 2,
        cooldownTime: 20,
        rarity: 'RARE',
        category: 'SCORE',
      },
      {
        type: PowerUpType.SKIP_PASS,
        name: 'Skip Pass',
        description: 'Get one free skip without penalty',
        icon: '⏭️',
        uses: 1,
        maxUses: 1,
        rarity: 'COMMON',
        category: 'SKIP',
      },
    ];

    configs.forEach(config => {
      this.powerUpConfigs.set(config.type, config);
    });
  }

  /**
   * Get or create player inventory
   */
  getPlayerInventory(playerId: string): PlayerPowerUpInventory {
    if (!this.playerInventories.has(playerId)) {
      const inventory: PlayerPowerUpInventory = {
        playerId,
        powerUps: new Map(),
        unlockedPowerUps: new Set([PowerUpType.FIFTY_FIFTY, PowerUpType.SKIP_PASS]), // Start with basic power-ups
        totalPowerUpsUsed: 0,
        sessionStartTime: Date.now(),
      };

      // Initialize power-up uses
      this.powerUpConfigs.forEach((config, type) => {
        if (inventory.unlockedPowerUps.has(type)) {
          inventory.powerUps.set(type, config.uses);
        }
      });

      this.playerInventories.set(playerId, inventory);
    }
    return this.playerInventories.get(playerId)!;
  }

  /**
   * Get available power-ups for a player
   */
  getAvailablePowerUps(playerId: string): PowerUpConfig[] {
    const inventory = this.getPlayerInventory(playerId);
    const available: PowerUpConfig[] = [];

    inventory.powerUps.forEach((uses, type) => {
      if (uses > 0) {
        const config = this.powerUpConfigs.get(type);
        if (config) {
          available.push({ ...config, uses });
        }
      }
    });

    return available.sort((a, b) => {
      // Sort by rarity, then by category
      const rarityOrder = { 'LEGENDARY': 4, 'EPIC': 3, 'RARE': 2, 'COMMON': 1 };
      const aRarity = rarityOrder[a.rarity];
      const bRarity = rarityOrder[b.rarity];
      
      if (aRarity !== bRarity) {
        return bRarity - aRarity; // Higher rarity first
      }
      
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Use a power-up
   */
  usePowerUp(
    playerId: string,
    powerUpType: PowerUpType,
    context?: {
      question?: TriviaQuestion;
      currentScore?: number;
      timeRemaining?: number;
    }
  ): PowerUpResult {
    const inventory = this.getPlayerInventory(playerId);
    const config = this.powerUpConfigs.get(powerUpType);
    
    if (!config) {
      return {
        success: false,
        type: powerUpType,
        message: 'Power-up not found',
      };
    }

    const currentUses = inventory.powerUps.get(powerUpType) || 0;
    if (currentUses <= 0) {
      return {
        success: false,
        type: powerUpType,
        message: 'No uses remaining',
      };
    }

    // Check cooldown
    if (config.cooldownTime && inventory.lastUsedPowerUp) {
      const timeSinceLastUse = (Date.now() - inventory.lastUsedPowerUp.timestamp) / 1000;
      if (timeSinceLastUse < config.cooldownTime) {
        return {
          success: false,
          type: powerUpType,
          message: `Power-up on cooldown for ${Math.ceil(config.cooldownTime - timeSinceLastUse)} seconds`,
        };
      }
    }

    // Apply power-up effect
    const result = this.applyPowerUpEffect(playerId, powerUpType, context);
    
    if (result.success) {
      // Update inventory
      inventory.powerUps.set(powerUpType, currentUses - 1);
      inventory.totalPowerUpsUsed++;
      inventory.lastUsedPowerUp = {
        type: powerUpType,
        timestamp: Date.now(),
      };

      result.remainingUses = inventory.powerUps.get(powerUpType);
    }

    return result;
  }

  /**
   * Apply the specific power-up effect
   */
  private applyPowerUpEffect(
    playerId: string,
    powerUpType: PowerUpType,
    context?: {
      question?: TriviaQuestion;
      currentScore?: number;
      timeRemaining?: number;
    }
  ): PowerUpResult {
    switch (powerUpType) {
      case PowerUpType.FIFTY_FIFTY:
        return this.applyFiftyFifty(playerId, context?.question);
      
      case PowerUpType.TIME_FREEZE:
        return this.applyTimeFreeze(playerId, context?.timeRemaining);
      
      case PowerUpType.DOUBLE_POINTS:
        return this.applyDoublePoints(playerId, context?.currentScore);
      
      case PowerUpType.SKIP_PASS:
        return this.applySkipPass(playerId);
      
      default:
        return {
          success: false,
          type: powerUpType,
          message: 'Unknown power-up type',
        };
    }
  }

  /**
   * Apply 50/50 power-up
   */
  private applyFiftyFifty(playerId: string, question?: TriviaQuestion): PowerUpResult {
    if (!question) {
      return {
        success: false,
        type: PowerUpType.FIFTY_FIFTY,
        message: 'No active question',
      };
    }

    // For multiple choice questions, we'd need to extract wrong answers
    // For now, we'll simulate the effect
    const wrongAnswers = ['Wrong Answer 1', 'Wrong Answer 2'];
    const correctAnswer = question.answer;
    
    const result: FiftyFiftyResult = {
      removedAnswers: wrongAnswers,
      remainingAnswers: [correctAnswer, 'Remaining Wrong Answer'],
      correctAnswer,
    };

    // Activate the power-up
    const activePowerUp: ActivePowerUp = {
      id: `${playerId}-${PowerUpType.FIFTY_FIFTY}-${Date.now()}`,
      type: PowerUpType.FIFTY_FIFTY,
      startTime: Date.now(),
      usesRemaining: 1,
      isActive: true,
      appliedToQuestion: question.id,
    };

    this.activePowerUps.set(activePowerUp.id, activePowerUp);

    return {
      success: true,
      type: PowerUpType.FIFTY_FIFTY,
      effect: result,
      message: 'Two wrong answers removed!',
    };
  }

  /**
   * Apply Time Freeze power-up
   */
  private applyTimeFreeze(playerId: string, timeRemaining?: number): PowerUpResult {
    const config = this.powerUpConfigs.get(PowerUpType.TIME_FREEZE);
    const freezeDuration = config?.duration || 10;
    
    const result: TimeFreezeResult = {
      frozenDuration: freezeDuration,
      timeRemaining: timeRemaining || 0,
      bonusTime: freezeDuration,
    };

    // Activate the power-up
    const activePowerUp: ActivePowerUp = {
      id: `${playerId}-${PowerUpType.TIME_FREEZE}-${Date.now()}`,
      type: PowerUpType.TIME_FREEZE,
      startTime: Date.now(),
      endTime: Date.now() + (freezeDuration * 1000),
      usesRemaining: 1,
      isActive: true,
    };

    this.activePowerUps.set(activePowerUp.id, activePowerUp);

    return {
      success: true,
      type: PowerUpType.TIME_FREEZE,
      effect: result,
      message: `Time frozen for ${freezeDuration} seconds!`,
    };
  }

  /**
   * Apply Double Points power-up
   */
  private applyDoublePoints(playerId: string, currentScore?: number): PowerUpResult {
    const basePoints = 10; // Default points per question
    const multiplier = 2;
    
    const result: DoublePointsResult = {
      multiplier,
      basePoints,
      bonusPoints: basePoints * (multiplier - 1),
    };

    // Activate the power-up for next question
    const activePowerUp: ActivePowerUp = {
      id: `${playerId}-${PowerUpType.DOUBLE_POINTS}-${Date.now()}`,
      type: PowerUpType.DOUBLE_POINTS,
      startTime: Date.now(),
      usesRemaining: 1,
      isActive: true,
    };

    this.activePowerUps.set(activePowerUp.id, activePowerUp);

    return {
      success: true,
      type: PowerUpType.DOUBLE_POINTS,
      effect: result,
      message: 'Next question worth double points!',
    };
  }

  /**
   * Apply Skip Pass power-up
   */
  private applySkipPass(playerId: string): PowerUpResult {
    const inventory = this.getPlayerInventory(playerId);
    const currentUses = inventory.powerUps.get(PowerUpType.SKIP_PASS) || 0;
    
    const result: SkipPassResult = {
      skipUsed: true,
      skipsRemaining: currentUses - 1,
      noPenalty: true,
    };

    // Activate the power-up
    const activePowerUp: ActivePowerUp = {
      id: `${playerId}-${PowerUpType.SKIP_PASS}-${Date.now()}`,
      type: PowerUpType.SKIP_PASS,
      startTime: Date.now(),
      usesRemaining: currentUses - 1,
      isActive: true,
    };

    this.activePowerUps.set(activePowerUp.id, activePowerUp);

    return {
      success: true,
      type: PowerUpType.SKIP_PASS,
      effect: result,
      message: 'Free skip activated! No penalty for next skip.',
    };
  }

  /**
   * Check if player has active power-ups
   */
  getActivePowerUps(playerId: string): ActivePowerUp[] {
    const playerActivePowerUps: ActivePowerUp[] = [];
    
    this.activePowerUps.forEach((powerUp) => {
      if (powerUp.id.startsWith(playerId) && powerUp.isActive) {
        // Check if power-up has expired
        if (powerUp.endTime && Date.now() > powerUp.endTime) {
          powerUp.isActive = false;
        } else {
          playerActivePowerUps.push(powerUp);
        }
      }
    });

    return playerActivePowerUps;
  }

  /**
   * Deactivate a power-up
   */
  deactivatePowerUp(powerUpId: string): void {
    const powerUp = this.activePowerUps.get(powerUpId);
    if (powerUp) {
      powerUp.isActive = false;
      powerUp.usesRemaining = Math.max(0, powerUp.usesRemaining - 1);
      
      if (powerUp.usesRemaining <= 0) {
        this.activePowerUps.delete(powerUpId);
      }
    }
  }

  /**
   * Check if player has skip pass active
   */
  hasSkipPassActive(playerId: string): boolean {
    const activePowerUps = this.getActivePowerUps(playerId);
    return activePowerUps.some(pu => pu.type === PowerUpType.SKIP_PASS && pu.isActive);
  }

  /**
   * Check if player has double points active
   */
  hasDoublePointsActive(playerId: string): boolean {
    const activePowerUps = this.getActivePowerUps(playerId);
    return activePowerUps.some(pu => pu.type === PowerUpType.DOUBLE_POINTS && pu.isActive);
  }

  /**
   * Check if player has time freeze active
   */
  hasTimeFreezeActive(playerId: string): number {
    const activePowerUps = this.getActivePowerUps(playerId);
    const timeFreeze = activePowerUps.find(pu => pu.type === PowerUpType.TIME_FREEZE && pu.isActive);
    
    if (timeFreeze && timeFreeze.endTime) {
      return Math.max(0, timeFreeze.endTime - Date.now());
    }
    
    return 0;
  }

  /**
   * Get power-up configuration
   */
  getPowerUpConfig(powerUpType: PowerUpType): PowerUpConfig | undefined {
    return this.powerUpConfigs.get(powerUpType);
  }

  /**
   * Get all power-up configurations
   */
  getAllPowerUpConfigs(): PowerUpConfig[] {
    return Array.from(this.powerUpConfigs.values());
  }

  /**
   * Reset player inventory for new session
   */
  resetPlayerInventory(playerId: string): void {
    const inventory = this.getPlayerInventory(playerId);
    
    // Reset uses to max
    this.powerUpConfigs.forEach((config, type) => {
      if (inventory.unlockedPowerUps.has(type)) {
        inventory.powerUps.set(type, config.uses);
      }
    });

    inventory.totalPowerUpsUsed = 0;
    inventory.sessionStartTime = Date.now();
    inventory.lastUsedPowerUp = undefined;

    // Clear active power-ups
    const powerUpsToRemove: string[] = [];
    this.activePowerUps.forEach((powerUp, id) => {
      if (powerUp.id.startsWith(playerId)) {
        powerUpsToRemove.push(id);
      }
    });
    
    powerUpsToRemove.forEach(id => this.activePowerUps.delete(id));
  }

  /**
   * Unlock power-up for player
   */
  unlockPowerUp(playerId: string, powerUpType: PowerUpType): boolean {
    const inventory = this.getPlayerInventory(playerId);
    const config = this.powerUpConfigs.get(powerUpType);
    
    if (!config || inventory.unlockedPowerUps.has(powerUpType)) {
      return false;
    }

    inventory.unlockedPowerUps.add(powerUpType);
    inventory.powerUps.set(powerUpType, config.uses);
    
    return true;
  }

  /**
   * Add power-up uses to player inventory
   */
  addPowerUpUses(playerId: string, powerUpType: PowerUpType, uses: number): boolean {
    const inventory = this.getPlayerInventory(playerId);
    const config = this.powerUpConfigs.get(powerUpType);
    
    if (!config || !inventory.unlockedPowerUps.has(powerUpType)) {
      return false;
    }

    const currentUses = inventory.powerUps.get(powerUpType) || 0;
    const newUses = Math.min(config.maxUses, currentUses + uses);
    inventory.powerUps.set(powerUpType, newUses);
    
    return true;
  }

  /**
   * Get player statistics
   */
  getPlayerStats(playerId: string): {
    totalPowerUpsUsed: number;
    powerUpsByType: Map<PowerUpType, number>;
    sessionDuration: number;
    mostUsedPowerUp: PowerUpType | null;
  } {
    const inventory = this.getPlayerInventory(playerId);
    const sessionDuration = (Date.now() - inventory.sessionStartTime) / 1000;
    
    // Count power-ups by type (this would need more detailed tracking in a real implementation)
    const powerUpsByType = new Map<PowerUpType, number>();
    
    return {
      totalPowerUpsUsed: inventory.totalPowerUpsUsed,
      powerUpsByType,
      sessionDuration,
      mostUsedPowerUp: inventory.lastUsedPowerUp?.type || null,
    };
  }
}
