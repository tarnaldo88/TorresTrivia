import { PowerUpManager, PowerUpType } from '../../services/powerUpManager';
import { TriviaQuestion } from '../../types/index';

// Mock trivia question for testing
const mockTriviaQuestion: TriviaQuestion = {
  id: 'test-question-1',
  question: 'What is the capital of France?',
  answer: 'Paris',
  category: 'Geography',
  difficulty: 'Easy',
};

describe('PowerUpManager', () => {
  let powerUpManager: PowerUpManager;
  const testPlayerId = 'test-player-123';

  beforeEach(() => {
    powerUpManager = new PowerUpManager();
  });

  afterEach(() => {
    // Clean up any test state
    powerUpManager.resetPlayerInventory(testPlayerId);
  });

  describe('Initialization', () => {
    it('should initialize with default power-up configurations', () => {
      const allConfigs = powerUpManager.getAllPowerUpConfigs();
      
      expect(allConfigs).toHaveLength(4);
      expect(allConfigs.find(c => c.type === PowerUpType.FIFTY_FIFTY)).toBeDefined();
      expect(allConfigs.find(c => c.type === PowerUpType.TIME_FREEZE)).toBeDefined();
      expect(allConfigs.find(c => c.type === PowerUpType.DOUBLE_POINTS)).toBeDefined();
      expect(allConfigs.find(c => c.type === PowerUpType.SKIP_PASS)).toBeDefined();
    });

    it('should create player inventory with basic power-ups unlocked', () => {
      const inventory = powerUpManager.getPlayerInventory(testPlayerId);
      
      expect(inventory.playerId).toBe(testPlayerId);
      expect(inventory.unlockedPowerUps.has(PowerUpType.FIFTY_FIFTY)).toBe(true);
      expect(inventory.unlockedPowerUps.has(PowerUpType.SKIP_PASS)).toBe(true);
      expect(inventory.powerUps.get(PowerUpType.FIFTY_FIFTY)).toBe(3);
      expect(inventory.powerUps.get(PowerUpType.SKIP_PASS)).toBe(1);
    });
  });

  describe('Power-Up Configuration', () => {
    it('should return correct configuration for each power-up type', () => {
      const fiftyFiftyConfig = powerUpManager.getPowerUpConfig(PowerUpType.FIFTY_FIFTY);
      
      expect(fiftyFiftyConfig).toBeDefined();
      expect(fiftyFiftyConfig?.name).toBe('50/50');
      expect(fiftyFiftyConfig?.description).toBe('Remove two wrong answers');
      expect(fiftyFiftyConfig?.icon).toBe('🎯');
      expect(fiftyFiftyConfig?.uses).toBe(3);
      expect(fiftyFiftyConfig?.maxUses).toBe(3);
      expect(fiftyFiftyConfig?.rarity).toBe('COMMON');
      expect(fiftyFiftyConfig?.category).toBe('HELPER');
    });

    it('should return undefined for invalid power-up type', () => {
      const config = powerUpManager.getPowerUpConfig('INVALID' as PowerUpType);
      expect(config).toBeUndefined();
    });
  });

  describe('Available Power-Ups', () => {
    it('should return only power-ups with remaining uses', () => {
      const available = powerUpManager.getAvailablePowerUps(testPlayerId);
      
      expect(available.length).toBeGreaterThan(0);
      available.forEach(powerUp => {
        expect(powerUp.uses).toBeGreaterThan(0);
      });
    });

    it('should sort available power-ups by rarity and name', () => {
      // Use all power-ups to test sorting
      powerUpManager.usePowerUp(testPlayerId, PowerUpType.FIFTY_FIFTY);
      powerUpManager.usePowerUp(testPlayerId, PowerUpType.FIFTY_FIFTY);
      powerUpManager.usePowerUp(testPlayerId, PowerUpType.FIFTY_FIFTY);
      powerUpManager.usePowerUp(testPlayerId, PowerUpType.SKIP_PASS);
      
      // Unlock rare power-ups for testing
      powerUpManager.unlockPowerUp(testPlayerId, PowerUpType.TIME_FREEZE);
      powerUpManager.unlockPowerUp(testPlayerId, PowerUpType.DOUBLE_POINTS);
      
      const available = powerUpManager.getAvailablePowerUps(testPlayerId);
      
      // Rare power-ups should come before common ones
      const rarePowerUps = available.filter(pu => pu.rarity === 'RARE');
      const commonPowerUps = available.filter(pu => pu.rarity === 'COMMON');
      
      expect(rarePowerUps.length).toBeGreaterThan(0);
      expect(commonPowerUps.length).toBeGreaterThan(0);
    });
  });

  describe('50/50 Power-Up Usage', () => {
    it('should successfully use 50/50 power-up with valid question', () => {
      const result = powerUpManager.usePowerUp(testPlayerId, PowerUpType.FIFTY_FIFTY, {
        question: mockTriviaQuestion,
      });
      
      expect(result.success).toBe(true);
      expect(result.type).toBe(PowerUpType.FIFTY_FIFTY);
      expect(result.message).toBe('Two wrong answers removed!');
      expect(result.effect).toBeDefined();
      expect(result.remainingUses).toBe(2); // Started with 3, used 1
    });

    it('should fail to use 50/50 power-up without question', () => {
      const result = powerUpManager.usePowerUp(testPlayerId, PowerUpType.FIFTY_FIFTY);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('No active question');
    });

    it('should fail when no uses remaining', () => {
      // Use all 3 uses
      powerUpManager.usePowerUp(testPlayerId, PowerUpType.FIFTY_FIFTY, { question: mockTriviaQuestion });
      powerUpManager.usePowerUp(testPlayerId, PowerUpType.FIFTY_FIFTY, { question: mockTriviaQuestion });
      powerUpManager.usePowerUp(testPlayerId, PowerUpType.FIFTY_FIFTY, { question: mockTriviaQuestion });
      
      const result = powerUpManager.usePowerUp(testPlayerId, PowerUpType.FIFTY_FIFTY, { question: mockTriviaQuestion });
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('No uses remaining');
    });

    it('should create active power-up record', () => {
      powerUpManager.usePowerUp(testPlayerId, PowerUpType.FIFTY_FIFTY, { question: mockTriviaQuestion });
      
      const activePowerUps = powerUpManager.getActivePowerUps(testPlayerId);
      const fiftyFiftyActive = activePowerUps.find(pu => pu.type === PowerUpType.FIFTY_FIFTY);
      
      expect(fiftyFiftyActive).toBeDefined();
      expect(fiftyFiftyActive?.isActive).toBe(true);
      expect(fiftyFiftyActive?.appliedToQuestion).toBe(mockTriviaQuestion.id);
    });
  });

  describe('Time Freeze Power-Up Usage', () => {
    beforeEach(() => {
      // Unlock time freeze for testing
      powerUpManager.unlockPowerUp(testPlayerId, PowerUpType.TIME_FREEZE);
    });

    it('should successfully use time freeze power-up', () => {
      const result = powerUpManager.usePowerUp(testPlayerId, PowerUpType.TIME_FREEZE, {
        timeRemaining: 30,
      });
      
      expect(result.success).toBe(true);
      expect(result.type).toBe(PowerUpType.TIME_FREEZE);
      expect(result.message).toBe('Time frozen for 10 seconds!');
      expect(result.effect).toBeDefined();
      expect(result.effect.frozenDuration).toBe(10);
      expect(result.effect.bonusTime).toBe(10);
    });

    it('should create time-limited active power-up', () => {
      powerUpManager.usePowerUp(testPlayerId, PowerUpType.TIME_FREEZE);
      
      const activePowerUps = powerUpManager.getActivePowerUps(testPlayerId);
      const timeFreezeActive = activePowerUps.find(pu => pu.type === PowerUpType.TIME_FREEZE);
      
      expect(timeFreezeActive).toBeDefined();
      expect(timeFreezeActive?.isActive).toBe(true);
      expect(timeFreezeActive?.endTime).toBeDefined();
      expect(timeFreezeActive?.endTime! - timeFreezeActive!.startTime).toBe(10000); // 10 seconds
    });

    it('should respect cooldown period', () => {
      powerUpManager.usePowerUp(testPlayerId, PowerUpType.TIME_FREEZE);
      
      // Try to use again immediately (should fail due to cooldown)
      const result = powerUpManager.usePowerUp(testPlayerId, PowerUpType.TIME_FREEZE);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('on cooldown');
    });
  });

  describe('Double Points Power-Up Usage', () => {
    beforeEach(() => {
      // Unlock double points for testing
      powerUpManager.unlockPowerUp(testPlayerId, PowerUpType.DOUBLE_POINTS);
    });

    it('should successfully use double points power-up', () => {
      const result = powerUpManager.usePowerUp(testPlayerId, PowerUpType.DOUBLE_POINTS, {
        currentScore: 100,
      });
      
      expect(result.success).toBe(true);
      expect(result.type).toBe(PowerUpType.DOUBLE_POINTS);
      expect(result.message).toBe('Next question worth double points!');
      expect(result.effect).toBeDefined();
      expect(result.effect.multiplier).toBe(2);
      expect(result.effect.basePoints).toBe(10);
      expect(result.effect.bonusPoints).toBe(10);
    });

    it('should create active power-up for next question', () => {
      powerUpManager.usePowerUp(testPlayerId, PowerUpType.DOUBLE_POINTS);
      
      const activePowerUps = powerUpManager.getActivePowerUps(testPlayerId);
      const doublePointsActive = activePowerUps.find(pu => pu.type === PowerUpType.DOUBLE_POINTS);
      
      expect(doublePointsActive).toBeDefined();
      expect(doublePointsActive?.isActive).toBe(true);
      expect(doublePointsActive?.usesRemaining).toBe(1);
    });
  });

  describe('Skip Pass Power-Up Usage', () => {
    it('should successfully use skip pass power-up', () => {
      const result = powerUpManager.usePowerUp(testPlayerId, PowerUpType.SKIP_PASS);
      
      expect(result.success).toBe(true);
      expect(result.type).toBe(PowerUpType.SKIP_PASS);
      expect(result.message).toBe('Free skip activated! No penalty for next skip.');
      expect(result.effect).toBeDefined();
      expect(result.effect.skipUsed).toBe(true);
      expect(result.effect.noPenalty).toBe(true);
    });

    it('should consume the skip pass on use', () => {
      const initialUses = powerUpManager.getPlayerInventory(testPlayerId).powerUps.get(PowerUpType.SKIP_PASS);
      expect(initialUses).toBe(1);
      
      powerUpManager.usePowerUp(testPlayerId, PowerUpType.SKIP_PASS);
      
      const remainingUses = powerUpManager.getPlayerInventory(testPlayerId).powerUps.get(PowerUpType.SKIP_PASS);
      expect(remainingUses).toBe(0);
    });
  });

  describe('Active Power-Ups Management', () => {
    it('should track active power-ups correctly', () => {
      // Use multiple power-ups
      powerUpManager.usePowerUp(testPlayerId, PowerUpType.FIFTY_FIFTY, { question: mockTriviaQuestion });
      powerUpManager.unlockPowerUp(testPlayerId, PowerUpType.DOUBLE_POINTS);
      powerUpManager.usePowerUp(testPlayerId, PowerUpType.DOUBLE_POINTS);
      
      const activePowerUps = powerUpManager.getActivePowerUps(testPlayerId);
      
      expect(activePowerUps).toHaveLength(2);
      expect(activePowerUps.some(pu => pu.type === PowerUpType.FIFTY_FIFTY)).toBe(true);
      expect(activePowerUps.some(pu => pu.type === PowerUpType.DOUBLE_POINTS)).toBe(true);
    });

    it('should deactivate power-ups correctly', () => {
      powerUpManager.usePowerUp(testPlayerId, PowerUpType.FIFTY_FIFTY, { question: mockTriviaQuestion });
      
      const activePowerUps = powerUpManager.getActivePowerUps(testPlayerId);
      expect(activePowerUps).toHaveLength(1);
      
      const powerUpId = activePowerUps[0].id;
      powerUpManager.deactivatePowerUp(powerUpId);
      
      const remainingActive = powerUpManager.getActivePowerUps(testPlayerId);
      expect(remainingActive).toHaveLength(0);
    });

    it('should check for specific active power-ups', () => {
      // Test skip pass
      expect(powerUpManager.hasSkipPassActive(testPlayerId)).toBe(false);
      powerUpManager.usePowerUp(testPlayerId, PowerUpType.SKIP_PASS);
      expect(powerUpManager.hasSkipPassActive(testPlayerId)).toBe(true);
      
      // Test double points
      expect(powerUpManager.hasDoublePointsActive(testPlayerId)).toBe(false);
      powerUpManager.unlockPowerUp(testPlayerId, PowerUpType.DOUBLE_POINTS);
      powerUpManager.usePowerUp(testPlayerId, PowerUpType.DOUBLE_POINTS);
      expect(powerUpManager.hasDoublePointsActive(testPlayerId)).toBe(true);
      
      // Test time freeze
      expect(powerUpManager.hasTimeFreezeActive(testPlayerId)).toBe(0);
      powerUpManager.unlockPowerUp(testPlayerId, PowerUpType.TIME_FREEZE);
      powerUpManager.usePowerUp(testPlayerId, PowerUpType.TIME_FREEZE);
      expect(powerUpManager.hasTimeFreezeActive(testPlayerId)).toBeGreaterThan(0);
    });
  });

  describe('Player Inventory Management', () => {
    it('should unlock new power-ups correctly', () => {
      const initialUnlocked = powerUpManager.getPlayerInventory(testPlayerId).unlockedPowerUps.size;
      
      const success = powerUpManager.unlockPowerUp(testPlayerId, PowerUpType.TIME_FREEZE);
      
      expect(success).toBe(true);
      expect(powerUpManager.getPlayerInventory(testPlayerId).unlockedPowerUps.size).toBe(initialUnlocked + 1);
      expect(powerUpManager.getPlayerInventory(testPlayerId).unlockedPowerUps.has(PowerUpType.TIME_FREEZE)).toBe(true);
    });

    it('should fail to unlock already unlocked power-ups', () => {
      const success = powerUpManager.unlockPowerUp(testPlayerId, PowerUpType.FIFTY_FIFTY);
      expect(success).toBe(false);
    });

    it('should add power-up uses correctly', () => {
      powerUpManager.unlockPowerUp(testPlayerId, PowerUpType.TIME_FREEZE);
      const initialUses = powerUpManager.getPlayerInventory(testPlayerId).powerUps.get(PowerUpType.TIME_FREEZE) || 0;
      
      const success = powerUpManager.addPowerUpUses(testPlayerId, PowerUpType.TIME_FREEZE, 1);
      
      expect(success).toBe(true);
      expect(powerUpManager.getPlayerInventory(testPlayerId).powerUps.get(PowerUpType.TIME_FREEZE)).toBe(initialUses + 1);
    });

    it('should not exceed max uses when adding', () => {
      powerUpManager.unlockPowerUp(testPlayerId, PowerUpType.TIME_FREEZE);
      
      // Try to add more than max uses
      const success = powerUpManager.addPowerUpUses(testPlayerId, PowerUpType.TIME_FREEZE, 10);
      
      expect(success).toBe(true);
      expect(powerUpManager.getPlayerInventory(testPlayerId).powerUps.get(PowerUpType.TIME_FREEZE)).toBe(2); // Max uses
    });

    it('should reset player inventory correctly', () => {
      // Use some power-ups and unlock new ones
      powerUpManager.usePowerUp(testPlayerId, PowerUpType.FIFTY_FIFTY, { question: mockTriviaQuestion });
      powerUpManager.unlockPowerUp(testPlayerId, PowerUpType.TIME_FREEZE);
      
      // Reset
      powerUpManager.resetPlayerInventory(testPlayerId);
      
      const inventory = powerUpManager.getPlayerInventory(testPlayerId);
      expect(inventory.totalPowerUpsUsed).toBe(0);
      expect(inventory.powerUps.get(PowerUpType.FIFTY_FIFTY)).toBe(3); // Reset to max
      expect(inventory.lastUsedPowerUp).toBeUndefined();
      expect(powerUpManager.getActivePowerUps(testPlayerId)).toHaveLength(0);
    });
  });

  describe('Player Statistics', () => {
    it('should track player statistics correctly', () => {
      // Use some power-ups
      powerUpManager.usePowerUp(testPlayerId, PowerUpType.FIFTY_FIFTY, { question: mockTriviaQuestion });
      powerUpManager.usePowerUp(testPlayerId, PowerUpType.SKIP_PASS);
      
      const stats = powerUpManager.getPlayerStats(testPlayerId);
      
      expect(stats.totalPowerUpsUsed).toBe(2);
      expect(stats.sessionDuration).toBeGreaterThan(0);
      expect(stats.mostUsedPowerUp).toBe(PowerUpType.SKIP_PASS); // Last used
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle invalid player IDs gracefully', () => {
      const result = powerUpManager.usePowerUp('invalid-player', PowerUpType.FIFTY_FIFTY, {
        question: mockTriviaQuestion,
      });
      
      expect(result.success).toBe(true); // Should create inventory for new player
    });

    it('should handle missing context parameters gracefully', () => {
      powerUpManager.unlockPowerUp(testPlayerId, PowerUpType.DOUBLE_POINTS);
      
      const result = powerUpManager.usePowerUp(testPlayerId, PowerUpType.DOUBLE_POINTS);
      
      expect(result.success).toBe(true); // Should work without currentScore
    });

    it('should handle power-up deactivation gracefully', () => {
      const result = powerUpManager.deactivatePowerUp('non-existent-id');
      expect(result).toBeUndefined(); // Should not throw error
    });

    it('should handle multiple rapid calls correctly', () => {
      // Rapid usage attempts
      const results = [];
      for (let i = 0; i < 5; i++) {
        results.push(powerUpManager.usePowerUp(testPlayerId, PowerUpType.FIFTY_FIFTY, { question: mockTriviaQuestion }));
      }
      
      // Only first 3 should succeed (max uses)
      const successes = results.filter(r => r.success);
      const failures = results.filter(r => !r.success);
      
      expect(successes).toHaveLength(3);
      expect(failures).toHaveLength(2);
      expect(failures.every(f => f.message === 'No uses remaining')).toBe(true);
    });
  });
});
