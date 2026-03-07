import { ScoreManager } from '../../services/scoreManager';

describe('ScoreManager Basic Tests', () => {
  it('should have setHighScore static method', () => {
    expect(typeof ScoreManager.setHighScore).toBe('function');
  });

  it('should have setLastScore static method', () => {
    expect(typeof ScoreManager.setLastScore).toBe('function');
  });

  it('should have getHighScore static method', () => {
    expect(typeof ScoreManager.getHighScore).toBe('function');
  });

  it('should have getLastScore static method', () => {
    expect(typeof ScoreManager.getLastScore).toBe('function');
  });

  it('should have instance methods', () => {
    const scoreManager = new ScoreManager();
    expect(typeof scoreManager.addPoints).toBe('function');
    expect(typeof scoreManager.subtractPoints).toBe('function');
    expect(typeof scoreManager.getCurrentScore).toBe('function');
    expect(typeof scoreManager.resetScore).toBe('function');
  });

  it('should initialize with zero score', () => {
    const scoreManager = new ScoreManager();
    expect(scoreManager.getCurrentScore()).toBe(0);
  });

  it('should add points correctly', () => {
    const scoreManager = new ScoreManager();
    scoreManager.addPoints(10);
    expect(scoreManager.getCurrentScore()).toBe(10);
  });

  it('should subtract points correctly', () => {
    const scoreManager = new ScoreManager();
    scoreManager.addPoints(10);
    scoreManager.subtractPoints(3);
    expect(scoreManager.getCurrentScore()).toBe(7);
  });

  it('should not go below zero', () => {
    const scoreManager = new ScoreManager();
    scoreManager.addPoints(5);
    scoreManager.subtractPoints(10);
    expect(scoreManager.getCurrentScore()).toBe(0);
  });

  it('should reset score', () => {
    const scoreManager = new ScoreManager();
    scoreManager.addPoints(100);
    scoreManager.resetScore();
    expect(scoreManager.getCurrentScore()).toBe(0);
  });
});
