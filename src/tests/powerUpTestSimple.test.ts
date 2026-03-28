import { PowerUpManager, PowerUpType } from '../services/powerUpManager';

describe('Simple Power-Up Test', () => {
  let powerUpManager: PowerUpManager;
  const testPlayerId = 'test-player-simple';

  beforeEach(() => {
    powerUpManager = new PowerUpManager();
    powerUpManager.resetPlayerInventory(testPlayerId);
  });

  it('should create power-up manager successfully', () => {
    expect(powerUpManager).toBeDefined();
    expect(powerUpManager instanceof PowerUpManager).toBe(true);
  });

  it('should get player inventory', () => {
    const inventory = powerUpManager.getPlayerInventory(testPlayerId);
    
    expect(inventory).toBeDefined();
    expect(inventory.playerId).toBe(testPlayerId);
    expect(inventory.powerUps.has(PowerUpType.FIFTY_FIFTY)).toBe(true);
    expect(inventory.powerUps.get(PowerUpType.FIFTY_FIFTY)).toBe(3);
  });

  it('should get available power-ups', () => {
    const available = powerUpManager.getAvailablePowerUps(testPlayerId);
    
    expect(Array.isArray(available)).toBe(true);
    expect(available.length).toBeGreaterThan(0);
    expect(available.some((pu: any) => pu.type === PowerUpType.FIFTY_FIFTY)).toBe(true);
  });

  it('should use 50/50 power-up successfully', () => {
    const result = powerUpManager.usePowerUp(testPlayerId, PowerUpType.FIFTY_FIFTY, {
      question: {
        id: 'test-q1',
        question: 'Test question?',
        answer: 'Test answer',
        category: 'Test',
        difficulty: 'Easy',
      },
    });
    
    expect(result.success).toBe(true);
    expect(result.type).toBe(PowerUpType.FIFTY_FIFTY);
    expect(result.message).toBe('Two wrong answers removed!');
    expect(result.effect).toBeDefined();
  });
});
