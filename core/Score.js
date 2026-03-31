/**
 * Score tracks points, level progression, and combos.
 */
import { GAME_CONFIG } from "../config/gameConfig.js";

export class Score {
  constructor() {
    this.reset();
  }

  reset() {
    this.score = 0;
    this.level = 0;
    this.lines = 0;
    this.combo = -1;
  }

  addLines(count) {
    if (count > 0) {
      const base = GAME_CONFIG.scoring.lineClear[count] || 0;
      this.score += base * (this.level + 1);
      this.combo = Math.max(this.combo + 1, 0);
      if (this.combo > 0) {
        this.score += this.combo * GAME_CONFIG.scoring.comboBonus;
      }
      this.lines += count;
      this.level = Math.floor(this.lines / GAME_CONFIG.scoring.linesPerLevel);
    } else {
      this.combo = -1;
    }
  }

  addSoftDrop(cells) {
    this.score += cells * GAME_CONFIG.scoring.softDrop;
  }

  addHardDrop(cells) {
    this.score += cells * GAME_CONFIG.scoring.hardDrop;
  }

  getDropInterval() {
    const speed = GAME_CONFIG.timing.baseDropInterval * Math.pow(0.8, this.level);
    return Math.max(GAME_CONFIG.timing.minDropInterval, speed);
  }
}
