/**
 * HUD provides score and metadata for rendering.
 */
export class HUD {
  constructor(storageKey = "tetris_high_score") {
    this.storageKey = storageKey;
    this.highScore = this.loadHighScore();
  }

  loadHighScore() {
    try {
      const value = window.localStorage.getItem(this.storageKey);
      return value ? Number(value) : 0;
    } catch (error) {
      return 0;
    }
  }

  saveHighScore(value) {
    try {
      window.localStorage.setItem(this.storageKey, String(value));
    } catch (error) {
      // Ignore storage errors.
    }
  }

  update(game) {
    if (game.score.score > this.highScore) {
      this.highScore = game.score.score;
      this.saveHighScore(this.highScore);
    }
  }

  getStats(game) {
    return {
      score: game.score.score,
      level: game.score.level,
      lines: game.score.lines,
      combo: game.score.combo,
      highScore: this.highScore,
    };
  }
}
