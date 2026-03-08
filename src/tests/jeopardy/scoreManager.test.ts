import { ScoreManager } from '../../services/scoreManager';
import { Database } from '../../services/database';

// Mock Database
jest.mock('../../services/database');

describe('ScoreManager Jeopardy Trivia Tests', () => {
  const mockDb = {
    execAsync: jest.fn(),
    getFirstAsync: jest.fn(),
    runAsync: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (Database.getInstance as jest.Mock).mockReturnValue(mockDb);
  });

  describe('Jeopardy Trivia Score Management', () => {
    describe('getJeopardyTriviaScore', () => {
      it('should return jeopardy trivia score from database', async () => {
        const expectedScore = 1500;
        mockDb.getFirstAsync.mockResolvedValue({ jeopardyTrivScore: expectedScore });

        const result = await ScoreManager.getJeopardyTriviaScore();

        expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
          "SELECT jeopardyTrivScore FROM scores WHERE id = 'scores'"
        );
        expect(result).toBe(expectedScore);
      });

      it('should return 0 when no jeopardy trivia score exists', async () => {
        mockDb.getFirstAsync.mockResolvedValue(null);

        const result = await ScoreManager.getJeopardyTriviaScore();

        expect(result).toBe(0);
      });

      it('should return 0 when database error occurs', async () => {
        mockDb.getFirstAsync.mockRejectedValue(new Error('Database error'));

        const result = await ScoreManager.getJeopardyTriviaScore();

        expect(result).toBe(0);
      });
    });

    describe('saveJeopardyTriviaScore', () => {
      it('should save jeopardy trivia score to database', async () => {
        const score = 2000;

        await ScoreManager.saveJeopardyTriviaScore(score);

        expect(mockDb.runAsync).toHaveBeenCalledWith(
          "UPDATE scores SET jeopardyTrivScore = ? WHERE id = 'scores'",
          [score]
        );
      });

      it('should throw error when save fails', async () => {
        const score = 1000;
        mockDb.runAsync.mockRejectedValue(new Error('Save failed'));

        await expect(ScoreManager.saveJeopardyTriviaScore(score)).rejects.toThrow('Save failed');
      });
    });

    describe('resetJeopardyTriviaScore', () => {
      it('should reset jeopardy trivia score to 0', async () => {
        await ScoreManager.resetJeopardyTriviaScore();

        expect(mockDb.runAsync).toHaveBeenCalledWith(
          "UPDATE scores SET jeopardyTrivScore = ? WHERE id = 'scores'",
          [0]
        );
      });

      it('should throw error when reset fails', async () => {
        mockDb.runAsync.mockRejectedValue(new Error('Reset failed'));

        await expect(ScoreManager.resetJeopardyTriviaScore()).rejects.toThrow('Reset failed');
      });
    });
  });

  describe('Regular Jeopardy Score Management', () => {
    describe('getJeopScore', () => {
      it('should return regular jeopardy score from database', async () => {
        const expectedScore = 800;
        mockDb.getFirstAsync.mockResolvedValue({ jeopScore: expectedScore });

        const result = await ScoreManager.getJeopScore();

        expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
          "SELECT jeopScore FROM scores WHERE id = 'scores'"
        );
        expect(result).toBe(expectedScore);
      });

      it('should return 0 when no regular jeopardy score exists', async () => {
        mockDb.getFirstAsync.mockResolvedValue(null);

        const result = await ScoreManager.getJeopScore();

        expect(result).toBe(0);
      });
    });

    describe('saveJeopScore', () => {
      it('should save regular jeopardy score to database', async () => {
        const score = 1200;

        await ScoreManager.saveJeopScore(score);

        expect(mockDb.runAsync).toHaveBeenCalledWith(
          "UPDATE scores SET jeopScore = ? WHERE id = 'scores'",
          [score]
        );
      });
    });

    describe('resetJeopScore', () => {
      it('should reset regular jeopardy score to 0', async () => {
        await ScoreManager.resetJeopScore();

        expect(mockDb.runAsync).toHaveBeenCalledWith(
          "UPDATE scores SET jeopScore = ? WHERE id = 'scores'",
          [0]
        );
      });
    });
  });

  describe('Score Integration Tests', () => {
    it('should handle multiple score types independently', async () => {
      // Set up different return values for different queries
      mockDb.getFirstAsync
        .mockResolvedValueOnce({ jeopardyTrivScore: 1500 }) // First call for jeopardy trivia
        .mockResolvedValueOnce({ jeopScore: 800 }) // Second call for regular jeopardy
        .mockResolvedValueOnce({ triviaScore: 600 }); // Third call for trivia

      const jeopardyTriviaScore = await ScoreManager.getJeopardyTriviaScore();
      const jeopardyScore = await ScoreManager.getJeopScore();
      const triviaScore = await ScoreManager.getTriviaScore();

      expect(jeopardyTriviaScore).toBe(1500);
      expect(jeopardyScore).toBe(800);
      expect(triviaScore).toBe(600);
    });

    it('should save different score types independently', async () => {
      await ScoreManager.saveJeopardyTriviaScore(2000);
      await ScoreManager.saveJeopScore(1500);
      await ScoreManager.saveTriviaScore(1000);

      expect(mockDb.runAsync).toHaveBeenCalledTimes(3);
      expect(mockDb.runAsync).toHaveBeenNthCalledWith(
        1,
        "UPDATE scores SET jeopardyTrivScore = ? WHERE id = 'scores'",
        [2000]
      );
      expect(mockDb.runAsync).toHaveBeenNthCalledWith(
        2,
        "UPDATE scores SET jeopScore = ? WHERE id = 'scores'",
        [1500]
      );
      expect(mockDb.runAsync).toHaveBeenNthCalledWith(
        3,
        "UPDATE scores SET triviaScore = ? WHERE id = 'scores'",
        [1000]
      );
    });

    it('should reset all jeopardy-related scores', async () => {
      await ScoreManager.resetJeopardyTriviaScore();
      await ScoreManager.resetJeopScore();

      expect(mockDb.runAsync).toHaveBeenCalledTimes(2);
      expect(mockDb.runAsync).toHaveBeenNthCalledWith(
        1,
        "UPDATE scores SET jeopardyTrivScore = ? WHERE id = 'scores'",
        [0]
      );
      expect(mockDb.runAsync).toHaveBeenNthCalledWith(
        2,
        "UPDATE scores SET jeopScore = ? WHERE id = 'scores'",
        [0]
      );
    });
  });

  describe('Database Table Initialization', () => {
    it('should initialize table with jeopardy trivia score column', async () => {
      mockDb.getFirstAsync.mockResolvedValue({ count: 0 });

      await ScoreManager.initialize();

      expect(mockDb.execAsync).toHaveBeenCalledWith(
        expect.stringContaining('jeopardyTrivScore INTEGER DEFAULT 0')
      );
    });

    it('should insert default values for jeopardy trivia scores', async () => {
      mockDb.getFirstAsync.mockResolvedValue({ count: 0 });

      await ScoreManager.initialize();

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringMatching(/INSERT INTO.*VALUES.*\?, \?, \?, \?, \?, \?/),
        expect.arrayContaining(['scores', 0, 0, 0, 0, 0])
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative jeopardy trivia scores', async () => {
      const negativeScore = -500;

      await ScoreManager.saveJeopardyTriviaScore(negativeScore);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        "UPDATE scores SET jeopardyTrivScore = ? WHERE id = 'scores'",
        [negativeScore]
      );
    });

    it('should handle very large jeopardy trivia scores', async () => {
      const largeScore = 999999;

      await ScoreManager.saveJeopardyTriviaScore(largeScore);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        "UPDATE scores SET jeopardyTrivScore = ? WHERE id = 'scores'",
        [largeScore]
      );
    });

    it('should handle zero jeopardy trivia scores', async () => {
      const zeroScore = 0;

      await ScoreManager.saveJeopardyTriviaScore(zeroScore);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        "UPDATE scores SET jeopardyTrivScore = ? WHERE id = 'scores'",
        [zeroScore]
      );
    });
  });
});
