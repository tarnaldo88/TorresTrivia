import { GameRound, GameAction, TeamName } from '../types/index';

/**
 * GameState manages the current round state, score tracking, and round configuration
 */
export class GameState {
  private currentRound: GameRound | null = null;
  private roundDuration: number = 60; // default 60 seconds
  private teams: TeamName[] = ['Shazam', 'Team B', 'Team C', 'Team D'];

  getTeamNames(): TeamName[] {
    return this.teams;
  }

  /**
   * Get the team name for a given index
   * @param index - The index of the team (0-3)
   */
  getTeamName(index: number): TeamName | null {
    if (index >= 0 && index < this.teams.length) {
      return this.teams[index];
    }
    return null;
  }

  /**
   * Set the team name for a given index
   * @param index - The index of the team (0-3)
   * @param name - The new team name
   */
  setTeamName(index: number, name: TeamName): void {
    if (index >= 0 && index < this.teams.length) {
      this.teams[index] = name;
    }
  }

  /**
   * Create a new round with optional custom duration
   * @param duration - Round duration in seconds (defaults to 60)
   */
  startRound(duration?: number): GameRound {
    const roundDuration = duration && duration > 0 ? duration : 60;

    this.currentRound = {
      id: this.generateRoundId(),
      duration: roundDuration,
      startTime: Date.now(),
      currentScore: 0,
      isActive: true,
      itemsUsed: [],
    };

    this.roundDuration = roundDuration;
    return this.currentRound;
  }

  /**
   * End the current round
   */
  endRound(): GameRound | null {
    if (this.currentRound) {
      this.currentRound.isActive = false;
    }
    return this.currentRound;
  }

  /**
   * Pause the current round
   */
  pauseRound(): GameRound | null {
    if (this.currentRound) {
      this.currentRound.isActive = false;
    }
    return this.currentRound;
  }

  /**
   * Resume the current round
   */
  resumeRound(): GameRound | null {
    if (this.currentRound) {
      this.currentRound.isActive = true;
    }
    return this.currentRound;
  }

  /**
   * Register a correct guess action and increment score
   * @param itemId - The ID of the item that was guessed correctly
   */
  // registerCorrectGuess(itemId: string): GameRound | null {
  //   if (!this.currentRound || !this.currentRound.isActive) {
  //     return null;
  //   }

  //   this.currentRound.currentScore += 1;
  //   this.currentRound.itemsUsed.push(itemId);

  //   return this.currentRound;
  // }

  /**
   * Register a correct guess action and increment score
   * @param itemId - The ID of the item that was guessed correctly
   * @param team - The name of the team that guessed correctly
   */
  registerCorrectGuess(itemId: string, team: TeamName): GameRound | null {
    if (!this.currentRound || !this.currentRound.isActive) {
      return null;
    }

    const teamIndex = this.teams.indexOf(team);
    if (teamIndex >= 0) {
      this.currentRound.currentScore += 1;
      this.currentRound.itemsUsed.push(itemId);
      this.currentRound.teamsScore[teamIndex] = (this.currentRound.teamsScore[teamIndex] || 0) + 1;
    }

    return this.currentRound;
  }

  

  /**
   * Register a skip action (does not modify score)
   * @param itemId - The ID of the item that was skipped
   */
  registerSkip(itemId: string): GameRound | null {
    if (!this.currentRound || !this.currentRound.isActive) {
      return null;
    }

    this.currentRound.itemsUsed.push(itemId);

    return this.currentRound;
  }

  /**
   * Get the current round
   */
  getCurrentRound(): GameRound | null {
    return this.currentRound;
  }

  /**
   * Get the current score
   */
  getCurrentScore(): number {
    return this.currentRound ? this.currentRound.currentScore : 0;
  }

  /**
   * Get the current round duration
   */
  getRoundDuration(): number {
    return this.roundDuration;
  }

  /**
   * Check if a round is currently active
   */
  isRoundActive(): boolean {
    return this.currentRound ? this.currentRound.isActive : false;
  }

  /**
   * Get the elapsed time in the current round (in milliseconds)
   */
  getElapsedTime(): number {
    if (!this.currentRound) {
      return 0;
    }
    return Date.now() - this.currentRound.startTime;
  }

  /**
   * Get the remaining time in the current round (in milliseconds)
   */
  getRemainingTime(): number {
    if (!this.currentRound) {
      return 0;
    }
    const elapsedMs = this.getElapsedTime();
    const totalMs = this.currentRound.duration * 1000;
    const remaining = totalMs - elapsedMs;
    return remaining > 0 ? remaining : 0;
  }

  /**
   * Check if the current round has expired
   */
  hasRoundExpired(): boolean {
    if (!this.currentRound) {
      return false;
    }
    return this.getRemainingTime() <= 0;
  }

  /**
   * Get the list of items used in the current round
   */
  getItemsUsed(): string[] {
    return this.currentRound ? [...this.currentRound.itemsUsed] : [];
  }

  /**
   * Reset the game state (for starting a new round)
   */
  reset(): void {
    this.currentRound = null;
    this.roundDuration = 60;
  }

  /**
   * Generate a unique round ID
   */
  private generateRoundId(): string {
    return `round_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get the current score for a given team
   * @param team - The name of the team
   */
  getCurrentTeamScore(team: TeamName): number {
    const teamIndex = this.teams.indexOf(team);
    return this.currentRound ? (this.currentRound.teamsScore[teamIndex] || 0) : 0;
  }

}
